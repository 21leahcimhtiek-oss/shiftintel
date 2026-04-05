import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BillingPlans from "@/components/BillingPlans";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role, orgs(plan, stripe_subscription_id)").eq("user_id", user.id).single();
  if (!member) redirect("/login");
  if (!["owner", "admin"].includes(member.role)) redirect("/dashboard");

  const org = member.orgs as any;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and payment method</p>
      </div>
      <BillingPlans currentPlan={org.plan} hasSubscription={!!org.stripe_subscription_id} />
    </div>
  );
}