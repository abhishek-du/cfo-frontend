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

export const useFileImports = (companyId: string) => {
  return useQuery({
    queryKey: ['file-imports', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_imports')
        .select(`
          id,
          filename,
          status,
          total_rows,
          successful_rows,
          error_rows,
          error_details,
          created_at,
          completed_at,
          period_id,
          periods (
            label
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};

export const useUploadTrialBalance = () => {
  return async (params: {
    file: File;
    periodId: string;
    companyId: string;
    userId: string;
  }) => {
    const { file, periodId, companyId, userId } = params;

    // Read file content
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('file_imports')
      .insert({
        company_id: companyId,
        period_id: periodId,
        filename: file.name,
        uploaded_by: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (importError) throw importError;

    // Call edge function
    const { data, error } = await supabase.functions.invoke('process-trial-balance', {
      body: {
        fileContent,
        periodId,
        companyId,
        importId: importRecord.id,
        userId,
      },
    });

    if (error) throw error;
    return data;
  };
};

export const useCreatePeriod = () => {
  return async (
    companyId: string,
    periodData: {
      label: string;
      period_type: 'monthly' | 'quarterly' | 'annual';
      start_date: string;
      end_date: string;
    }
  ) => {
    const { data, error } = await supabase
      .from('periods')
      .insert({
        company_id: companyId,
        label: periodData.label,
        period_type: periodData.period_type,
        start_date: periodData.start_date,
        end_date: periodData.end_date,
        is_closed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };
};
