import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, Users, DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import CoverageGauge from "@/components/CoverageGauge";
import LaborCostChart from "@/components/LaborCostChart";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/login");
  const orgId = member.org_id;

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [shiftsRes, employeesRes, timeOffRes, laborCostRes] = await Promise.all([
    supabase.from("shifts").select("*, employee:employees(name, department)").eq("org_id", orgId)
      .gte("start_time", weekStart).lte("start_time", weekEnd + "T23:59:59"),
    supabase.from("employees").select("id, name, department").eq("org_id", orgId),
    supabase.from("time_off_requests").select("*, employee:employees(name)").eq("org_id", orgId).eq("status", "pending"),
    supabase.from("labor_costs").select("*").eq("org_id", orgId).order("period_start", { ascending: false }).limit(8),
  ]);

  const shifts = shiftsRes.data || [];
  const employees = employeesRes.data || [];
  const pendingTimeOff = timeOffRes.data || [];
  const laborCosts = laborCostRes.data || [];

  const publishedShifts = shifts.filter(s => s.status === "published" || s.status === "confirmed");
  const openShifts = shifts.filter(s => !s.employee_id);
  const totalHoursThisWeek = shifts.reduce((sum, s) => {
    const hrs = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 3600000;
    return sum + hrs;
  }, 0);

  const coverageScore = employees.length > 0 ? Math.min(100, Math.round((publishedShifts.length / Math.max(shifts.length, 1)) * 100)) : 0;

  const stats = [
    { label: "Employees", value: employees.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Shifts This Week", value: shifts.length, icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
    { label: "Open Shifts", value: openShifts.length, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Pending Time-Off", value: pendingTimeOff.length, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Week of {format(new Date(weekStart), "MMM d")} – {format(new Date(weekEnd), "MMM d, yyyy")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage Score */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Coverage Score</h2>
          <CoverageGauge score={coverageScore} />
          <p className="text-sm text-gray-500 text-center mt-3">
            {coverageScore >= 80 ? "Excellent coverage" : coverageScore >= 60 ? "Good coverage" : "Needs attention"}
          </p>
        </div>

        {/* Labor Cost Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Labor Costs (Last 8 Weeks)</h2>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <LaborCostChart data={laborCosts} />
        </div>
      </div>

      {/* Today's Shifts & Pending Time Off */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Today&apos;s Shifts ({shifts.filter(s => s.start_time.startsWith(format(new Date(), "yyyy-MM-dd"))).length})</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {shifts
              .filter(s => s.start_time.startsWith(format(new Date(), "yyyy-MM-dd")))
              .slice(0, 6)
              .map(shift => (
                <div key={shift.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{shift.employee?.name || "Unassigned"}</p>
                    <p className="text-xs text-gray-500">{shift.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{format(new Date(shift.start_time), "h:mm a")} – {format(new Date(shift.end_time), "h:mm a")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      shift.status === "confirmed" ? "bg-green-100 text-green-700" :
                      shift.status === "published" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>{shift.status}</span>
                  </div>
                </div>
              ))}
            {shifts.filter(s => s.start_time.startsWith(format(new Date(), "yyyy-MM-dd"))).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No shifts today</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pending Time-Off ({pendingTimeOff.length})</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingTimeOff.slice(0, 5).map(req => (
              <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{req.employee?.name}</p>
                  <p className="text-xs text-gray-500">{req.type} · {format(new Date(req.start_date), "MMM d")} – {format(new Date(req.end_date), "MMM d")}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200 transition-colors">Approve</button>
                  <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md hover:bg-red-200 transition-colors">Deny</button>
                </div>
              </div>
            ))}
            {pendingTimeOff.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}