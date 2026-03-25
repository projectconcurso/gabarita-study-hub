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

// Sistema de imagens removido - usando apenas visualizações ASCII/texto

const processEnunciadoWithImages = async (enunciado: string, apiKey: string): Promise<{ enunciado: string; imageUrl: string | null }> => {
  const visualRegex = /\[(IMAGEM|GRÁFICO|GRAFICO|TABELA|CHARGE|MAPA|ESQUEMA):\s*([^\]]+)\]/i;
  const match = enunciado.match(visualRegex);
  
  if (!match) {
    return { enunciado, imageUrl: null };
  }

  const visualType = match[1].toUpperCase();
  const description = match[2].trim();
  
  // Para GRÁFICO e TABELA, manter a tag original (será processada no frontend)
  // Para IMAGEM/CHARGE/MAPA/ESQUEMA, a URL já vem no enunciado do GPT
  return { enunciado, imageUrl: null };
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

    // Validar Gabaritos do usuário
    const { data: userGabaritos, error: gabaritosError } = await supabaseClient
      .from('user_gabaritos')
      .select('gabaritos')
      .eq('user_id', userId)
      .single();

    if (gabaritosError || !userGabaritos) {
      throw new Error('Erro ao verificar saldo de Gabaritos');
    }

    // Calcular custo baseado na quantidade de questões
    let custoGabaritos = 0;
    if (numQuestoes >= 1 && numQuestoes <= 20) {
      custoGabaritos = 5;
    } else if (numQuestoes >= 21 && numQuestoes <= 40) {
      custoGabaritos = 10;
    } else if (numQuestoes >= 41 && numQuestoes <= 60) {
      custoGabaritos = 15;
    } else if (numQuestoes >= 61 && numQuestoes <= 80) {
      custoGabaritos = 20;
    } else {
      throw new Error('Quantidade de questões inválida. Escolha entre 1 e 80 questões.');
    }

    // Verificar se usuário tem Gabaritos suficientes
    if (userGabaritos.gabaritos < custoGabaritos) {
      throw new Error(`Gabaritos insuficientes. Você precisa de ${custoGabaritos} Gabaritos para criar este simulado, mas tem apenas ${userGabaritos.gabaritos}.`);
    }

    console.log(`Custo do simulado: ${custoGabaritos} Gabaritos | Saldo do usuário: ${userGabaritos.gabaritos}`);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    console.log('OPENAI_API_KEY definida:', !!OPENAI_API_KEY);
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const distribuicao = validTopicGroups
      .map((group: TopicGroup, index: number) => `${index + 1}. assunto: ${group.tema}; matéria: ${group.materia}; quantidade: ${group.quantidade}`)
      .join('\n');
    
    // Instruções para elementos visuais ASCII/texto
    const visualInstructions = `

ELEMENTOS VISUAIS DISPONÍVEIS (use quando apropriado para a matéria):

1. GRÁFICOS E TABELAS (para todas as matérias quando relevante):
   - Use [GRAFICO_DATA:{...}] para gráficos de linha, barra ou pizza
   - Use [TABELA_DATA:{...}] para dados tabulares

2. CHARGES ESTILO QUADRINHO (para Português, Redação, Interpretação):
   - Use [CHARGE_ASCII:...] para criar diálogos visuais estilo HQ
   - Formato: EMOJI Personagem: "Fala"
   - Será renderizado como quadrinho com balões de fala
   
   - Exemplo sobre redes sociais:
   
   [CHARGE_ASCII:
   👤 Pessoa 1: "Bom dia! Como você está?"
   📱 Celular: "Visto às 09:23"
   👤 Pessoa 1: "Ah tá..."
   ]
   
   - Exemplo sobre política:
   
   [CHARGE_ASCII:
   🏛️ Político: "Prometo resolver TUDO!"
   👥 Povo: "Já ouvimos isso antes..."
   💰 Dinheiro: "Tchau tchau!"
   ]
   
   - Exemplo sobre meio ambiente:
   
   [CHARGE_ASCII:
   🌳 Árvore: "Socorro! Estão me cortando!"
   🪓 Machado: "É progresso, dizem eles..."
   🏭 Fábrica: "Precisamos crescer!"
   🌍 Terra: "E eu? Quem pensa em mim?"
   ]
   
   DICAS para charges efetivas:
   - Use 2-4 personagens (emoticons variados)
   - Crie diálogos curtos e impactantes
   - Use ironia, crítica social ou humor
   - Personagens podem ser: pessoas (👤👨👩), objetos (📱💰🪓), natureza (🌳🌍), instituições (🏛️🏭)
   - Balões de pensamento: use "..." no texto
   - Balões de grito: use "!" ou MAIÚSCULAS

3. MAPAS/RELEVO HTML (para Geografia):
   - Use [RELEVO_DATA:...] para perfis topográficos renderizados em HTML/CSS
   - Use [MAPA_DATA:...] para mapas temáticos renderizados em HTML/CSS
   
   - Exemplo de relevo (perfil topográfico):
   
   [RELEVO_DATA:{
     "tipo": "perfil",
     "titulo": "Perfil Topográfico do Brasil (Litoral-Interior)",
     "elementos": [
       {"nome": "Oceano Atlântico", "altitude": 0, "cor": "#4A90E2", "largura": 15},
       {"nome": "Planície Costeira", "altitude": 100, "cor": "#90EE90", "largura": 10},
       {"nome": "Serra do Mar", "altitude": 1200, "cor": "#8B4513", "largura": 8},
       {"nome": "Planalto Central", "altitude": 800, "cor": "#DEB887", "largura": 25},
       {"nome": "Planície Amazônica", "altitude": 150, "cor": "#228B22", "largura": 20}
     ]
   }]
   
   - Exemplo de mapa de vegetação:
   
   [MAPA_DATA:{
     "tipo": "vegetacao",
     "titulo": "Biomas do Brasil",
     "regioes": [
       {"nome": "Amazônia", "cor": "#006400", "icone": "🌴", "percentual": 49},
       {"nome": "Cerrado", "cor": "#DAA520", "icone": "🌾", "percentual": 24},
       {"nome": "Mata Atlântica", "cor": "#228B22", "icone": "🌳", "percentual": 13},
       {"nome": "Caatinga", "cor": "#D2691E", "icone": "🌵", "percentual": 10},
       {"nome": "Pampa", "cor": "#9ACD32", "icone": "�", "percentual": 2},
       {"nome": "Pantanal", "cor": "#4682B4", "icone": "💧", "percentual": 2}
     ]
   }]
   
   - Exemplo de mapa de clima:
   
   [MAPA_DATA:{
     "tipo": "clima",
     "titulo": "Climas do Brasil",
     "regioes": [
       {"nome": "Equatorial", "cor": "#006400", "icone": "☔", "caracteristica": "Quente e úmido"},
       {"nome": "Tropical", "cor": "#FFD700", "icone": "☀️", "caracteristica": "Quente com estações"},
       {"nome": "Semiárido", "cor": "#CD853F", "icone": "🌵", "caracteristica": "Quente e seco"},
       {"nome": "Subtropical", "cor": "#87CEEB", "icone": "❄️", "caracteristica": "Temperado"}
     ]
   }]
   
   - Exemplo de bacia hidrográfica:
   
   [MAPA_DATA:{
     "tipo": "hidrografia",
     "titulo": "Bacia Amazônica",
     "elementos": [
       {"tipo": "rio_principal", "nome": "Rio Amazonas", "extensao": "6.992 km"},
       {"tipo": "afluente", "nome": "Rio Negro", "lado": "esquerda"},
       {"tipo": "afluente", "nome": "Rio Madeira", "lado": "direita"},
       {"tipo": "nascente", "local": "Cordilheira dos Andes", "altitude": "5.597m"},
       {"tipo": "foz", "local": "Oceano Atlântico", "tipo_foz": "Delta"}
     ]
   }]

USE ESTES ELEMENTOS quando forem pedagogicamente relevantes para a questão!`;

    let bancaInstructions = '';
    if (banca) {
      bancaInstructions = `

INSTRUÇÕES ESPECÍFICAS PARA O ESTILO "${banca}":

${banca.toLowerCase().includes('enem') ? `
- Use linguagem clara, contextualizada e interdisciplinar
- Priorize situações-problema do cotidiano e temas sociais
- Inclua textos de apoio (charges, gráficos, trechos literários, notícias) quando apropriado
- Questões devem avaliar competências e habilidades, não apenas memorização
- Use enunciados longos e contextualizados
- Evite pegadinhas, priorize raciocínio e interpretação
- Quando pertinente, descreva elementos visuais como: "[IMAGEM: charge mostrando...]" ou "[GRÁFICO: dados sobre...]"
` : ''}

${banca.toLowerCase().includes('fgv') || banca.toLowerCase().includes('fundação getulio vargas') ? `
- Use linguagem formal e técnica
- Questões devem ser objetivas e diretas
- Priorize casos práticos e aplicação de conceitos
- Use tabelas, gráficos e dados estatísticos quando apropriado
- Exija conhecimento aprofundado e atualizado
- Inclua jurisprudência e legislação recente quando aplicável
- Quando pertinente, descreva elementos visuais como: "[TABELA: dados comparativos...]" ou "[GRÁFICO: evolução de...]"
` : ''}

${banca.toLowerCase().includes('oab') ? `
- Foque em Direito aplicado e prático
- Use casos concretos e situações jurídicas reais
- Cite artigos de lei, súmulas e jurisprudência
- Linguagem técnico-jurídica precisa
- Questões devem testar raciocínio jurídico, não decoreba
- Inclua situações que exijam interpretação de normas
- Quando pertinente, cite: "[Conforme art. X da Lei Y...]"
` : ''}

${banca.toLowerCase().includes('cespe') || banca.toLowerCase().includes('cebraspe') ? `
- Use afirmações para julgar como CERTO ou ERRADO (adapte para múltipla escolha)
- Linguagem formal e precisa
- Questões longas e detalhadas
- Exija conhecimento específico e atualizado
- Use dados, estatísticas e legislação
- Inclua pegadinhas sutis e detalhes importantes
- Quando pertinente, descreva: "[DADOS: segundo pesquisa de...]"
` : ''}

${banca.toLowerCase().includes('vunesp') ? `
- Linguagem clara e objetiva
- Questões de dificuldade progressiva
- Use situações práticas e aplicadas
- Inclua gráficos, tabelas e esquemas quando apropriado
- Foco em raciocínio lógico e interpretação
- Quando pertinente, descreva: "[ESQUEMA: representação de...]"
` : ''}

${!['enem', 'fgv', 'fundação getulio vargas', 'oab', 'cespe', 'cebraspe', 'vunesp'].some(b => banca.toLowerCase().includes(b)) ? `
- Adapte o estilo ao padrão da banca "${banca}"
- Pesquise características típicas dessa instituição
- Mantenha coerência com o nível de exigência esperado
- Use elementos visuais quando apropriado para a banca
` : ''}
`;
    }

    const prompt = `Monte um simulado inédito com título "${titulo}".

Parâmetros obrigatórios:
- Escolaridade: ${escolaridade}
- Nível de dificuldade: ${dificuldade}
- Número total de questões: ${numQuestoes}
${banca ? `- Estilo da prova: ${banca}` : '- Estilo da prova: livre, sem banca específica'}

Distribuição obrigatória das questões por bloco:
${distribuicao}
${visualInstructions}
${bancaInstructions}

Regras obrigatórias de geração:
- Gere exatamente a quantidade de questões pedida em cada bloco.
- Crie apenas questões inéditas, sem repetir uma mesma questão no simulado.
- Não repita alternativas com o mesmo texto dentro da mesma questão.
- Cada questão deve ter exatamente 5 alternativas: A, B, C, D e E.
- Informe apenas uma resposta correta por questão.
- SIGA RIGOROSAMENTE O ESTILO DA BANCA especificada, incluindo formato, linguagem e tipo de cobrança.
- Quando apropriado para a matéria e banca, INCLUA elementos visuais usando tags especiais:
  
  * Para GRÁFICOS, use JSON estruturado:
    [GRAFICO_DATA:{"tipo":"line|bar|pie","titulo":"título do gráfico","labels":["label1","label2","label3"],"datasets":[{"label":"nome da série","data":[valor1,valor2,valor3]}],"eixoX":"nome do eixo X","eixoY":"nome do eixo Y"}]
    Exemplo: [GRAFICO_DATA:{"tipo":"line","titulo":"Velocidade vs Tempo","labels":["0s","1s","2s","3s"],"datasets":[{"label":"Velocidade (m/s)","data":[0,10,20,30]}],"eixoX":"Tempo (s)","eixoY":"Velocidade (m/s)"}]
  
  * Para TABELAS, use JSON estruturado:
    [TABELA_DATA:{"titulo":"título da tabela","colunas":["coluna1","coluna2"],"linhas":[["dado1","dado2"],["dado3","dado4"]]}]
    Exemplo: [TABELA_DATA:{"titulo":"Produção Agrícola","colunas":["Região","Produção (ton)"],"linhas":[["Sul","1500"],["Sudeste","2300"],["Norte","800"]]}]
  
  * Para CHARGES em Português/Redação, use ASCII art:
    [CHARGE_ASCII:diálogo com emoticons e balões de fala]
    Exemplo: [CHARGE_ASCII:\n👤: "Texto pessoa 1"\n📱: "Texto objeto/tecnologia"\n]
  
  * Para RELEVO em Geografia, use JSON estruturado:
    [RELEVO_DATA:{"tipo":"perfil","titulo":"título","elementos":[{"nome":"nome","altitude":valor,"cor":"#hex","largura":percentual}]}]
    Exemplo: [RELEVO_DATA:{"tipo":"perfil","titulo":"Relevo Brasileiro","elementos":[{"nome":"Oceano","altitude":0,"cor":"#4A90E2","largura":15},{"nome":"Serra","altitude":1200,"cor":"#8B4513","largura":10}]}]
  
  * Para MAPAS temáticos em Geografia, use JSON estruturado:
    [MAPA_DATA:{"tipo":"vegetacao|clima|hidrografia","titulo":"título","regioes":[{"nome":"nome","cor":"#hex","icone":"emoji","percentual":valor}]}]
    Exemplo: [MAPA_DATA:{"tipo":"vegetacao","titulo":"Biomas","regioes":[{"nome":"Amazônia","cor":"#006400","icone":"🌴","percentual":49}]}]

- IMPORTANTE: 
  * Para gráficos e tabelas, use SEMPRE o formato JSON estruturado acima
  * Certifique-se de que o JSON está correto e válido
  * Inclua dados numéricos precisos e realistas
  * Para charges ASCII: use emoticons e símbolos simples para criar diálogos visuais
  * Para mapas ASCII: use símbolos como /\\, ~~~, ≈≈≈, ─, │, ┌, └ para representar elementos geográficos
- Antes de consolidar cada questão, consulte conhecimento atualizado e fontes confiáveis da internet para evitar erros factuais.
- Baseie o conteúdo em fontes confiáveis e conhecimento consolidado.
- Não invente leis, datas, artigos, conceitos, fórmulas ou precedentes.
- Respeite a escolaridade e a dificuldade solicitadas.
- Distribua os assuntos sem sobreposição desnecessária.
- Não repita o mesmo fato, caso, exemplo ou contexto em enunciados diferentes.
- A explicação deve justificar por que a alternativa correta está certa e por que as demais estão erradas, de forma objetiva.
- Para matérias como Geografia, História, Biologia, Sociologia, use mais elementos visuais.
- Para matérias como Matemática, Física, Química, inclua gráficos e tabelas de dados quando pertinente.

Formato obrigatório de saída:
Retorne APENAS um JSON válido no formato:
{
  "questoes": [
    {
      "enunciado": "texto da questão (pode incluir tags de elementos visuais como [IMAGEM: ...], [GRÁFICO: ...], etc.)",
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

    // Validar e normalizar cada questão (processamento assíncrono para gerar imagens)
    const questoesValidadas = await Promise.all(questoesGeradas.map(async (q: any, index: number) => {
      console.log(`Validando questão ${index + 1}:`, JSON.stringify(q, null, 2));
      
      // Garantir que temos os campos necessários
      let enunciado = q.enunciado || q.question || q.texto || q.text;
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
      
      // Processar enunciado para gerar imagens se necessário
      const { enunciado: processedEnunciado, imageUrl } = await processEnunciadoWithImages(enunciado, OPENAI_API_KEY!);
      
      return {
        simulado_id: simuladoId,
        ordem: index + 1,
        enunciado: processedEnunciado,
        alternativas: alternativasNormalizadas,
        resposta_correta: resposta_correta,
        explicacao: explicacao,
        image_url: imageUrl
      };
    }));

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
