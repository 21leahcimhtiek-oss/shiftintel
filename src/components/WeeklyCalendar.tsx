"use client";
import { format, addDays, parseISO } from "date-fns";
import type { Shift, Employee, OrgMemberRole } from "@/types";
import ShiftCard from "./ShiftCard";

const DEPT_COLORS: Record<string, string> = {
  Operations: "bg-blue-500",
  Sales: "bg-green-500",
  Support: "bg-yellow-500",
  Kitchen: "bg-orange-500",
  Floor: "bg-teal-500",
  Warehouse: "bg-indigo-500",
};

interface WeeklyCalendarProps {
  shifts: Shift[];
  employees: Pick<Employee, "id" | "name" | "department">[];
  weekStart: string;
  userRole: OrgMemberRole;
}

export default function WeeklyCalendar({ shifts, employees, weekStart, userRole }: WeeklyCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(weekStart), i));

  const getShiftsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return shifts.filter(s => s.start_time.startsWith(dayStr));
  };

  const canEdit = ["owner", "admin", "manager"].includes(userRole);
  const departments = [...new Set(shifts.map(s => s.department).filter(Boolean))];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Department legend */}
      {departments.length > 0 && (
        <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          {departments.map(dept => (
            <div key={dept} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${DEPT_COLORS[dept!] || "bg-gray-400"}`} />
              <span className="text-xs text-gray-600">{dept}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="grid grid-cols-7 divide-x divide-gray-100">
        {days.map(day => {
          const dayShifts = getShiftsForDay(day);
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <div key={day.toISOString()} className="min-h-48">
              {/* Day header */}
              <div className={`px-2 py-3 text-center border-b border-gray-100 ${isToday ? "bg-blue-50" : "bg-white"}`}>
                <p className={`text-xs font-medium uppercase tracking-wide ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                  {format(day, "EEE")}
                </p>
                <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                  {format(day, "d")}
                </p>
              </div>

              {/* Shifts */}
              <div className="p-1.5 space-y-1">
                {dayShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} compact canEdit={canEdit} />
                ))}
                {dayShifts.length === 0 && (
                  <div className="h-8 rounded border border-dashed border-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-300">—</span>
                  </div>
                )}
              </div>

              {/* Coverage indicator */}
              {dayShifts.length > 0 && (
                <div className="px-2 pb-2">
                  <div className={`h-1 rounded-full ${dayShifts.length >= 3 ? "bg-green-400" : dayShifts.length >= 1 ? "bg-yellow-400" : "bg-red-300"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}