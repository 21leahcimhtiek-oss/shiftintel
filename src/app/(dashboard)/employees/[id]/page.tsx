import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { Mail, Clock, DollarSign, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Employee Profile" };

export default async function EmployeeProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) redirect("/login");

  const { data: employee } = await supabase
    .from("employees").select("*").eq("id", params.id).eq("org_id", member.org_id).single();
  if (!employee) notFound();

  const [shiftsRes, timeOffRes] = await Promise.all([
    supabase.from("shifts").select("*").eq("employee_id", params.id).order("start_time", { ascending: false }).limit(10),
    supabase.from("time_off_requests").select("*").eq("employee_id", params.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const shifts = shiftsRes.data || [];
  const timeOff = timeOffRes.data || [];
  const totalHours = shifts.reduce((sum, s) => sum + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 3600000, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
          <p className="text-gray-500">{employee.role_title} · {employee.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Hourly Rate</p>
            <p className="text-xl font-bold text-gray-900">${employee.hourly_rate}/hr</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Hours/Week</p>
            <p className="text-xl font-bold text-gray-900">{employee.max_hours_per_week}h</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-xl font-bold text-gray-900">{totalHours.toFixed(0)}h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills & Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Profile</h2>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            {employee.email}
          </div>
          {employee.skills && employee.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill: string) => (
                  <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Shifts */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Shifts</h2>
          <div className="space-y-2">
            {shifts.slice(0, 5).map(shift => (
              <div key={shift.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{shift.department}</p>
                  <p className="text-xs text-gray-500">{format(new Date(shift.start_time), "MMM d, yyyy")}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">{format(new Date(shift.start_time), "h:mm a")} – {format(new Date(shift.end_time), "h:mm a")}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${shift.status === "completed" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>{shift.status}</span>
                </div>
              </div>
            ))}
            {shifts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No shifts yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}