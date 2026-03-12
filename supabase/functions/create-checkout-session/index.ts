import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe_secret_key = Deno.env.get("STRIPE_SECRET_KEY");
const stripe_price_id = Deno.env.get("STRIPE_PRICE_ID");
const supabase_url = Deno.env.get("SUPABASE_URL");
const supabase_service_role_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const site_url = Deno.env.get("SITE_URL");

const supabase = createClient(supabase_url!, supabase_service_role_key!);

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

const buildStripeCheckoutParams = (customerId: string, stripePriceId: string, appOrigin: string) => {
  const params = new URLSearchParams();
  params.append("customer", customerId);
  params.append("mode", "subscription");
  params.append("line_items[0][price]", stripePriceId);
  params.append("line_items[0][quantity]", "1");
  params.append("success_url", `${appOrigin}/dashboard?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${appOrigin}/dashboard/billing`);
  return params;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!stripe_secret_key || !stripe_price_id) {
      return new Response(
        JSON.stringify({ error: "Missing Stripe configuration" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "User profile not found or missing Stripe customer ID" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // Create Stripe checkout session
    const appOrigin = getAppOrigin(req);
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripe_secret_key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: buildStripeCheckoutParams(profile.stripe_customer_id, stripe_price_id, appOrigin).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Stripe checkout session error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
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
