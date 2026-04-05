"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Calendar, Users, Settings } from "lucide-react";
import { format, addDays } from "date-fns";

export default function NewSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: `Week of ${format(new Date(), "MMM d, yyyy")}`,
    period_start: format(new Date(), "yyyy-MM-dd"),
    period_end: format(addDays(new Date(), 6), "yyyy-MM-dd"),
    departments: [] as string[],
    max_shifts_per_employee_per_week: 5,
    min_hours_between_shifts: 8,
    prefer_consistent_schedules: true,
  });

  const departments = ["Operations", "Sales", "Support", "Kitchen", "Floor", "Warehouse"];

  const toggleDept = (dept: string) => {
    setForm(f => ({
      ...f,
      departments: f.departments.includes(dept)
        ? f.departments.filter(d => d !== dept)
        : [...f.departments, dept],
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.departments.length === 0) { setError("Select at least one department"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          period_start: form.period_start,
          period_end: form.period_end,
        }),
      });
      const scheduleData = await res.json();
      if (!res.ok) throw new Error(scheduleData.error || "Failed to create schedule");

      const genRes = await fetch(`/api/schedules/${scheduleData.data.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departments: form.departments,
          constraints: {
            max_shifts_per_employee_per_week: form.max_shifts_per_employee_per_week,
            min_hours_between_shifts: form.min_hours_between_shifts,
            prefer_consistent_schedules: form.prefer_consistent_schedules,
          },
        }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "AI generation failed");

      router.push(`/schedule?week=${form.period_start}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Schedule Generator</h1>
        <p className="text-gray-500 mt-1">GPT-4o will build an optimized schedule based on your coverage rules and employee availability.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">{error}</div>}

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Schedule Period */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Schedule Period</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
            <input
              type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Departments to Schedule</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {departments.map(dept => (
              <button
                key={dept} type="button" onClick={() => toggleDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  form.departments.includes(dept)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                }`}
              >{dept}</button>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Constraints</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max shifts/employee/week</label>
              <input
                type="number" min="1" max="7" value={form.max_shifts_per_employee_per_week}
                onChange={e => setForm(f => ({ ...f, max_shifts_per_employee_per_week: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min hours between shifts</label>
              <input
                type="number" min="4" max="24" value={form.min_hours_between_shifts}
                onChange={e => setForm(f => ({ ...f, min_hours_between_shifts: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox" checked={form.prefer_consistent_schedules}
              onChange={e => setForm(f => ({ ...f, prefer_consistent_schedules: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Prefer consistent schedules (same days each week)</span>
          </label>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Generating with AI...</>
          ) : (
            <><Sparkles className="w-5 h-5" />Generate AI Schedule</>
          )}
        </button>
      </form>
    </div>
  );
}