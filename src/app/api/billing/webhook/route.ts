import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { org_id, plan } = session.metadata || {};
    if (org_id && plan) {
      await supabase.from("orgs").update({
        plan,
        stripe_subscription_id: session.subscription as string,
      }).eq("id", org_id);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
    const orgId = customer.metadata?.org_id;
    if (orgId) {
      const planMap: Record<string, string> = {
        [process.env.STRIPE_STARTER_PRICE_ID!]: "starter",
        [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
        [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: "enterprise",
      };
      const priceId = sub.items.data[0]?.price.id;
      const plan = planMap[priceId] || "starter";
      await supabase.from("orgs").update({ plan, stripe_subscription_id: sub.id }).eq("id", orgId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
    const orgId = customer.metadata?.org_id;
    if (orgId) {
      await supabase.from("orgs").update({ plan: "starter", stripe_subscription_id: null }).eq("id", orgId);
    }
  }

  return NextResponse.json({ received: true });
}