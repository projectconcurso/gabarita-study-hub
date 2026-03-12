import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const stripe_secret_key = Deno.env.get("STRIPE_SECRET_KEY");
const site_url = Deno.env.get("SITE_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

const getAppOrigin = (req: Request) => {
  return req.headers.get("origin") || site_url || "http://localhost:8080";
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: "Missing customerId" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!stripe_secret_key) {
      return new Response(
        JSON.stringify({ error: "Missing Stripe configuration" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // Create Stripe customer portal session
    const appOrigin = getAppOrigin(req);
    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripe_secret_key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId,
        return_url: `${appOrigin}/dashboard/perfil`,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Stripe portal session error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create portal session" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const session = await response.json();

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
