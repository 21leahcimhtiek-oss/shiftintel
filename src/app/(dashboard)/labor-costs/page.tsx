import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import LaborCostChart from "@/components/LaborCostChart";
import ForecastChart from "@/components/ForecastChart";

export const metadata = { title: "Labor Costs" };

export default async function LaborCostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) redirect("/login");

  if (!["owner", "admin", "manager"].includes(member.role)) redirect("/dashboard");

  const { data: laborCosts } = await supabase
    .from("labor_costs")
    .select("*")
    .eq("org_id", member.org_id)
    .order("period_start", { ascending: false })
    .limit(12);

  const costs = laborCosts || [];
  const totalCost = costs.reduce((sum, c) => sum + c.total_cost_usd, 0);
  const totalHours = costs.reduce((sum, c) => sum + c.total_hours, 0);
  const totalOT = costs.reduce((sum, c) => sum + c.overtime_hours, 0);
  const otPercent = totalHours > 0 ? ((totalOT / totalHours) * 100).toFixed(1) : "0";

  const summaryStats = [
    { label: "Total Cost (12 weeks)", value: `$${totalCost.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Hours", value: `${totalHours.toFixed(0)}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Overtime Hours", value: `${totalOT.toFixed(0)}h`, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "OT Rate", value: `${otPercent}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Labor Costs</h1>
        <p className="text-gray-500 mt-1">Cost analysis and AI-powered forecasting</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Regular vs Overtime Hours</h2>
          <LaborCostChart data={costs.slice(0, 8).reverse()} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">AI Cost Forecast (Next 4 Weeks)</h2>
          <ForecastChart historicalData={costs.slice(0, 8).reverse()} />
        </div>
      </div>

      {/* Cost Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Weekly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left">Period</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-right">Total Hrs</th>
                <th className="px-6 py-3 text-right">Regular Hrs</th>
                <th className="px-6 py-3 text-right">OT Hrs</th>
                <th className="px-6 py-3 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {costs.map(cost => (
                <tr key={cost.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{cost.period_start} – {cost.period_end}</td>
                  <td className="px-6 py-4 text-gray-600">{cost.department || "All"}</td>
                  <td className="px-6 py-4 text-right text-gray-900">{cost.total_hours.toFixed(1)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{cost.regular_hours.toFixed(1)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={cost.overtime_hours > 0 ? "text-orange-600 font-medium" : "text-gray-600"}>
                      {cost.overtime_hours.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">${cost.total_cost_usd.toLocaleString()}</td>
                </tr>
              ))}
              {costs.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No cost data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}