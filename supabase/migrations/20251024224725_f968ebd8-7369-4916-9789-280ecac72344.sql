-- Add RPC function for computing period summary

CREATE OR REPLACE FUNCTION public.compute_period_summary(
  p_company_id UUID,
  p_period_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete existing summary for this period
  DELETE FROM public.period_summary 
  WHERE company_id = p_company_id AND period_id = p_period_id;

  -- Compute and insert new summary
  INSERT INTO public.period_summary (company_id, period_id, std_account_id, total_debit, total_credit, net_balance)
  SELECT 
    tb.company_id,
    tb.period_id,
    sa.id AS std_account_id,
    SUM(tb.debit) AS total_debit,
    SUM(tb.credit) AS total_credit,
    SUM(tb.debit - tb.credit) AS net_balance
  FROM public.trial_balance_rows tb
  INNER JOIN public.account_mappings am 
    ON am.company_id = tb.company_id 
    AND am.client_account_code = tb.account_code
  INNER JOIN public.std_accounts sa 
    ON sa.id = am.std_account_id
  WHERE tb.company_id = p_company_id 
    AND tb.period_id = p_period_id
  GROUP BY tb.company_id, tb.period_id, sa.id;

  -- Log completion
  RAISE NOTICE 'Period summary computed for company % period %', p_company_id, p_period_id;
END;
$$;

-- Add RPC function for computing KPIs

CREATE OR REPLACE FUNCTION public.compute_kpis(
  p_company_id UUID,
  p_period_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_revenue DECIMAL(15,2);
  v_total_cogs DECIMAL(15,2);
  v_total_opex DECIMAL(15,2);
  v_current_assets DECIMAL(15,2);
  v_current_liabilities DECIMAL(15,2);
  v_total_assets DECIMAL(15,2);
  v_total_liabilities DECIMAL(15,2);
  v_total_equity DECIMAL(15,2);
  v_cash DECIMAL(15,2);
  v_ar DECIMAL(15,2);
BEGIN
  -- Get financial totals from period_summary
  SELECT 
    SUM(CASE WHEN sa.category = 'revenue' THEN ps.net_balance ELSE 0 END),
    SUM(CASE WHEN sa.category = 'cogs' THEN ABS(ps.net_balance) ELSE 0 END),
    SUM(CASE WHEN sa.category = 'operating_expense' THEN ABS(ps.net_balance) ELSE 0 END),
    SUM(CASE WHEN sa.code LIKE '11%' THEN ps.net_balance ELSE 0 END),
    SUM(CASE WHEN sa.code LIKE '21%' THEN ABS(ps.net_balance) ELSE 0 END),
    SUM(CASE WHEN sa.code LIKE '1%' THEN ps.net_balance ELSE 0 END),
    SUM(CASE WHEN sa.code LIKE '2%' THEN ABS(ps.net_balance) ELSE 0 END),
    SUM(CASE WHEN sa.code LIKE '3%' THEN ps.net_balance ELSE 0 END),
    SUM(CASE WHEN sa.code = '1110' THEN ps.net_balance ELSE 0 END),
    SUM(CASE WHEN sa.code = '1120' THEN ps.net_balance ELSE 0 END)
  INTO v_total_revenue, v_total_cogs, v_total_opex, 
       v_current_assets, v_current_liabilities,
       v_total_assets, v_total_liabilities, v_total_equity,
       v_cash, v_ar
  FROM public.period_summary ps
  INNER JOIN public.std_accounts sa ON sa.id = ps.std_account_id
  WHERE ps.company_id = p_company_id AND ps.period_id = p_period_id;

  -- Delete existing KPI values
  DELETE FROM public.kpi_values 
  WHERE company_id = p_company_id AND period_id = p_period_id;

  -- Compute and insert KPI values
  -- Gross Margin %
  IF v_total_revenue > 0 THEN
    INSERT INTO public.kpi_values (company_id, period_id, kpi_id, value)
    SELECT p_company_id, p_period_id, id, 
           ROUND(((v_total_revenue - v_total_cogs) / v_total_revenue * 100), 2)
    FROM public.kpi_catalog WHERE code = 'gross_margin';
  END IF;

  -- Operating Margin %
  IF v_total_revenue > 0 THEN
    INSERT INTO public.kpi_values (company_id, period_id, kpi_id, value)
    SELECT p_company_id, p_period_id, id,
           ROUND(((v_total_revenue - v_total_cogs - v_total_opex) / v_total_revenue * 100), 2)
    FROM public.kpi_catalog WHERE code = 'operating_margin';
  END IF;

  -- Current Ratio
  IF v_current_liabilities > 0 THEN
    INSERT INTO public.kpi_values (company_id, period_id, kpi_id, value)
    SELECT p_company_id, p_period_id, id,
           ROUND((v_current_assets / v_current_liabilities), 2)
    FROM public.kpi_catalog WHERE code = 'current_ratio';
  END IF;

  -- Quick Ratio
  IF v_current_liabilities > 0 THEN
    INSERT INTO public.kpi_values (company_id, period_id, kpi_id, value)
    SELECT p_company_id, p_period_id, id,
           ROUND(((v_cash + v_ar) / v_current_liabilities), 2)
    FROM public.kpi_catalog WHERE code = 'quick_ratio';
  END IF;

  -- Debt-to-Equity
  IF v_total_equity > 0 THEN
    INSERT INTO public.kpi_values (company_id, period_id, kpi_id, value)
    SELECT p_company_id, p_period_id, id,
           ROUND((v_total_liabilities / v_total_equity), 2)
    FROM public.kpi_catalog WHERE code = 'debt_to_equity';
  END IF;

  -- Asset Turnover
  IF v_total_assets > 0 THEN
    INSERT INTO public.kpi_values (company_id, period_id, kpi_id, value)
    SELECT p_company_id, p_period_id, id,
           ROUND((v_total_revenue / v_total_assets), 2)
    FROM public.kpi_catalog WHERE code = 'asset_turnover';
  END IF;

  RAISE NOTICE 'KPIs computed for company % period %', p_company_id, p_period_id;
END;
$$;