import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  assuntoId: string;
  userId: string;
  nomeAssunto: string;
  nomeMateria: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { assuntoId, userId, nomeAssunto, nomeMateria }: RequestBody = await req.json();

    if (!assuntoId || !userId || !nomeAssunto || !nomeMateria) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios faltando" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    /* Verificar se já existe apostila para este assunto */
    const { data: apostilaExistente } = await supabaseClient
      .from("apostilas")
      .select("id, conteudo")
      .eq("assunto_id", assuntoId)
      .single();

    if (apostilaExistente) {
      return new Response(
        JSON.stringify({
          success: true,
          apostila: apostilaExistente,
          message: "Apostila já existe para este assunto",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    /* Verificar saldo de Gabaritos */
    const { data: gabaritosData } = await supabaseClient
      .from("user_gabaritos")
      .select("gabaritos")
      .eq("user_id", userId)
      .single();

    const saldoAtual = gabaritosData?.gabaritos ?? 0;
    const custoApostila = 5;

    if (saldoAtual < custoApostila) {
      return new Response(
        JSON.stringify({
          error: "Saldo insuficiente",
          required: custoApostila,
          available: saldoAtual,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    /* Gerar apostila com OpenAI */
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    const prompt = `Você é um professor especializado em criar materiais didáticos para concursos públicos e vestibulares.

Crie uma apostila completa e detalhada sobre o seguinte assunto:

**Matéria:** ${nomeMateria}
**Assunto:** ${nomeAssunto}

A apostila deve conter:

1. **Introdução** - Apresentação do assunto e sua importância
2. **Conceitos Fundamentais** - Definições e conceitos básicos essenciais
3. **Desenvolvimento Teórico** - Explicação detalhada do conteúdo
4. **Exemplos Práticos** - Exemplos resolvidos passo a passo
5. **Dicas e Macetes** - Estratégias para memorização e resolução
6. **Resumo** - Síntese dos pontos principais
7. **Pontos de Atenção** - Erros comuns e como evitá-los

**Requisitos:**
- Linguagem clara e didática
- Conteúdo completo e aprofundado
- Exemplos práticos e aplicáveis
- Formatação em Markdown
- Mínimo de 2000 palavras
- Foco em preparação para concursos/vestibulares

**IMPORTANTE:**
- NÃO inclua textos introdutórios sobre a estrutura ou formato da apostila
- NÃO escreva frases como "Esta apostila contém..." ou "O formato Markdown facilita..."
- Vá direto ao conteúdo começando pelo título principal
- Comece imediatamente com "# Apostila de [Assunto]"

Forneça a apostila completa em formato Markdown.`;

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um professor especializado em criar materiais didáticos de alta qualidade para concursos públicos e vestibulares.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const openAIData = await openAIResponse.json();
    const conteudoApostila = openAIData.choices[0]?.message?.content;

    if (!conteudoApostila) {
      throw new Error("Falha ao gerar conteúdo da apostila");
    }

    /* Deduzir Gabaritos */
    const { error: deductError } = await supabaseClient.rpc("deduct_gabaritos", {
      p_user_id: userId,
      p_amount: custoApostila,
      p_description: `Geração de apostila: ${nomeMateria} - ${nomeAssunto}`,
    });

    if (deductError) {
      throw new Error(`Erro ao deduzir Gabaritos: ${deductError.message}`);
    }

    /* Salvar apostila no banco */
    const { data: apostilaCriada, error: apostilaError } = await supabaseClient
      .from("apostilas")
      .insert({
        assunto_id: assuntoId,
        conteudo: conteudoApostila,
        status: "gerada",
        custo_gabaritos: custoApostila,
      })
      .select()
      .single();

    if (apostilaError) {
      throw new Error(`Erro ao salvar apostila: ${apostilaError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        apostila: apostilaCriada,
        gabaritos_debitados: custoApostila,
        message: "Apostila gerada com sucesso",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao gerar apostila:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
