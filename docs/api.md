# ShiftIntel REST API

Base URL: `https://your-app.vercel.app/api`

All endpoints require a valid Supabase session cookie (set via browser auth).

## Authentication
Login via `/login` to establish a session. API routes read the session from cookies.

---

## Shifts

### `GET /api/shifts`
List shifts for the authenticated user's organization.

**Query Parameters:**
- `start` — ISO datetime, filter shifts starting after
- `end` — ISO datetime, filter shifts starting before
- `department` — string, filter by department
- `employee_id` — UUID, filter by employee
- `status` — shift status

**Response:** `{ data: Shift[] }`

### `POST /api/shifts`
Create a new shift. Requires manager+ role.

**Body:**
```json
{
  "employee_id": "uuid (optional)",
  "department": "Operations",
  "start_time": "2024-01-15T09:00:00Z",
  "end_time": "2024-01-15T17:00:00Z",
  "break_minutes": 30,
  "status": "draft",
  "notes": "optional notes"
}
```

### `GET /api/shifts/:id`
Get a single shift with employee details.

### `PATCH /api/shifts/:id`
Update shift status, times, or assignment.

### `DELETE /api/shifts/:id`
Delete a shift. Requires manager+ role.

---

## Schedules

### `GET /api/schedules`
List all schedules for the org.

### `POST /api/schedules`
Create a new schedule.

**Body:**
```json
{
  "name": "Week of Jan 15",
  "period_start": "2024-01-15",
  "period_end": "2024-01-21"
}
```

### `GET /api/schedules/:id`
Get schedule with all linked shifts.

### `POST /api/schedules/:id/generate`
Trigger AI schedule generation. Requires Pro/Enterprise plan.

**Body:**
```json
{
  "departments": ["Operations", "Sales"],
  "constraints": {
    "max_shifts_per_employee_per_week": 5,
    "min_hours_between_shifts": 8,
    "prefer_consistent_schedules": true
  }
}
```

**Response:** `{ data: GenerateScheduleOutput }`

---

## Employees

### `GET /api/employees`
List employees. Filter by `?department=Operations`.

### `POST /api/employees`
Create employee.

### `GET /api/employees/:id`
Get employee profile.

### `PATCH /api/employees/:id`
Update employee.

### `DELETE /api/employees/:id`
Delete employee. Requires owner/admin.

---

## Time Off

### `GET /api/time-off`
List requests. Filter by `?status=pending`.

### `POST /api/time-off`
Submit a time-off request.

### `PATCH /api/time-off/:id`
Approve or deny a request. Requires manager+ role.

**Body:** `{ "status": "approved" | "denied" }`

---

## Billing

### `POST /api/billing/create-checkout`
Create Stripe checkout session.

**Body:** `{ "plan": "starter" | "pro" | "enterprise" }`

**Response:** `{ url: string }` — redirect to Stripe

### `POST /api/billing/portal`
Create Stripe billing portal session.

### `POST /api/billing/webhook`
Stripe webhook handler (signature verified). Handles subscription events.

---

## Rate Limits

- General API: 60 requests/minute per user
- AI endpoints: 10 requests/minute per user

Exceeded limits return `429 Too Many Requests`.