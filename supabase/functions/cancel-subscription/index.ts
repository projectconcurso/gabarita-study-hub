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

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (!stripe_secret_key || !supabase_url || !supabase_service_role_key) {
      return new Response(JSON.stringify({ error: "Missing billing configuration" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: jsonHeaders,
      });
    }

    const response = await fetch(
      `https://api.stripe.com/v1/subscriptions/${profile.stripe_subscription_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripe_secret_key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          cancel_at_period_end: "true",
        }).toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Failed to cancel subscription: ${errorText}` }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    const subscription = await response.json();

    await supabase
      .from("profiles")
      .update({
        subscription_status: subscription.status === "trialing" ? "trial" : subscription.status,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      })
      .eq("id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
