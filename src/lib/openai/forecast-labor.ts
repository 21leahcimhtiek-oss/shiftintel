import OpenAI from "openai";
import type { LaborCost, LaborForecast } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are ShiftIntel's labor cost forecasting engine. Analyze historical labor cost data and generate accurate 4-week forecasts.

Consider:
- Weekly and seasonal patterns in the historical data
- Growth/decline trends
- Day-of-week effects
- Overtime patterns
- Department-specific trends

Respond with a JSON array of 4 weekly forecast objects, each containing:
- week_start: ISO date string (Monday)
- week_end: ISO date string (Sunday)
- projected_hours: number
- projected_cost_usd: number
- confidence_low: number (lower bound of 80% confidence interval)
- confidence_high: number (upper bound of 80% confidence interval)
- department_breakdown: object with department keys, each having { hours, cost }`;

export async function forecastLaborCosts(
  historicalData: LaborCost[],
  departments: string[],
  forecastStartDate: string
): Promise<LaborForecast[]> {
  if (historicalData.length === 0) {
    return generateDefaultForecast(forecastStartDate, departments);
  }

  const prompt = `Generate a 4-week labor cost forecast starting from ${forecastStartDate}.

HISTORICAL DATA (${historicalData.length} periods):
${historicalData.slice(-12).map(d =>
  `- Week of ${d.period_start}: ${d.total_hours}hrs, $${d.total_cost_usd} total ($${d.regular_hours}hrs regular, ${d.overtime_hours}hrs OT), Dept: ${d.department || "all"}`
).join("\n")}

DEPARTMENTS: ${departments.join(", ")}

Analyze trends, seasonality, and patterns. Return 4 weekly forecasts as a JSON array.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    return parsed.forecasts || parsed;
  } catch {
    return generateDefaultForecast(forecastStartDate, departments);
  }
}

function generateDefaultForecast(startDate: string, departments: string[]): LaborForecast[] {
  const forecasts: LaborForecast[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const baseHours = 160;
    const baseCost = 3200;
    const variance = 0.1;

    forecasts.push({
      week_start: weekStart.toISOString().split("T")[0],
      week_end: weekEnd.toISOString().split("T")[0],
      projected_hours: baseHours,
      projected_cost_usd: baseCost,
      confidence_low: baseCost * (1 - variance),
      confidence_high: baseCost * (1 + variance),
      department_breakdown: Object.fromEntries(
        departments.map(d => [d, { hours: baseHours / departments.length, cost: baseCost / departments.length }])
      ),
    });
  }

  return forecasts;
}