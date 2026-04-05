"use client";
import Link from "next/link";
import { Mail, Clock, Star, CheckCircle, XCircle } from "lucide-react";
import type { Employee } from "@/types";

interface EmployeeCardProps {
  employee: Employee;
  weekHours?: number;
}

const AVAILABILITY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const AVAILABILITY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function EmployeeCard({ employee, weekHours = 0 }: EmployeeCardProps) {
  const hoursPercent = Math.min(100, (weekHours / employee.max_hours_per_week) * 100);
  const isNearLimit = hoursPercent >= 80;

  return (
    <Link href={`/employees/${employee.id}`} className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{employee.role_title || employee.department}</p>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${isNearLimit ? "bg-orange-400" : "bg-green-400"}`} title={isNearLimit ? "Near hour limit" : "Available"} />
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
        <Mail className="w-3.5 h-3.5" />
        <span className="truncate">{employee.email}</span>
      </div>

      {/* Hours progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> This week</span>
          <span className={isNearLimit ? "text-orange-600 font-medium" : ""}>{weekHours.toFixed(0)}h / {employee.max_hours_per_week}h</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isNearLimit ? "bg-orange-400" : "bg-blue-500"}`}
            style={{ width: `${hoursPercent}%` }}
          />
        </div>
      </div>

      {/* Availability dots */}
      <div className="flex gap-1 mb-3">
        {AVAILABILITY_KEYS.map((key, i) => {
          const avail = employee.availability?.[key];
          const available = avail && avail.length > 0;
          return (
            <div key={key} className="flex-1 text-center">
              <div className={`w-full h-1.5 rounded-full ${available ? "bg-blue-400" : "bg-gray-100"}`} title={`${AVAILABILITY_DAYS[i]}: ${available ? "Available" : "Unavailable"}`} />
              <p className="text-xs text-gray-400 mt-1">{AVAILABILITY_DAYS[i][0]}</p>
            </div>
          );
        })}
      </div>

      {/* Skills */}
      {employee.skills && employee.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {employee.skills.slice(0, 3).map(skill => (
            <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{skill}</span>
          ))}
          {employee.skills.length > 3 && (
            <span className="text-xs text-gray-400">+{employee.skills.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}