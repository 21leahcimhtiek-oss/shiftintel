import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "test@test.com" } }, error: null }) },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { org_id: "org-1", role: "manager" }, error: null }),
    })),
  })),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

describe("Shifts API", () => {
  describe("GET /api/shifts", () => {
    it("returns 401 when unauthenticated", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockImplementationOnce(() => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
        from: jest.fn(),
      }));
      const { GET } = await import("@/app/api/shifts/route");
      const req = new NextRequest("http://localhost/api/shifts");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("returns shifts list for authenticated user", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockShifts = [
        { id: "s1", department: "Operations", start_time: "2024-01-15T09:00:00Z", end_time: "2024-01-15T17:00:00Z", status: "published" },
      ];
      createClient.mockImplementationOnce(() => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }) },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockShifts, error: null }),
          single: jest.fn().mockResolvedValue({ data: { org_id: "org-1" }, error: null }),
        })),
      }));

      const { GET } = await import("@/app/api/shifts/route");
      const req = new NextRequest("http://localhost/api/shifts");
      const res = await GET(req);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/shifts", () => {
    it("returns 400 for invalid shift data", async () => {
      const { POST } = await import("@/app/api/shifts/route");
      const req = new NextRequest("http://localhost/api/shifts", {
        method: "POST",
        body: JSON.stringify({ department: "Ops" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 403 for employee role", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockImplementationOnce(() => ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }) },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { org_id: "org-1", role: "employee" }, error: null }),
        })),
      }));

      const { POST } = await import("@/app/api/shifts/route");
      const req = new NextRequest("http://localhost/api/shifts", {
        method: "POST",
        body: JSON.stringify({
          department: "Operations",
          start_time: "2024-01-15T09:00:00Z",
          end_time: "2024-01-15T17:00:00Z",
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });
  });
});