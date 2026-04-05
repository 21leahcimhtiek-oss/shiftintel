import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const CreateShiftSchema = z.object({
  employee_id: z.string().uuid().optional(),
  department: z.string().min(1),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  break_minutes: z.number().int().min(0).max(120).default(0),
  status: z.enum(["draft", "published", "confirmed", "completed", "cancelled"]).default("draft"),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: member } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const sp = request.nextUrl.searchParams;
  let query = supabase.from("shifts").select("*, employee:employees(id, name, department)").eq("org_id", member.org_id);

  if (sp.get("start")) query = query.gte("start_time", sp.get("start")!);
  if (sp.get("end")) query = query.lte("start_time", sp.get("end")!);
  if (sp.get("department")) query = query.eq("department", sp.get("department")!);
  if (sp.get("employee_id")) query = query.eq("employee_id", sp.get("employee_id")!);
  if (sp.get("status")) query = query.eq("status", sp.get("status")!);

  query = query.order("start_time");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  if (!["owner", "admin", "manager"].includes(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = CreateShiftSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase.from("shifts").insert({
    ...parsed.data,
    org_id: member.org_id,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}