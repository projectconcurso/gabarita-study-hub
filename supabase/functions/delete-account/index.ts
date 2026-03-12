import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

const cancelStripeSubscription = async (subscriptionId: string, stripeKey: string) => {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
    },
  });

  if (!response.ok) {
    const stripeError = await response.text();
    throw new Error(`Failed to cancel Stripe subscription ${subscriptionId}: ${stripeError}`);
  }
};

const deleteStripeCustomer = async (customerId: string, stripeKey: string) => {
  const response = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
    },
  });

  if (!response.ok) {
    const stripeError = await response.text();
    throw new Error(`Failed to delete Stripe customer ${customerId}: ${stripeError}`);
  }
};

const cancelAllStripeSubscriptions = async (customerId: string, stripeKey: string) => {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=all&limit=100`, {
    headers: {
      Authorization: `Bearer ${stripeKey}`,
    },
  });

  if (!response.ok) {
    const stripeError = await response.text();
    throw new Error(`Failed to list Stripe subscriptions for customer ${customerId}: ${stripeError}`);
  }

  const payload = await response.json();
  const subscriptions = Array.isArray(payload.data) ? payload.data : [];

  for (const subscription of subscriptions) {
    if (subscription?.id && subscription.status !== "canceled" && subscription.status !== "incomplete_expired") {
      await cancelStripeSubscription(subscription.id, stripeKey);
    }
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization token" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("foto_url, stripe_subscription_id, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (stripeSecretKey) {
      if (profile?.stripe_subscription_id) {
        await cancelStripeSubscription(profile.stripe_subscription_id, stripeSecretKey);
      }

      if (profile?.stripe_customer_id) {
        await cancelAllStripeSubscriptions(profile.stripe_customer_id, stripeSecretKey);
        await deleteStripeCustomer(profile.stripe_customer_id, stripeSecretKey);
      }
    }

    const avatarPrefix = `${user.id}/`;
    const avatarList = await supabaseAdmin.storage.from("avatars").list(user.id, {
      limit: 100,
      offset: 0,
    });

    if (!avatarList.error && avatarList.data.length > 0) {
      await supabaseAdmin.storage
        .from("avatars")
        .remove(avatarList.data.map((file) => `${avatarPrefix}${file.name}`));
    }

    const { data: userSimulados } = await supabaseAdmin
      .from("simulados")
      .select("id")
      .eq("user_id", user.id);

    const simuladoIds = (userSimulados ?? []).map((simulado) => simulado.id);

    if (simuladoIds.length > 0) {
      const { error: questoesError } = await supabaseAdmin
        .from("questoes")
        .delete()
        .in("simulado_id", simuladoIds);

      if (questoesError) {
        return new Response(JSON.stringify({ error: questoesError.message }), {
          status: 500,
          headers: jsonHeaders,
        });
      }
    }

    const deletionSteps = await Promise.all([
      supabaseAdmin.from("mensagens").delete().eq("remetente_id", user.id),
      supabaseAdmin.from("mensagens").delete().eq("destinatario_id", user.id),
      supabaseAdmin.from("amizades").delete().eq("user_id", user.id),
      supabaseAdmin.from("amizades").delete().eq("amigo_id", user.id),
      supabaseAdmin.from("simulados").delete().eq("user_id", user.id),
      supabaseAdmin.from("profiles").delete().eq("id", user.id),
    ]);

    const failedStep = deletionSteps.find((step) => step.error);

    if (failedStep?.error) {
      return new Response(JSON.stringify({ error: failedStep.error.message }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      return new Response(JSON.stringify({ error: deleteUserError.message }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
