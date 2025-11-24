import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { simuladoId, tema, materia, banca, numQuestoes } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Gerar questões usando Lovable AI
    const prompt = `Gere ${numQuestoes} questões de múltipla escolha sobre ${tema} - ${materia}${banca ? ` no estilo da banca ${banca}` : ''}.

Cada questão deve ter:
- Um enunciado claro e objetivo
- 5 alternativas (A, B, C, D, E)
- Uma resposta correta
- Uma explicação detalhada

Retorne um JSON array com este formato:
[
  {
    "enunciado": "texto da questão",
    "alternativas": {
      "A": "texto alternativa A",
      "B": "texto alternativa B",
      "C": "texto alternativa C",
      "D": "texto alternativa D",
      "E": "texto alternativa E"
    },
    "resposta_correta": "A",
    "explicacao": "explicação detalhada da resposta"
  }
]`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const aiData = await aiResponse.json();
    const questoesGeradas = JSON.parse(aiData.choices[0].message.content);

    // Inserir questões no banco
    const questoesParaInserir = questoesGeradas.map((q: any, index: number) => ({
      simulado_id: simuladoId,
      ordem: index + 1,
      enunciado: q.enunciado,
      alternativas: q.alternativas,
      resposta_correta: q.resposta_correta,
      explicacao: q.explicacao
    }));

    const { error } = await supabaseClient
      .from('questoes')
      .insert(questoesParaInserir);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, questoes: questoesParaInserir.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
