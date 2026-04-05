import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role, orgs(id, name, plan, timezone)")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar org={member.orgs as any} userRole={member.role} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}