import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Clock, Plus } from "lucide-react";
import TimeOffCard from "@/components/TimeOffCard";
import Link from "next/link";

export const metadata = { title: "Time Off" };

export default async function TimeOffPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) redirect("/login");

  const activeTab = searchParams.status || "pending";

  const { data: requests } = await supabase
    .from("time_off_requests")
    .select("*, employee:employees(name, department)")
    .eq("org_id", member.org_id)
    .eq("status", activeTab)
    .order("created_at", { ascending: false });

  const tabs = ["pending", "approved", "denied"];
  const canManage = ["owner", "admin", "manager"].includes(member.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Off</h1>
          <p className="text-gray-500 mt-1">Manage time-off requests</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Request Time Off
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <Link
            key={tab}
            href={`/time-off?status=${tab}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >{tab}</Link>
        ))}
      </div>

      <div className="space-y-4">
        {(requests || []).map(req => (
          <TimeOffCard key={req.id} request={req} canManage={canManage} />
        ))}
        {(!requests || requests.length === 0) && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No {activeTab} requests</p>
          </div>
        )}
      </div>
    </div>
  );
}