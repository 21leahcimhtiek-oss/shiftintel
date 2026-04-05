import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }) },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { org_id: "org-1", role: "manager" }, error: null }),
    })),
  })),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

describe("Schedules API", () => {
  describe("GET /api/schedules", () => {
    it("returns 401 when unauthenticated", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockImplementationOnce(() => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
        from: jest.fn(),
      }));
      const { GET } = await import("@/app/api/schedules/route");
      const req = new NextRequest("http://localhost/api/schedules");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/schedules", () => {
    it("validates required fields", async () => {
      const { POST } = await import("@/app/api/schedules/route");
      const req = new NextRequest("http://localhost/api/schedules", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("creates a schedule with valid data", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockSchedule = { id: "sched-1", name: "Week 1", period_start: "2024-01-15", period_end: "2024-01-21" };
      createClient.mockImplementationOnce(() => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }) },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          single: jest.fn()
            .mockResolvedValueOnce({ data: { org_id: "org-1", role: "manager" }, error: null })
            .mockResolvedValueOnce({ data: mockSchedule, error: null }),
        })),
      }));

      const { POST } = await import("@/app/api/schedules/route");
      const req = new NextRequest("http://localhost/api/schedules", {
        method: "POST",
        body: JSON.stringify({ name: "Week 1", period_start: "2024-01-15", period_end: "2024-01-21" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });
});