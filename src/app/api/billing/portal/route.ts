import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("org_members").select("org_id, role, orgs(stripe_customer_id)").eq("user_id", user.id).single();
  if (!member || !["owner", "admin"].includes(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const org = member.orgs as any;
  if (!org.stripe_customer_id) return NextResponse.json({ error: "No billing account" }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return NextResponse.json({ url: session.url });
}