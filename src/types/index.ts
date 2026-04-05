export type Plan = "starter" | "pro" | "enterprise";
export type OrgMemberRole = "owner" | "admin" | "manager" | "employee";
export type ShiftStatus = "draft" | "published" | "confirmed" | "completed" | "cancelled";
export type ScheduleStatus = "draft" | "published";
export type TimeOffType = "vacation" | "sick" | "personal";
export type TimeOffStatus = "pending" | "approved" | "denied";

export interface Org {
  id: string;
  name: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  timezone: string;
  created_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  created_at: string;
}

export interface Employee {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role_title: string | null;
  department: string | null;
  hourly_rate: number;
  max_hours_per_week: number;
  skills: string[];
  availability: Record<string, { start: string; end: string }[]>;
  created_at: string;
}

export interface Shift {
  id: string;
  org_id: string;
  employee_id: string | null;
  department: string | null;
  start_time: string;
  end_time: string;
  break_minutes: number;
  status: ShiftStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  employee?: Employee;
}

export interface Schedule {
  id: string;
  org_id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: ScheduleStatus;
  total_hours: number;
  total_cost_usd: number;
  coverage_score: number;
  created_by: string | null;
  created_at: string;
  shifts?: Shift[];
}

export interface TimeOffRequest {
  id: string;
  org_id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: TimeOffType;
  status: TimeOffStatus;
  notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  employee?: Employee;
}

export interface CoverageRule {
  id: string;
  org_id: string;
  department: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  min_employees: number;
  required_skills: string[];
  created_at: string;
}

export interface LaborCost {
  id: string;
  org_id: string;
  period_start: string;
  period_end: string;
  department: string | null;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  total_cost_usd: number;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface GenerateScheduleInput {
  org_id: string;
  period_start: string;
  period_end: string;
  departments: string[];
  employees: Employee[];
  coverage_rules: CoverageRule[];
  time_off_requests: TimeOffRequest[];
  constraints?: {
    max_shifts_per_employee_per_week?: number;
    min_hours_between_shifts?: number;
    prefer_consistent_schedules?: boolean;
  };
}

export interface ShiftAssignment {
  employee_id: string;
  department: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  notes?: string;
}

export interface GenerateScheduleOutput {
  shifts: ShiftAssignment[];
  coverage_score: number;
  total_hours: number;
  total_cost_usd: number;
  reasoning: string;
  warnings: string[];
}

export interface LaborForecast {
  week_start: string;
  week_end: string;
  projected_hours: number;
  projected_cost_usd: number;
  confidence_low: number;
  confidence_high: number;
  department_breakdown: Record<string, { hours: number; cost: number }>;
}