import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, startOfWeek, addDays } from "date-fns";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

export const metadata = { title: "Schedule" };

export default async function SchedulePage({ searchParams }: { searchParams: { week?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) redirect("/login");

  const weekStart = searchParams.week
    ? new Date(searchParams.week)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const { data: shifts } = await supabase
    .from("shifts")
    .select("*, employee:employees(id, name, department, hourly_rate)")
    .eq("org_id", member.org_id)
    .gte("start_time", format(weekStart, "yyyy-MM-dd"))
    .lte("start_time", format(weekEnd, "yyyy-MM-dd") + "T23:59:59")
    .order("start_time");

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, department")
    .eq("org_id", member.org_id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500 mt-1">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/schedule/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Sparkles className="w-4 h-4" /> AI Generate
          </Link>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Shift
          </button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
        <Link
          href={`/schedule?week=${format(addDays(weekStart, -7), "yyyy-MM-dd")}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >← Prev Week</Link>
        <span className="flex-1 text-center text-sm font-medium text-gray-700">
          Week of {format(weekStart, "MMMM d, yyyy")}
        </span>
        <Link
          href={`/schedule?week=${format(addDays(weekStart, 7), "yyyy-MM-dd")}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >Next Week →</Link>
      </div>

      <WeeklyCalendar
        shifts={shifts || []}
        employees={employees || []}
        weekStart={weekStart.toISOString()}
        userRole={member.role}
      />
    </div>
  );
}