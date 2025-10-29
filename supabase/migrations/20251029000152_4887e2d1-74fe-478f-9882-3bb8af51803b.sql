-- Fix revenue sign handling in v_revenue_cost_summary view
CREATE OR REPLACE VIEW public.v_revenue_cost_summary AS
SELECT 
  ps.company_id,
  ps.period_id,
  SUM(CASE WHEN sa.category = 'revenue' THEN ABS(ps.net_balance) ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN sa.category = 'cogs' THEN ABS(ps.net_balance) ELSE 0 END) AS total_cogs,
  SUM(CASE WHEN sa.category = 'operating_expense' THEN ABS(ps.net_balance) ELSE 0 END) AS total_opex,
  SUM(CASE WHEN sa.category = 'revenue' THEN ABS(ps.net_balance) ELSE 0 END) - 
    SUM(CASE WHEN sa.category IN ('cogs', 'operating_expense', 'other_expense') THEN ABS(ps.net_balance) ELSE 0 END) +
    SUM(CASE WHEN sa.category = 'other_income' THEN ABS(ps.net_balance) ELSE 0 END) AS net_profit,
  CASE 
    WHEN SUM(CASE WHEN sa.category = 'revenue' THEN ABS(ps.net_balance) ELSE 0 END) > 0
    THEN ROUND(
      ((SUM(CASE WHEN sa.category = 'revenue' THEN ABS(ps.net_balance) ELSE 0 END) - 
        SUM(CASE WHEN sa.category IN ('cogs', 'operating_expense', 'other_expense') THEN ABS(ps.net_balance) ELSE 0 END) +
        SUM(CASE WHEN sa.category = 'other_income' THEN ABS(ps.net_balance) ELSE 0 END)) /
       SUM(CASE WHEN sa.category = 'revenue' THEN ABS(ps.net_balance) ELSE 0 END)) * 100
    , 2)
    ELSE 0
  END AS margin_percent
FROM public.period_summary ps
INNER JOIN public.std_accounts sa ON sa.id = ps.std_account_id
GROUP BY ps.company_id, ps.period_id;