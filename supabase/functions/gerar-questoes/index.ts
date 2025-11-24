import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Gerar questões usando OpenAI GPT-5
    const prompt = `Gere ${numQuestoes} questões de múltipla escolha sobre ${tema} - ${materia}${banca ? ` no estilo da banca ${banca}` : ''}.

Cada questão deve ter:
- Um enunciado claro e objetivo
- 5 alternativas (A, B, C, D, E)
- Uma resposta correta
- Uma explicação detalhada

Retorne APENAS um JSON array com este formato exato, sem texto adicional:
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

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar questões de concursos e vestibulares. Retorne apenas JSON válido, sem texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro OpenAI:', aiResponse.status, errorText);
      throw new Error(`Erro na API OpenAI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse o JSON retornado
    let questoesGeradas;
    try {
      // Tenta parsear diretamente como array
      questoesGeradas = JSON.parse(content);
    } catch {
      // Se falhar, pode estar dentro de um objeto
      const parsed = JSON.parse(content);
      questoesGeradas = Array.isArray(parsed) ? parsed : parsed.questoes || [];
    }

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
