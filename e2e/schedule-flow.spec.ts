import { test, expect } from "@playwright/test";

test.describe("Schedule Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Use test credentials from environment
    await page.goto("/login");
    await page.fill('[placeholder="you@company.com"]', process.env.TEST_EMAIL || "test@shiftintel.com");
    await page.fill('[placeholder="••••••••"]', process.env.TEST_PASSWORD || "testpassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("dashboard loads with key metrics", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator("text=Coverage Score")).toBeVisible();
    await expect(page.locator("text=Shifts This Week")).toBeVisible();
  });

  test("schedule page shows weekly calendar", async ({ page }) => {
    await page.goto("/schedule");
    await expect(page.locator("h1")).toContainText("Schedule");
    await expect(page.locator("text=AI Generate")).toBeVisible();
  });

  test("new schedule page loads AI generator", async ({ page }) => {
    await page.goto("/schedule/new");
    await expect(page.locator("h1")).toContainText("AI Schedule Generator");
    await expect(page.locator("text=Generate AI Schedule")).toBeVisible();
    await expect(page.locator("text=Operations")).toBeVisible();
  });

  test("employees page shows roster", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.locator("h1")).toContainText("Employees");
  });

  test("time-off page shows request tabs", async ({ page }) => {
    await page.goto("/time-off");
    await expect(page.locator("h1")).toContainText("Time Off");
    await expect(page.locator("text=pending")).toBeVisible();
    await expect(page.locator("text=approved")).toBeVisible();
  });

  test("coverage page shows rules table", async ({ page }) => {
    await page.goto("/coverage");
    await expect(page.locator("h1")).toContainText("Coverage Rules");
    await expect(page.locator("text=Add Rule")).toBeVisible();
  });

  test("billing page shows plan options", async ({ page }) => {
    await page.goto("/billing");
    await expect(page.locator("text=Starter")).toBeVisible();
    await expect(page.locator("text=Pro")).toBeVisible();
    await expect(page.locator("text=Enterprise")).toBeVisible();
  });
});