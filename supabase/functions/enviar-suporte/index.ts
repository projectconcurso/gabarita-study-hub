import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  tipo: string;
  email: string;
  mensagem: string;
  userName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tipo, email, mensagem, userName }: RequestBody = await req.json();

    if (!tipo || !email || !mensagem) {
      return new Response(
        JSON.stringify({ error: "Tipo, email e mensagem são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Preparar o corpo do email
    const assunto = `[Gabarit] ${tipo} - ${userName || email}`;
    const corpoEmail = `
      <h2>Nova mensagem de ${tipo}</h2>
      <p><strong>De:</strong> ${userName || "Usuário"} (${email})</p>
      <p><strong>Tipo:</strong> ${tipo}</p>
      <hr />
      <h3>Mensagem:</h3>
      <p>${mensagem.replace(/\n/g, "<br />")}</p>
      <hr />
      <p><em>Enviado via Plataforma Gabarit</em></p>
    `;

    // Enviar email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Gabarit Suporte <noreply@gabarit.com.br>",
        to: ["suporte@gabarit.com.br"],
        reply_to: email,
        subject: assunto,
        html: corpoEmail,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Erro ao enviar email via Resend:", errorData);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar mensagem. Tente novamente." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendData = await resendResponse.json();
    console.log("Email enviado com sucesso:", resendData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Mensagem enviada com sucesso!",
        emailId: resendData.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro na edge function:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar solicitação" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
