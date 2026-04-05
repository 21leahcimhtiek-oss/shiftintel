import { generateSchedule } from "@/lib/openai/generate-schedule";
import type { GenerateScheduleInput } from "@/types";

const mockInput: GenerateScheduleInput = {
  org_id: "org-1",
  period_start: "2024-01-15",
  period_end: "2024-01-21",
  departments: ["Operations"],
  employees: [
    {
      id: "emp-1", org_id: "org-1", name: "Alice Smith", email: "alice@test.com",
      role_title: "Operator", department: "Operations", hourly_rate: 18, max_hours_per_week: 40,
      skills: ["forklift"], availability: { monday: [{ start: "09:00", end: "17:00" }] }, created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "emp-2", org_id: "org-1", name: "Bob Jones", email: "bob@test.com",
      role_title: "Operator", department: "Operations", hourly_rate: 20, max_hours_per_week: 40,
      skills: [], availability: {}, created_at: "2024-01-01T00:00:00Z",
    },
  ],
  coverage_rules: [
    {
      id: "rule-1", org_id: "org-1", department: "Operations", day_of_week: 1,
      start_time: "09:00", end_time: "17:00", min_employees: 1, required_skills: [], created_at: "2024-01-01T00:00:00Z",
    },
  ],
  time_off_requests: [],
};

describe("generateSchedule", () => {
  it("returns a schedule with shifts and coverage score", async () => {
    const result = await generateSchedule(mockInput);
    expect(result).toBeDefined();
    expect(Array.isArray(result.shifts)).toBe(true);
    expect(typeof result.coverage_score).toBe("number");
    expect(result.coverage_score).toBeGreaterThanOrEqual(0);
    expect(result.coverage_score).toBeLessThanOrEqual(100);
    expect(typeof result.total_hours).toBe("number");
    expect(typeof result.total_cost_usd).toBe("number");
    expect(typeof result.reasoning).toBe("string");
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("handles empty coverage rules gracefully", async () => {
    const input = { ...mockInput, coverage_rules: [] };
    const result = await generateSchedule(input);
    expect(result).toBeDefined();
    expect(Array.isArray(result.shifts)).toBe(true);
  });

  it("respects approved time-off requests", async () => {
    const input = {
      ...mockInput,
      time_off_requests: [{
        id: "tor-1", org_id: "org-1", employee_id: "emp-1",
        start_date: "2024-01-15", end_date: "2024-01-21",
        type: "vacation" as const, status: "approved" as const,
        notes: null, reviewed_by: null, created_at: "2024-01-01T00:00:00Z",
      }],
    };
    const result = await generateSchedule(input);
    // emp-1 is on vacation, should not be scheduled
    const emp1Shifts = result.shifts.filter(s => s.employee_id === "emp-1");
    expect(emp1Shifts.length).toBe(0);
  });
});