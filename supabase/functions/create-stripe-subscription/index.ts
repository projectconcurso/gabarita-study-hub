import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe_secret_key = Deno.env.get("STRIPE_SECRET_KEY");
const supabase_url = Deno.env.get("SUPABASE_URL");
const supabase_service_role_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const stripe_price_id = Deno.env.get("STRIPE_PRICE_ID"); // Monthly subscription price ID
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

const buildStripeCustomerParams = (email: string, name: string, userId: string) => {
  const params = new URLSearchParams();
  params.append("email", email);
  params.append("name", name);
  params.append("metadata[supabase_user_id]", userId);
  return params;
};

const buildStripeCheckoutParams = (
  customerId: string,
  stripePriceId: string,
  trialEndTimestamp: number,
  appOrigin: string,
  successUrl?: string,
  cancelUrl?: string,
) => {
  const params = new URLSearchParams();
  params.append("customer", customerId);
  params.append("mode", "subscription");
  params.append("line_items[0][price]", stripePriceId);
  params.append("line_items[0][quantity]", "1");
  params.append("subscription_data[trial_end]", trialEndTimestamp.toString());
  params.append("success_url", successUrl || `${appOrigin}/dashboard?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", cancelUrl || `${appOrigin}/signup`);
  return params;
};

const getAppOrigin = (req: Request) => {
  return req.headers.get("origin") || site_url || "http://localhost:8080";
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, email, name, successUrl, cancelUrl } = await req.json();

    if (!userId || !email || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, email, name" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!stripe_secret_key || !stripe_price_id) {
      return new Response(
        JSON.stringify({ error: "Missing Stripe configuration" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    if (!stripe_price_id.startsWith("price_")) {
      console.error("Invalid STRIPE_PRICE_ID. Expected a Stripe Price ID starting with 'price_'", {
        configuredValue: stripe_price_id,
      });
      return new Response(
        JSON.stringify({
          error: "Invalid Stripe price configuration. STRIPE_PRICE_ID must be a Price ID starting with 'price_'.",
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    if (!supabase_url || !supabase_service_role_key) {
      console.error("Missing Supabase configuration:", {
        supabase_url: !!supabase_url,
        supabase_service_role_key: !!supabase_service_role_key,
      });
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // Step 1: Create Stripe customer
    const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripe_secret_key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: buildStripeCustomerParams(email, name, userId).toString(),
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.text();
      console.error("Stripe customer creation error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create Stripe customer" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const customer = await customerResponse.json();
    const customerId = customer.id;

    // Step 2: Create Checkout Session with 3-day trial
    // Following Stripe best practices: always collect payment via Checkout, even with trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const trialEndTimestamp = Math.floor(trialEndDate.getTime() / 1000);
    const appOrigin = getAppOrigin(req);

    const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripe_secret_key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: buildStripeCheckoutParams(customerId, stripe_price_id, trialEndTimestamp, appOrigin, successUrl, cancelUrl).toString(),
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text();
      console.error("Stripe checkout session error:", error);
      return new Response(
        JSON.stringify({ error: `Failed to create checkout session: ${error}` }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const checkoutSession = await checkoutResponse.json();
    const checkoutUrl = checkoutSession.url;

    // Step 3: Update Supabase profile with Stripe customer ID
    // subscription_id will be updated via webhook when checkout is completed
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        subscription_status: "trial",
        trial_ends_at: new Date(trialEndTimestamp * 1000).toISOString(),
        subscription_started_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile with subscription info" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        customerId,
        trialEndsAt: new Date(trialEndTimestamp * 1000).toISOString(),
        checkoutUrl,
      }),
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
