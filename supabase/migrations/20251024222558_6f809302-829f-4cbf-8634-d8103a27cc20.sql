-- Create app schema for business logic
CREATE SCHEMA IF NOT EXISTS app;

-- Companies table
CREATE TABLE app.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  fiscal_year_end_month INTEGER CHECK (fiscal_year_end_month BETWEEN 1 AND 12),
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE app.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES app.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE app.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON app.companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM app.user_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own company"
  ON app.companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM app.user_profiles
      WHERE id = auth.uid()
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view profiles in their company"
  ON app.user_profiles FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM app.user_profiles
      WHERE id = auth.uid()
    )
    OR id = auth.uid()
  );

CREATE POLICY "Users can view their own profile"
  ON app.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON app.user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON app.companies
  FOR EACH ROW
  EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.update_updated_at_column();