"use client";
import { format } from "date-fns";
import { Calendar, User, Clock } from "lucide-react";
import type { TimeOffRequest, Employee } from "@/types";
import { useState } from "react";

interface TimeOffCardProps {
  request: TimeOffRequest & { employee?: Pick<Employee, "name" | "department"> | null };
  canManage: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  vacation: "bg-blue-100 text-blue-700",
  sick: "bg-red-100 text-red-700",
  personal: "bg-purple-100 text-purple-700",
};

export default function TimeOffCard({ request, canManage }: TimeOffCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(request.status);

  const handleAction = async (action: "approved" | "denied") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/time-off/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) setStatus(action);
    } finally {
      setLoading(false);
    }
  };

  const days = Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / 86400000) + 1;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{request.employee?.name || "Employee"}</p>
            <p className="text-sm text-gray-500">{request.employee?.department}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(request.start_date), "MMM d")} – {format(new Date(request.end_date), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="w-3.5 h-3.5" />
                {days} day{days !== 1 ? "s" : ""}
              </div>
            </div>
            {request.notes && <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{request.notes}&rdquo;</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${TYPE_COLORS[request.type]}`}>
            {request.type}
          </span>
          {status === "pending" && canManage ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction("approved")}
                disabled={loading}
                className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >Approve</button>
              <button
                onClick={() => handleAction("denied")}
                disabled={loading}
                className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >Deny</button>
            </div>
          ) : (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              status === "approved" ? "bg-green-100 text-green-700" :
              status === "denied" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>{status}</span>
          )}
        </div>
      </div>
    </div>
  );
}