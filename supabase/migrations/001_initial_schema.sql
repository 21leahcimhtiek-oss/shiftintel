-- ShiftIntel Initial Schema
-- Migration: 001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGS
-- ============================================================
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORG MEMBERS
-- ============================================================
CREATE TABLE org_members (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'manager', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- ============================================================
-- EMPLOYEES
-- ============================================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role_title TEXT,
  department TEXT,
  hourly_rate NUMERIC(10, 2) DEFAULT 0,
  max_hours_per_week INTEGER DEFAULT 40,
  skills JSONB DEFAULT '[]',
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- ============================================================
-- SHIFTS
-- ============================================================
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  department TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shifts_end_after_start CHECK (end_time > start_time)
);

-- ============================================================
-- SCHEDULES
-- ============================================================
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  total_hours NUMERIC(10, 2) DEFAULT 0,
  total_cost_usd NUMERIC(12, 2) DEFAULT 0,
  coverage_score INTEGER DEFAULT 0 CHECK (coverage_score >= 0 AND coverage_score <= 100),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT schedules_end_after_start CHECK (period_end >= period_start)
);

-- ============================================================
-- SCHEDULE SHIFTS (junction)
-- ============================================================
CREATE TABLE schedule_shifts (
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  PRIMARY KEY (schedule_id, shift_id)
);

-- ============================================================
-- TIME OFF REQUESTS
-- ============================================================
CREATE TABLE time_off_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT time_off_end_after_start CHECK (end_date >= start_date)
);

-- ============================================================
-- COVERAGE RULES
-- ============================================================
CREATE TABLE coverage_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  min_employees INTEGER NOT NULL DEFAULT 1,
  required_skills JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LABOR COSTS
-- ============================================================
CREATE TABLE labor_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  department TEXT,
  total_hours NUMERIC(10, 2) DEFAULT 0,
  regular_hours NUMERIC(10, 2) DEFAULT 0,
  overtime_hours NUMERIC(10, 2) DEFAULT 0,
  total_cost_usd NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_shifts_org_start ON shifts(org_id, start_time);
CREATE INDEX idx_shifts_employee ON shifts(employee_id);
CREATE INDEX idx_shifts_status ON shifts(org_id, status);
CREATE INDEX idx_employees_org_dept ON employees(org_id, department);
CREATE INDEX idx_labor_costs_org_period ON labor_costs(org_id, period_start DESC);
CREATE INDEX idx_time_off_org_employee ON time_off_requests(org_id, employee_id);
CREATE INDEX idx_schedules_org ON schedules(org_id, period_start DESC);
CREATE INDEX idx_org_members_user ON org_members(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_costs ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM org_members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ORGS policies
CREATE POLICY "Users can view their org" ON orgs
  FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "Owners can update their org" ON orgs
  FOR UPDATE USING (id = get_user_org_id() AND get_user_role() IN ('owner', 'admin'));

-- ORG MEMBERS policies
CREATE POLICY "Members can view their org members" ON org_members
  FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Admins can manage members" ON org_members
  FOR ALL USING (org_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin'));

-- EMPLOYEES policies
CREATE POLICY "Org members can view employees" ON employees
  FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Managers can manage employees" ON employees
  FOR ALL USING (org_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

-- SHIFTS policies
CREATE POLICY "Org members can view shifts" ON shifts
  FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Managers can manage shifts" ON shifts
  FOR ALL USING (org_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

-- SCHEDULES policies
CREATE POLICY "Org members can view schedules" ON schedules
  FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Managers can manage schedules" ON schedules
  FOR ALL USING (org_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

-- SCHEDULE SHIFTS policies
CREATE POLICY "Org members can view schedule shifts" ON schedule_shifts
  FOR SELECT USING (
    schedule_id IN (SELECT id FROM schedules WHERE org_id = get_user_org_id())
  );
CREATE POLICY "Managers can manage schedule shifts" ON schedule_shifts
  FOR ALL USING (
    schedule_id IN (SELECT id FROM schedules WHERE org_id = get_user_org_id())
    AND get_user_role() IN ('owner', 'admin', 'manager')
  );

-- TIME OFF REQUESTS policies
CREATE POLICY "Employees can view own requests" ON time_off_requests
  FOR SELECT USING (
    org_id = get_user_org_id() AND (
      employee_id IN (SELECT id FROM employees WHERE org_id = get_user_org_id())
      OR get_user_role() IN ('owner', 'admin', 'manager')
    )
  );
CREATE POLICY "Employees can create requests" ON time_off_requests
  FOR INSERT WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Managers can update requests" ON time_off_requests
  FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

-- COVERAGE RULES policies
CREATE POLICY "Org members can view coverage rules" ON coverage_rules
  FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Managers can manage coverage rules" ON coverage_rules
  FOR ALL USING (org_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

-- LABOR COSTS policies
CREATE POLICY "Managers can view labor costs" ON labor_costs
  FOR SELECT USING (org_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));
CREATE POLICY "System can insert labor costs" ON labor_costs
  FOR INSERT WITH CHECK (org_id = get_user_org_id());