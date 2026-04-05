"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import type { LaborCost } from "@/types";

interface LaborCostChartProps {
  data: LaborCost[];
}

export default function LaborCostChart({ data }: LaborCostChartProps) {
  const chartData = data.map(d => ({
    week: format(new Date(d.period_start), "MMM d"),
    "Regular Hours": Number(d.regular_hours.toFixed(1)),
    "Overtime Hours": Number(d.overtime_hours.toFixed(1)),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No labor cost data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: 12 }}
          cursor={{ fill: "#f1f5f9" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Regular Hours" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={32} />
        <Bar dataKey="Overtime Hours" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}