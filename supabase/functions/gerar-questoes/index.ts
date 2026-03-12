import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TopicGroup {
  tema: string;
  materia: string;
  quantidade: number;
}

const normalizeAlternativas = (alternativas: Record<string, unknown>) => {
  const orderedKeys = ["A", "B", "C", "D", "E"];
  return orderedKeys.reduce<Record<string, string>>((acc, key) => {
    const rawValue = alternativas[key] ?? alternativas[key.toLowerCase()];
    acc[key] = typeof rawValue === "string" ? rawValue.trim() : "";
    return acc;
  }, {});
};

const hasDuplicateAlternativas = (alternativas: Record<string, string>) => {
  const values = Object.values(alternativas)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set(values).size !== values.length;
};

serve(async (req: Request) => {
  console.log('Request recebida:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Body recebido:', JSON.stringify(body));
    
    const {
      simuladoId,
      titulo,
      escolaridade,
      dificuldade,
      banca,
      numQuestoes,
      topicGroups,
      userId
    } = body;

    const validTopicGroups = Array.isArray(topicGroups)
      ? topicGroups.filter((group: TopicGroup) =>
          group?.tema &&
          group?.materia &&
          Number(group?.quantidade) > 0
        )
      : [];
    
    if (!simuladoId || !titulo || !escolaridade || !dificuldade || !numQuestoes || !userId || validTopicGroups.length === 0) {
      throw new Error("Campos obrigatórios faltando para gerar o simulado");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('SUPABASE_URL definida:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY definida:', !!supabaseServiceKey);

    const supabaseClient = createClient(
      supabaseUrl ?? '',
      supabaseServiceKey ?? ''
    );

    // Validate user subscription status
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_status, trial_ends_at')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('Usuário não encontrado');
    }

    // Check if trial has expired or payment failed
    if (profile.subscription_status === 'trial' && profile.trial_ends_at) {
      const trialEndDate = new Date(profile.trial_ends_at);
      if (new Date() > trialEndDate) {
        throw new Error('Seu período de teste expirou. Atualize seu plano para continuar.');
      }
    } else if (profile.subscription_status === 'past_due') {
      throw new Error('Seu pagamento foi recusado. Atualize seu método de pagamento para continuar.');
    } else if (profile.subscription_status === 'cancelled') {
      throw new Error('Sua assinatura foi cancelada. Assine novamente para continuar.');
    }

    const distribuicao = validTopicGroups
      .map((group: TopicGroup, index: number) => `${index + 1}. assunto: ${group.tema}; matéria: ${group.materia}; quantidade: ${group.quantidade}`)
      .join('\n');

    const prompt = `Monte um simulado inédito com título "${titulo}".

Parâmetros obrigatórios:
- Escolaridade: ${escolaridade}
- Nível de dificuldade: ${dificuldade}
- Número total de questões: ${numQuestoes}
${banca ? `- Estilo da prova: ${banca}` : '- Estilo da prova: livre, sem banca específica'}

Distribuição obrigatória das questões por bloco:
${distribuicao}

Regras obrigatórias de geração:
- Gere exatamente a quantidade de questões pedida em cada bloco.
- Crie apenas questões inéditas, sem repetir uma mesma questão no simulado.
- Não repita alternativas com o mesmo texto dentro da mesma questão.
- Cada questão deve ter exatamente 5 alternativas: A, B, C, D e E.
- Informe apenas uma resposta correta por questão.
- Antes de consolidar cada questão, consulte conhecimento atualizado e fontes confiáveis da internet para evitar erros factuais.
- Baseie o conteúdo em fontes confiáveis e conhecimento consolidado.
- Não invente leis, datas, artigos, conceitos, fórmulas ou precedentes.
- Se o estilo de prova foi informado, adapte linguagem e nível de cobrança a esse estilo.
- Respeite a escolaridade e a dificuldade solicitadas.
- Distribua os assuntos sem sobreposição desnecessária.
- Não repita o mesmo fato, caso, exemplo ou contexto em enunciados diferentes.
- A explicação deve justificar por que a alternativa correta está certa e por que as demais estão erradas, de forma objetiva.

Formato obrigatório de saída:
Retorne APENAS um JSON válido no formato:
{
  "questoes": [
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
  ]
}`;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    console.log('OPENAI_API_KEY definida:', !!OPENAI_API_KEY);
    
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
        model: 'gpt-4o',
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
        max_tokens: 4000,
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
    
    console.log('Resposta OpenAI:', content.substring(0, 500));
    
    // Parse o JSON retornado - OpenAI pode retornar objeto ou array
    let questoesGeradas: any[] = [];
    try {
      const parsed = JSON.parse(content);
      console.log('Tipo do parse:', typeof parsed, Array.isArray(parsed));
      
      if (Array.isArray(parsed)) {
        questoesGeradas = parsed;
      } else if (parsed.questoes && Array.isArray(parsed.questoes)) {
        questoesGeradas = parsed.questoes;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questoesGeradas = parsed.questions;
      } else {
        // Se for um objeto único, converter para array
        questoesGeradas = [parsed];
      }
    } catch (e) {
      console.error('Erro ao parsear JSON:', e);
      throw new Error('Resposta da OpenAI não é JSON válido');
    }
    
    console.log('Questões geradas:', questoesGeradas.length);
    console.log('Primeira questão:', JSON.stringify(questoesGeradas[0], null, 2));
    
    if (!Array.isArray(questoesGeradas) || questoesGeradas.length === 0) {
      throw new Error('Nenhuma questão foi gerada');
    }

    // Validar e normalizar cada questão
    const questoesValidadas = questoesGeradas.map((q: any, index: number) => {
      console.log(`Validando questão ${index + 1}:`, JSON.stringify(q, null, 2));
      
      // Garantir que temos os campos necessários
      const enunciado = q.enunciado || q.question || q.texto || q.text;
      const alternativas = q.alternativas || q.options || q.choices || q.alternatives || {};
      const resposta_correta = q.resposta_correta || q.resposta || q.correct_answer || q.answer;
      const explicacao = q.explicacao || q.explicacao || q.explanation || null;
      const alternativasNormalizadas = normalizeAlternativas(alternativas);
      
      if (!enunciado) {
        throw new Error(`Questão ${index + 1} não tem enunciado`);
      }
      if (!alternativas || Object.keys(alternativas).length === 0) {
        throw new Error(`Questão ${index + 1} não tem alternativas`);
      }
      if (Object.values(alternativasNormalizadas).some((alternativa) => !alternativa)) {
        throw new Error(`Questão ${index + 1} não possui 5 alternativas válidas`);
      }
      if (hasDuplicateAlternativas(alternativasNormalizadas)) {
        throw new Error(`Questão ${index + 1} possui alternativas repetidas`);
      }
      if (!resposta_correta) {
        throw new Error(`Questão ${index + 1} não tem resposta_correta`);
      }
      
      return {
        simulado_id: simuladoId,
        ordem: index + 1,
        enunciado: enunciado,
        alternativas: alternativasNormalizadas,
        resposta_correta: resposta_correta,
        explicacao: explicacao
      };
    });

    if (questoesValidadas.length !== Number(numQuestoes)) {
      throw new Error(`A IA retornou ${questoesValidadas.length} questões, mas eram esperadas ${numQuestoes}`);
    }

    const normalizedEnunciados = questoesValidadas.map((questao) =>
      questao.enunciado.trim().toLowerCase().replace(/\s+/g, ' ')
    );

    if (new Set(normalizedEnunciados).size !== normalizedEnunciados.length) {
      throw new Error('A IA retornou questões repetidas no simulado');
    }

    console.log('Questões validadas:', questoesValidadas.length);
    console.log('Primeira validada:', JSON.stringify(questoesValidadas[0], null, 2));

    // Inserir questões no banco
    const { error } = await supabaseClient
      .from('questoes')
      .insert(questoesValidadas);

    if (error) {
      console.error('Erro ao inserir no banco:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, questoes: questoesValidadas.length }),
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
