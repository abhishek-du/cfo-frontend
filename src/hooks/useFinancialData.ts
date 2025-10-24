import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFinancialSummary = (companyId: string, periodId: string) => {
  return useQuery({
    queryKey: ['financial-summary', companyId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_revenue_cost_summary')
        .select('*')
        .eq('company_id', companyId)
        .eq('period_id', periodId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && !!periodId,
  });
};

export const useKPIValues = (companyId: string, periodId: string) => {
  return useQuery({
    queryKey: ['kpi-values', companyId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_values')
        .select(`
          value,
          previous_period_value,
          change_percent,
          kpi_catalog (
            code,
            name,
            category,
            description,
            display_format
          )
        `)
        .eq('company_id', companyId)
        .eq('period_id', periodId)
        .order('kpi_catalog(sort_order)');

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && !!periodId,
  });
};

export const usePeriods = (companyId: string) => {
  return useQuery({
    queryKey: ['periods', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('company_id', companyId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*, companies(*)')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return { user, profile };
    },
  });
};

export const useGenerateInsights = () => {
  return async (companyId: string, periodId: string) => {
    const { data, error } = await supabase.functions.invoke('generate-financial-insights', {
      body: { companyId, periodId }
    });

    if (error) throw error;
    return data;
  };
};
