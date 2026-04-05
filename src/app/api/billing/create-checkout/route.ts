import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("org_members").select("org_id, role, orgs(name, stripe_customer_id)").eq("user_id", user.id).single();
  if (!member || !["owner", "admin"].includes(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { plan } = await request.json();
  if (!STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const org = member.orgs as any;
  let customerId = org.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: { org_id: member.org_id },
    });
    customerId = customer.id;
    await supabase.from("orgs").update({ stripe_customer_id: customerId }).eq("id", member.org_id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS].priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?cancelled=1`,
    metadata: { org_id: member.org_id, plan },
  });

  return NextResponse.json({ url: session.url });
}