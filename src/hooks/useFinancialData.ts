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

export const useCompanyProfile = (companyId: string) => {
  return useQuery({
    queryKey: ['company-profile', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};

export const useUpdateCompany = () => {
  return async (companyId: string, updates: { name?: string; industry?: string }) => {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };
};

export const useUnmappedAccounts = (companyId: string) => {
  return useQuery({
    queryKey: ['unmapped-accounts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trial_balance_rows')
        .select('account_code, account_name')
        .eq('company_id', companyId);

      if (error) throw error;

      // Get existing mappings
      const { data: mappings } = await supabase
        .from('account_mappings')
        .select('client_account_code, client_account_name')
        .eq('company_id', companyId);

      // Filter out already mapped accounts
      const mappedSet = new Set(
        mappings?.map(m => `${m.client_account_code || ''}:${m.client_account_name}`) || []
      );

      const uniqueAccounts = data.reduce((acc, row) => {
        const key = `${row.account_code || ''}:${row.account_name}`;
        if (!mappedSet.has(key) && !acc.some(a => 
          a.account_code === row.account_code && a.account_name === row.account_name
        )) {
          acc.push(row);
        }
        return acc;
      }, [] as typeof data);

      return uniqueAccounts;
    },
    enabled: !!companyId,
  });
};

export const useMappedAccounts = (companyId: string) => {
  return useQuery({
    queryKey: ['mapped-accounts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_mappings')
        .select(`
          id,
          client_account_code,
          client_account_name,
          confidence_score,
          std_account_id,
          std_accounts (
            code,
            name,
            category
          )
        `)
        .eq('company_id', companyId)
        .order('client_account_code');

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};

export const useStandardAccounts = () => {
  return useQuery({
    queryKey: ['standard-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('std_accounts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAccountMapping = () => {
  return async (params: {
    companyId: string;
    clientAccountCode: string | null;
    clientAccountName: string;
    stdAccountId: string;
    userId: string;
  }) => {
    const { data, error } = await supabase
      .from('account_mappings')
      .insert({
        company_id: params.companyId,
        client_account_code: params.clientAccountCode,
        client_account_name: params.clientAccountName,
        std_account_id: params.stdAccountId,
        mapped_by: params.userId,
        confidence_score: 1.0, // Manual mappings are 100% confident
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };
};

export const useUpdateAccountMapping = () => {
  return async (mappingId: string, stdAccountId: string) => {
    const { data, error } = await supabase
      .from('account_mappings')
      .update({ std_account_id: stdAccountId })
      .eq('id', mappingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };
};

export const useDeleteAccountMapping = () => {
  return async (mappingId: string) => {
    const { error } = await supabase
      .from('account_mappings')
      .delete()
      .eq('id', mappingId);

    if (error) throw error;
  };
};

export const useMappedTrialBalance = (companyId: string, periodId: string) => {
  return useQuery({
    queryKey: ['mapped-trial-balance', companyId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('period_summary')
        .select(`
          total_debit,
          total_credit,
          net_balance,
          std_accounts (
            code,
            name
          )
        `)
        .eq('company_id', companyId)
        .eq('period_id', periodId)
        .order('std_accounts(code)');

      if (error) throw error;

      // Get account mappings to show client codes/names
      const { data: mappings } = await supabase
        .from('account_mappings')
        .select('std_account_id, client_account_code, client_account_name')
        .eq('company_id', companyId);

      // Merge the data
      return data.map(row => {
        const mapping = mappings?.find(m => m.std_account_id === (row.std_accounts as any).id);
        return {
          std_account_code: (row.std_accounts as any)?.code,
          std_account_name: (row.std_accounts as any)?.name,
          client_account_code: mapping?.client_account_code || '-',
          client_account_name: mapping?.client_account_name || '-',
          total_debit: row.total_debit || 0,
          total_credit: row.total_credit || 0,
          net_balance: row.net_balance || 0,
        };
      });
    },
    enabled: !!companyId && !!periodId,
  });
};
