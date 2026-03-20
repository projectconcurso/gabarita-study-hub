import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe_secret_key = Deno.env.get("STRIPE_SECRET_KEY");
const supabase_url = Deno.env.get("SUPABASE_URL");
const supabase_service_role_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabase_url!, supabase_service_role_key!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { packageId, userId } = await req.json();

    console.log("Request received:", { packageId, userId });

    if (!packageId || !userId) {
      console.error("Missing parameters:", { packageId, userId });
      return new Response(
        JSON.stringify({ error: "packageId and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar informações do pacote
    const { data: pkg, error: pkgError } = await supabase
      .from("gabaritos_packages")
      .select("*")
      .eq("id", packageId)
      .eq("active", true)
      .single();

    if (pkgError) {
      console.error("Package error:", pkgError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar pacote", details: pkgError.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pkg) {
      console.error("Package not found:", packageId);
      return new Response(
        JSON.stringify({ error: "Pacote não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pkg.stripe_price_id) {
      console.error("Package missing stripe_price_id:", packageId);
      return new Response(
        JSON.stringify({ error: "Pacote sem Price ID do Stripe configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Package found:", pkg);

    // Buscar stripe_customer_id e email do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar perfil", details: profileError.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar email do auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User found:", { id: user.id, email: user.email });

    // Criar Stripe Checkout Session usando Price ID do Stripe
    const checkoutParams: Record<string, string> = {
      "mode": "payment",
      "success_url": `${req.headers.get("origin")}/dashboard/loja?success=true`,
      "cancel_url": `${req.headers.get("origin")}/dashboard/loja?canceled=true`,
      "line_items[0][price]": pkg.stripe_price_id,
      "line_items[0][quantity]": "1",
      "metadata[user_id]": userId,
      "metadata[package_id]": packageId,
      "metadata[gabaritos_amount]": String(pkg.amount),
      "metadata[type]": "gabaritos_purchase",
    };

    // Adicionar customer OU customer_email (nunca os dois)
    if (profile?.stripe_customer_id) {
      checkoutParams["customer"] = profile.stripe_customer_id;
    } else {
      checkoutParams["customer_email"] = user.email || "";
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripe_secret_key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(checkoutParams),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error("Stripe error:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao criar sessão de pagamento" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
