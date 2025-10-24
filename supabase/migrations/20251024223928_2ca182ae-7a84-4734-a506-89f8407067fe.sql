-- Complete Foundation + Phase 2 Migration

-- ============================================================================
-- PHASE 1: FOUNDATION TABLES
-- ============================================================================

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own company"
  ON public.companies FOR UPDATE
  USING (id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================================
-- PHASE 2: ENUMS
-- ============================================================================

CREATE TYPE public.account_category AS ENUM (
  'asset',
  'liability', 
  'equity',
  'revenue',
  'cogs',
  'operating_expense',
  'other_income',
  'other_expense'
);

CREATE TYPE public.period_type AS ENUM ('monthly', 'quarterly', 'annual');

CREATE TYPE public.import_status AS ENUM ('pending', 'processing', 'succeeded', 'failed');

CREATE TYPE public.kpi_formula_type AS ENUM ('ratio', 'percentage', 'absolute', 'custom');

-- ============================================================================
-- PHASE 2: CORE TABLES
-- ============================================================================

-- Periods: Financial reporting periods
CREATE TABLE public.periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_type public.period_type NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  label TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, start_date, end_date)
);

-- Standard Chart of Accounts
CREATE TABLE public.std_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category public.account_category NOT NULL,
  parent_id UUID REFERENCES public.std_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- File Imports
CREATE TABLE public.file_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  status public.import_status DEFAULT 'pending',
  total_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  error_details JSONB,
  uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Trial Balance Rows
CREATE TABLE public.trial_balance_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.file_imports(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) GENERATED ALWAYS AS (debit - credit) STORED,
  row_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Account Mappings
CREATE TABLE public.account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_account_code TEXT NOT NULL,
  client_account_name TEXT NOT NULL,
  std_account_id UUID NOT NULL REFERENCES public.std_accounts(id) ON DELETE RESTRICT,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  mapped_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, client_account_code)
);

-- Period Summary
CREATE TABLE public.period_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  std_account_id UUID NOT NULL REFERENCES public.std_accounts(id) ON DELETE RESTRICT,
  total_debit DECIMAL(15,2) DEFAULT 0,
  total_credit DECIMAL(15,2) DEFAULT 0,
  net_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, period_id, std_account_id)
);

-- KPI Catalog
CREATE TABLE public.kpi_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  formula_type public.kpi_formula_type NOT NULL,
  formula_definition JSONB NOT NULL,
  category TEXT NOT NULL,
  display_format TEXT DEFAULT 'decimal',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- KPI Rollouts
CREATE TABLE public.kpi_rollouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  kpi_id UUID NOT NULL REFERENCES public.kpi_catalog(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, kpi_id)
);

