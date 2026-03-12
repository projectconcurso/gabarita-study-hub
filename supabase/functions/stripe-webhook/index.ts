import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe_secret_key = Deno.env.get("STRIPE_SECRET_KEY");
const stripe_webhook_secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
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
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature || !stripe_webhook_secret) {
      return new Response("Missing signature or webhook secret", { status: 400 });
    }

    // Verify webhook signature using crypto
    const encoder = new TextEncoder();
    const parts = signature.split(",");
    const timestamp = parts[0].split("=")[1];
    const received_signature = parts[1].split("=")[1];

    const signed_content = `${timestamp}.${body}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(stripe_webhook_secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature_bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signed_content));
    const computed_signature = Array.from(new Uint8Array(signature_bytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computed_signature !== received_signature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleCheckoutSessionCompleted(session: any) {
  // When checkout is completed, the subscription is created
  // Update the profile with the subscription ID
  if (session.subscription) {
    const { error } = await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: session.subscription,
      })
      .eq("stripe_customer_id", session.customer);

    if (error) {
      console.error("Error updating checkout session completed:", error);
    }
  }
}

async function handleSubscriptionCreated(subscription: any) {
  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status === "trialing" ? "trial" : "active",
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      subscription_started_at: new Date(subscription.created * 1000).toISOString(),
    })
    .eq("stripe_customer_id", subscription.customer);

  if (error) {
    console.error("Error updating subscription created:", error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: subscription.status === "trialing" ? "trial" : subscription.status,
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .eq("stripe_customer_id", subscription.customer);

  if (error) {
    console.error("Error updating subscription updated:", error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", subscription.customer);

  if (error) {
    console.error("Error updating subscription deleted:", error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
    })
    .eq("stripe_customer_id", invoice.customer);

  if (error) {
    console.error("Error updating invoice payment succeeded:", error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
    })
    .eq("stripe_customer_id", invoice.customer);

  if (error) {
    console.error("Error updating invoice payment failed:", error);
  }
}

async function handleTrialWillEnd(subscription: any) {
  // This event is sent 3 days before trial ends
  // You can use this to send a reminder email to the customer
  console.log(`Trial will end for subscription ${subscription.id}`);
}
