"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, addWeeks } from "date-fns";
import type { LaborCost } from "@/types";

interface ForecastChartProps {
  historicalData: LaborCost[];
}

function generateSimpleForecast(data: LaborCost[]) {
  if (data.length < 2) return [];
  const avg = data.reduce((s, d) => s + d.total_cost_usd, 0) / data.length;
  const lastDate = new Date(data[data.length - 1]?.period_end || new Date());
  return Array.from({ length: 4 }, (_, i) => {
    const weekStart = addWeeks(lastDate, i + 1);
    const variance = avg * 0.1;
    return {
      week: format(weekStart, "MMM d"),
      forecast: Math.round(avg),
      low: Math.round(avg - variance),
      high: Math.round(avg + variance),
    };
  });
}

export default function ForecastChart({ historicalData }: ForecastChartProps) {
  const forecast = generateSimpleForecast(historicalData);

  if (forecast.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Not enough historical data for forecasting
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={forecast} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: 12 }}
          formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
        />
        <Area type="monotone" dataKey="high" stroke="none" fill="url(#forecastGrad)" name="Confidence Range" />
        <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} name="Forecast" />
        <Line type="monotone" dataKey="low" stroke="#93c5fd" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Low Bound" />
      </AreaChart>
    </ResponsiveContainer>
  );
}