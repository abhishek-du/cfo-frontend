-- Fix security linter warnings

-- Fix function search path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_periods_updated_at BEFORE UPDATE ON public.periods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_mappings_updated_at BEFORE UPDATE ON public.account_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate views with explicit security invoker
DROP VIEW IF EXISTS public.v_revenue_cost_summary CASCADE;
DROP VIEW IF EXISTS public.v_period_account_totals CASCADE;

CREATE VIEW public.v_period_account_totals
WITH (security_invoker=on) AS
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

CREATE VIEW public.v_revenue_cost_summary
WITH (security_invoker=on) AS
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