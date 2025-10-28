-- Update compute_kpis function to use ABS() for revenue, COGS, and OPEX
CREATE OR REPLACE FUNCTION public.compute_kpis(p_company_id uuid, p_period_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  -- Get financial totals from period_summary using ABS() for revenue/cogs/opex
  SELECT 
    COALESCE(SUM(CASE WHEN sa.category = 'revenue' THEN ABS(ps.net_balance) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.category = 'cogs' THEN ABS(ps.net_balance) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.category = 'operating_expense' THEN ABS(ps.net_balance) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.code LIKE '11%' THEN ps.net_balance ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.code LIKE '21%' THEN ABS(ps.net_balance) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.code LIKE '1%' THEN ps.net_balance ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.code LIKE '2%' THEN ABS(ps.net_balance) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.code LIKE '3%' THEN ps.net_balance ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.code = '1110' THEN ps.net_balance ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN sa.code = '1120' THEN ps.net_balance ELSE 0 END), 0)
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
$function$;