-- KPI Values
CREATE TABLE public.kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  kpi_id UUID NOT NULL REFERENCES public.kpi_catalog(id) ON DELETE CASCADE,
  value DECIMAL(15,4),
  previous_period_value DECIMAL(15,4),
  change_percent DECIMAL(8,2),
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, period_id, kpi_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_profiles_company ON public.user_profiles(company_id);
CREATE INDEX idx_periods_company ON public.periods(company_id, start_date DESC);
CREATE INDEX idx_trial_balance_company_period ON public.trial_balance_rows(company_id, period_id);
CREATE INDEX idx_account_mappings_company ON public.account_mappings(company_id);
CREATE INDEX idx_period_summary_period ON public.period_summary(period_id, std_account_id);
CREATE INDEX idx_kpi_values_period ON public.kpi_values(company_id, period_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.std_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_balance_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_rollouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;

-- Periods policies
CREATE POLICY "Users can view their company periods"
  ON public.periods FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create periods for their company"
  ON public.periods FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company periods"
  ON public.periods FOR UPDATE
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- Standard accounts are readable by all authenticated users
CREATE POLICY "Standard accounts are viewable by everyone"
  ON public.std_accounts FOR SELECT
  USING (true);

-- File imports policies
CREATE POLICY "Users can view their company imports"
  ON public.file_imports FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create imports for their company"
  ON public.file_imports FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company imports"
  ON public.file_imports FOR UPDATE
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- Trial balance rows policies
CREATE POLICY "Users can view their company trial balance"
  ON public.trial_balance_rows FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert trial balance for their company"
  ON public.trial_balance_rows FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- Account mappings policies
CREATE POLICY "Users can view their company mappings"
  ON public.account_mappings FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company mappings"
  ON public.account_mappings FOR ALL
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- Period summary policies
CREATE POLICY "Users can view their company period summary"
  ON public.period_summary FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- KPI catalog is readable by all authenticated users
CREATE POLICY "KPI catalog is viewable by everyone"
  ON public.kpi_catalog FOR SELECT
  USING (true);

-- KPI rollouts policies
CREATE POLICY "Users can view their company KPI rollouts"
  ON public.kpi_rollouts FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- KPI values policies
CREATE POLICY "Users can view their company KPI values"
  ON public.kpi_values FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_periods_updated_at BEFORE UPDATE ON public.periods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_mappings_updated_at BEFORE UPDATE ON public.account_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SEED DATA - STANDARD ACCOUNTS
-- ============================================================================

INSERT INTO public.std_accounts (code, name, category, sort_order) VALUES
-- Assets
('1000', 'Assets', 'asset', 10),
('1100', 'Current Assets', 'asset', 20),
('1110', 'Cash & Cash Equivalents', 'asset', 30),
('1120', 'Accounts Receivable', 'asset', 40),
('1130', 'Inventory', 'asset', 50),
('1140', 'Prepaid Expenses', 'asset', 60),
('1200', 'Fixed Assets', 'asset', 70),
('1210', 'Property, Plant & Equipment', 'asset', 80),
('1220', 'Accumulated Depreciation', 'asset', 90),
-- Liabilities
('2000', 'Liabilities', 'liability', 100),
('2100', 'Current Liabilities', 'liability', 110),
('2110', 'Accounts Payable', 'liability', 120),
('2120', 'Accrued Expenses', 'liability', 130),
('2130', 'Short-term Debt', 'liability', 140),
('2200', 'Long-term Liabilities', 'liability', 150),
('2210', 'Long-term Debt', 'liability', 160),
-- Equity
('3000', 'Equity', 'equity', 170),
('3100', 'Owner''s Equity', 'equity', 180),
('3200', 'Retained Earnings', 'equity', 190),
-- Revenue
('4000', 'Revenue', 'revenue', 200),
('4100', 'Sales Revenue', 'revenue', 210),
('4200', 'Service Revenue', 'revenue', 220),
-- COGS
('5000', 'Cost of Goods Sold', 'cogs', 230),
('5100', 'Direct Materials', 'cogs', 240),
('5200', 'Direct Labor', 'cogs', 250),
('5300', 'Manufacturing Overhead', 'cogs', 260),
-- Operating Expenses
('6000', 'Operating Expenses', 'operating_expense', 270),
('6100', 'Salaries & Wages', 'operating_expense', 280),
('6200', 'Rent & Utilities', 'operating_expense', 290),
('6300', 'Marketing & Advertising', 'operating_expense', 300),
('6400', 'Administrative Expenses', 'operating_expense', 310),
('6500', 'Depreciation & Amortization', 'operating_expense', 320),
-- Other
('7000', 'Other Income', 'other_income', 330),
('8000', 'Other Expenses', 'other_expense', 340),
('8100', 'Interest Expense', 'other_expense', 350);

-- ============================================================================
-- SEED DATA - KPI CATALOG
-- ============================================================================

INSERT INTO public.kpi_catalog (code, name, description, formula_type, formula_definition, category, display_format, sort_order) VALUES
('gross_margin', 'Gross Margin %', 'Revenue minus COGS as percentage of revenue', 'percentage', 
 '{"numerator": ["revenue", "cogs"], "operator": "subtract", "denominator": ["revenue"]}', 
 'profitability', 'percentage', 10),
('operating_margin', 'Operating Margin %', 'Operating income as percentage of revenue', 'percentage',
 '{"numerator": ["revenue", "cogs", "operating_expense"], "operator": "subtract_all", "denominator": ["revenue"]}',
 'profitability', 'percentage', 20),
('net_profit_margin', 'Net Profit Margin %', 'Net income as percentage of revenue', 'percentage',
 '{"numerator": ["revenue", "cogs", "operating_expense", "other_expense"], "operator": "subtract_all", "add": ["other_income"], "denominator": ["revenue"]}',
 'profitability', 'percentage', 30),
('current_ratio', 'Current Ratio', 'Current assets divided by current liabilities', 'ratio',
 '{"numerator": ["1100"], "denominator": ["2100"]}',
 'liquidity', 'decimal', 40),
('quick_ratio', 'Quick Ratio', 'Liquid assets divided by current liabilities', 'ratio',
 '{"numerator": ["1110", "1120"], "denominator": ["2100"]}',
 'liquidity', 'decimal', 50),
('debt_to_equity', 'Debt-to-Equity', 'Total debt divided by total equity', 'ratio',
 '{"numerator": ["2000"], "denominator": ["3000"]}',
 'leverage', 'decimal', 60),
('debt_ratio', 'Debt Ratio', 'Total debt as percentage of total assets', 'percentage',
 '{"numerator": ["2000"], "denominator": ["1000"]}',
 'leverage', 'percentage', 70),
('asset_turnover', 'Asset Turnover', 'Revenue divided by total assets', 'ratio',
 '{"numerator": ["revenue"], "denominator": ["1000"]}',
 'efficiency', 'decimal', 80);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW public.v_period_account_totals AS
SELECT 
  tb.company_id,
  tb.period_id,
  sa.id AS std_account_id,
  sa.code AS std_account_code,
  sa.name AS std_account_name,
  sa.category,
  SUM(tb.debit) AS total_debit,
  SUM(tb.credit) AS total_credit,
  SUM(tb.balance) AS net_balance
FROM public.trial_balance_rows tb
INNER JOIN public.account_mappings am ON am.company_id = tb.company_id 
  AND am.client_account_code = tb.account_code
INNER JOIN public.std_accounts sa ON sa.id = am.std_account_id
GROUP BY tb.company_id, tb.period_id, sa.id, sa.code, sa.name, sa.category;

CREATE OR REPLACE VIEW public.v_revenue_cost_summary AS
SELECT 
  company_id,
  period_id,
  SUM(CASE WHEN category = 'revenue' THEN net_balance ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN category = 'cogs' THEN ABS(net_balance) ELSE 0 END) AS total_cogs,
  SUM(CASE WHEN category = 'operating_expense' THEN ABS(net_balance) ELSE 0 END) AS total_opex,
  SUM(CASE WHEN category = 'revenue' THEN net_balance ELSE 0 END) - 
    SUM(CASE WHEN category IN ('cogs', 'operating_expense', 'other_expense') THEN ABS(net_balance) ELSE 0 END) +
    SUM(CASE WHEN category = 'other_income' THEN net_balance ELSE 0 END) AS net_profit,
  CASE 
    WHEN SUM(CASE WHEN category = 'revenue' THEN net_balance ELSE 0 END) > 0 THEN
      ROUND((SUM(CASE WHEN category = 'revenue' THEN net_balance ELSE 0 END) - 
             SUM(CASE WHEN category IN ('cogs', 'operating_expense', 'other_expense') THEN ABS(net_balance) ELSE 0 END) +
             SUM(CASE WHEN category = 'other_income' THEN net_balance ELSE 0 END)) * 100.0 / 
            SUM(CASE WHEN category = 'revenue' THEN net_balance ELSE 0 END), 2)
    ELSE 0
  END AS margin_percent
FROM public.v_period_account_totals
GROUP BY company_id, period_id;