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

const normalizeStatus = (status: string | null | undefined) => {
  if (!status) return "free";
  if (status === "trialing") return "trial";
  if (status === "premium") return "active";
  return status;
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
      .select("subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id, subscription_started_at")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: jsonHeaders,
      });
    }

    if (!profile.stripe_customer_id) {
      return new Response(
        JSON.stringify({
          subscription: {
            status: normalizeStatus(profile.subscription_status),
            trialEndsAt: profile.trial_ends_at,
            subscriptionStartedAt: profile.subscription_started_at,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            hasStripeSubscription: Boolean(profile.stripe_subscription_id),
          },
          paymentMethod: null,
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    const customerResponse = await fetch(`https://api.stripe.com/v1/customers/${profile.stripe_customer_id}`, {
      headers: {
        Authorization: `Bearer ${stripe_secret_key}`,
      },
    });

    const paymentMethodsResponse = await fetch(
      `https://api.stripe.com/v1/payment_methods?customer=${profile.stripe_customer_id}&type=card&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${stripe_secret_key}`,
        },
      }
    );

    const customer = customerResponse.ok ? await customerResponse.json() : null;
    const paymentMethodsPayload = paymentMethodsResponse.ok ? await paymentMethodsResponse.json() : { data: [] };
    const defaultPaymentMethodId = customer?.invoice_settings?.default_payment_method;

    const paymentMethod = paymentMethodsPayload.data?.find((method: any) => method.id === defaultPaymentMethodId)
      || paymentMethodsPayload.data?.[0]
      || null;

    let subscriptionPayload = null;
    if (profile.stripe_subscription_id) {
      const subscriptionResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${profile.stripe_subscription_id}`,
        {
          headers: {
            Authorization: `Bearer ${stripe_secret_key}`,
          },
        }
      );

      if (subscriptionResponse.ok) {
        subscriptionPayload = await subscriptionResponse.json();
      }
    }

    const normalizedStatus = normalizeStatus(subscriptionPayload?.status ?? profile.subscription_status);

    return new Response(
      JSON.stringify({
        subscription: {
          status: normalizedStatus,
          trialEndsAt: profile.trial_ends_at,
          subscriptionStartedAt: profile.subscription_started_at,
          currentPeriodEnd: subscriptionPayload?.current_period_end
            ? new Date(subscriptionPayload.current_period_end * 1000).toISOString()
            : null,
          cancelAtPeriodEnd: Boolean(subscriptionPayload?.cancel_at_period_end),
          hasStripeSubscription: Boolean(profile.stripe_subscription_id),
        },
        paymentMethod: paymentMethod
          ? {
              brand: paymentMethod.card?.brand || null,
              last4: paymentMethod.card?.last4 || null,
              expMonth: paymentMethod.card?.exp_month || null,
              expYear: paymentMethod.card?.exp_year || null,
            }
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
