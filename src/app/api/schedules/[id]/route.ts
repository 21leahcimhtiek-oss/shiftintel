import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const UpdateScheduleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(["draft", "published"]).optional(),
  total_hours: z.number().optional(),
  total_cost_usd: z.number().optional(),
  coverage_score: z.number().int().min(0).max(100).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: schedule, error } = await supabase.from("schedules").select("*").eq("id", params.id).eq("org_id", member.org_id).single();
  if (error) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

  const { data: scheduleShifts } = await supabase
    .from("schedule_shifts")
    .select("shift_id, shifts(*, employee:employees(id, name, department))")
    .eq("schedule_id", params.id);

  return NextResponse.json({ data: { ...schedule, shifts: scheduleShifts?.map(ss => ss.shifts) || [] } });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member || !["owner", "admin", "manager"].includes(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = UpdateScheduleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase.from("schedules").update(parsed.data).eq("id", params.id).eq("org_id", member.org_id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member || !["owner", "admin"].includes(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("schedules").delete().eq("id", params.id).eq("org_id", member.org_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}