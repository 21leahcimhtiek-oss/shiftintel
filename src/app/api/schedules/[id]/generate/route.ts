import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateSchedule } from "@/lib/openai/generate-schedule";
import { z } from "zod";

const GenerateSchema = z.object({
  departments: z.array(z.string()).min(1),
  constraints: z.object({
    max_shifts_per_employee_per_week: z.number().int().min(1).max(7).optional(),
    min_hours_between_shifts: z.number().min(4).max(24).optional(),
    prefer_consistent_schedules: z.boolean().optional(),
  }).optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id, true);
  if (!success) return NextResponse.json({ error: "AI rate limit exceeded" }, { status: 429 });

  const { data: member } = await supabase.from("org_members").select("org_id, role, orgs(plan)").eq("user_id", user.id).single();
  if (!member || !["owner", "admin", "manager"].includes(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const org = member.orgs as any;
  if (org.plan === "starter") return NextResponse.json({ error: "AI generation requires Pro or Enterprise plan" }, { status: 403 });

  const body = await request.json();
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: schedule } = await supabase.from("schedules").select("*").eq("id", params.id).eq("org_id", member.org_id).single();
  if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

  const [employeesRes, rulesRes, timeOffRes] = await Promise.all([
    supabase.from("employees").select("*").eq("org_id", member.org_id).in("department", parsed.data.departments),
    supabase.from("coverage_rules").select("*").eq("org_id", member.org_id).in("department", parsed.data.departments),
    supabase.from("time_off_requests").select("*").eq("org_id", member.org_id).eq("status", "approved").gte("end_date", schedule.period_start).lte("start_date", schedule.period_end),
  ]);

  const result = await generateSchedule({
    org_id: member.org_id,
    period_start: schedule.period_start,
    period_end: schedule.period_end,
    departments: parsed.data.departments,
    employees: employeesRes.data || [],
    coverage_rules: rulesRes.data || [],
    time_off_requests: timeOffRes.data || [],
    constraints: parsed.data.constraints,
  });

  // Persist generated shifts
  const shiftInserts = result.shifts.map(s => ({
    ...s,
    org_id: member.org_id,
    status: "draft" as const,
    created_by: user.id,
  }));

  const { data: insertedShifts, error: shiftError } = await supabase.from("shifts").insert(shiftInserts).select("id");
  if (shiftError) return NextResponse.json({ error: shiftError.message }, { status: 500 });

  // Link shifts to schedule
  const junctionRows = insertedShifts!.map(s => ({ schedule_id: params.id, shift_id: s.id }));
  await supabase.from("schedule_shifts").insert(junctionRows);

  // Update schedule stats
  await supabase.from("schedules").update({
    total_hours: result.total_hours,
    total_cost_usd: result.total_cost_usd,
    coverage_score: result.coverage_score,
  }).eq("id", params.id);

  return NextResponse.json({ data: result }, { status: 201 });
}