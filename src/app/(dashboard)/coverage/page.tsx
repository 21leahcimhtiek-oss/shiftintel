import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shield, Plus, AlertTriangle } from "lucide-react";

export const metadata = { title: "Coverage Rules" };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function CoveragePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) redirect("/login");

  const { data: rules } = await supabase
    .from("coverage_rules")
    .select("*")
    .eq("org_id", member.org_id)
    .order("day_of_week")
    .order("start_time");

  const byDept = (rules || []).reduce((acc, rule) => {
    if (!acc[rule.department]) acc[rule.department] = [];
    acc[rule.department].push(rule);
    return acc;
  }, {} as Record<string, typeof rules>);

  const canManage = ["owner", "admin", "manager"].includes(member.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coverage Rules</h1>
          <p className="text-gray-500 mt-1">Define minimum staffing requirements per department</p>
        </div>
        {canManage && (
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        )}
      </div>

      {Object.keys(byDept).length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No coverage rules yet</p>
          <p className="text-gray-400 text-sm mt-1">Add rules to ensure minimum staffing levels</p>
        </div>
      )}

      {Object.entries(byDept).map(([dept, deptRules]) => (
        <div key={dept} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{dept}</h2>
            <p className="text-sm text-gray-500">{deptRules!.length} rule{deptRules!.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-3 text-left">Day</th>
                  <th className="px-6 py-3 text-left">Time Slot</th>
                  <th className="px-6 py-3 text-left">Min Staff</th>
                  <th className="px-6 py-3 text-left">Required Skills</th>
                  {canManage && <th className="px-6 py-3 text-left">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deptRules!.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{DAYS[rule.day_of_week]}</td>
                    <td className="px-6 py-4 text-gray-600">{rule.start_time} – {rule.end_time}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        {rule.min_employees < 2 && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                        <span className="font-medium text-gray-900">{rule.min_employees}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(rule.required_skills || []).map((skill: string) => (
                          <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{skill}</span>
                        ))}
                        {(!rule.required_skills || rule.required_skills.length === 0) && (
                          <span className="text-gray-400 text-xs">Any</span>
                        )}
                      </div>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mr-3">Edit</button>
                        <button className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}