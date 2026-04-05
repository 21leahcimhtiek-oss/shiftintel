"use client";
import { format, parseISO } from "date-fns";
import type { Shift } from "@/types";
import { Clock } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 border-gray-200 text-gray-700",
  published: "bg-blue-50 border-blue-200 text-blue-800",
  confirmed: "bg-green-50 border-green-200 text-green-800",
  completed: "bg-purple-50 border-purple-200 text-purple-800",
  cancelled: "bg-red-50 border-red-200 text-red-700 opacity-60",
};

const DEPT_BG: Record<string, string> = {
  Operations: "border-l-blue-500",
  Sales: "border-l-green-500",
  Support: "border-l-yellow-500",
  Kitchen: "border-l-orange-500",
  Floor: "border-l-teal-500",
  Warehouse: "border-l-indigo-500",
};

interface ShiftCardProps {
  shift: Shift & { employee?: { name: string; department: string | null } | null };
  compact?: boolean;
  canEdit?: boolean;
  onClick?: () => void;
}

export default function ShiftCard({ shift, compact, canEdit, onClick }: ShiftCardProps) {
  const statusStyle = STATUS_STYLES[shift.status] || STATUS_STYLES.draft;
  const deptBorder = DEPT_BG[shift.department || ""] || "border-l-gray-400";
  const duration = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / 3600000;

  if (compact) {
    return (
      <div
        onClick={canEdit ? onClick : undefined}
        className={`text-xs rounded border-l-2 px-1.5 py-1 ${statusStyle} ${deptBorder} ${canEdit ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
      >
        <p className="font-medium truncate">{shift.employee?.name || "Unassigned"}</p>
        <p className="text-gray-500 truncate">{format(new Date(shift.start_time), "h:mm")}–{format(new Date(shift.end_time), "h:mma")}</p>
      </div>
    );
  }

  return (
    <div
      onClick={canEdit ? onClick : undefined}
      className={`rounded-xl border p-4 border-l-4 ${statusStyle} ${deptBorder} ${canEdit ? "cursor-pointer hover:shadow-sm transition-shadow" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm">{shift.employee?.name || "Unassigned"}</p>
          {shift.department && <p className="text-xs text-gray-500 mt-0.5">{shift.department}</p>}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${statusStyle}`}>{shift.status}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <Clock className="w-3 h-3" />
        {format(new Date(shift.start_time), "h:mm a")} – {format(new Date(shift.end_time), "h:mm a")}
        <span className="text-gray-400">({duration.toFixed(1)}h)</span>
      </div>
      {shift.notes && <p className="text-xs text-gray-500 mt-2 truncate">{shift.notes}</p>}
    </div>
  );
}