import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client"; 
import { AxiosError } from "axios";

// Define general interfaces for API data
interface Period {
  id: string;
  label: string;
  name?: string; // Optional, as per normalizePeriods logic
  start_date: string;
  end_date: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  company_name: string;
  roles: string[];
}

interface CurrentUserResponse {
  user: { id: string; email: string };
  profile: Omit<UserProfile, 'id' | 'email'>;
  company: { name: string };
}

interface FinancialSummary {
  net_profit: number;
  margin_percent: number;
  period_id: string; // Added for useProfitabilityTrend
  // Add other properties as they appear in the /trial-balance/summary endpoint
}

interface KpiValue {
  id: string;
  kpi_code: string;
  value: number;
  period_id: string;
  company_id: string;
  // Add other properties as they appear in the /kpi/values endpoint
}

interface FileImport {
  id: string;
  filename: string;
  status: string;
  imported_at: string;
  // Add other properties as they appear in the /file-imports endpoint
}

interface UnmappedAccount {
  client_account_code: string | null;
  client_account_name: string;
  // Add other properties as they appear in the /trial-balance/unmapped-accounts endpoint
}

interface AccountMapping {
  id: string;
  client_account_code: string | null;
  client_account_name: string;
  std_account_id: string;
  mapped_by: string;
  confidence_score: number;
  // Add any other properties for mappings
}

interface StandardAccount {
  id: string;
  name: string;
  description: string;
  // Add any other properties for standard accounts
}

interface MappedTrialBalanceEntry {
  // Define structure of mapped trial balance entries
  [key: string]: any; // Use a more specific type if known
}

interface APIError {
  detail: string;
}

// Specific response types for previously 'any' returns
interface InsightResponse {
  insight: string;
  // Add other properties if known
}

interface UploadResponse {
  message: string;
  id?: string; // Assuming an ID might be returned for the uploaded resource
}

interface ComputeKpiResponse {
  message: string;
  status: string; // Or a more specific status type
}

interface RatioTrendEntry {
  period_id: string;
  kpi_code: string;
  value: number;
  // Add other properties if known
}

// small helper near top of file
const normalizePeriods = (periods: Period[]): Period[] => {
  return (periods || []).map(p => ({
    id: p.id,
    label: p.label ?? p.name ?? p.label,
    start_date: p.start_date,
    end_date: p.end_date,
  }));
};

export const useFinancialSummary = (companyId: string, periodId: string) => {
  return useQuery<FinancialSummary, AxiosError<APIError>>({
    queryKey: ['financial-summary', companyId, periodId],
    queryFn: async () => {
      try {
        const response = await api.get(`/trial-balance/summary?company_id=${companyId}&period_id=${periodId}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId && !!periodId,
  });
};

export const useKPIValues = (companyId: string, periodId: string) => {
  return useQuery<KpiValue[], AxiosError<APIError>>({
    queryKey: ['kpi-values', companyId, periodId],
    queryFn: async () => {
      try {
        const response = await api.get(`/kpi/values?company_id=${companyId}&period_id=${periodId}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId && !!periodId,
  });
};

export const usePeriods = (companyId: string) => {
  return useQuery<Period[], AxiosError<APIError>>({
    queryKey: ['periods', companyId],
    queryFn: async () => {
      try {
        const response = await api.get(`/periods?company_id=${companyId}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId,
  });
};

export const useCurrentUser = () => {
  return useQuery<UserProfile, AxiosError<APIError>>({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const response = await api.get<CurrentUserResponse>('/me');
        const { user, profile, company } = response.data;
        if (!user) throw new Error('Not authenticated');
        return { ...user, ...profile, company_name: company.name };
      } catch (error) {
        if ((error as AxiosError<APIError>).response?.status === 401 || (error as AxiosError<APIError>).response?.status === 404) {
          throw new Error('Not authenticated');
        }
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
  });
};

export const useGenerateInsights = () => {
  return async (companyId: string, periodId: string): Promise<InsightResponse> => {
    try {
      const response = await api.post(`/ai/insights`, { company_id: companyId, period_id: periodId });
      return response.data;
    } catch (error) {
      throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
    }
  };
};

export const useFileImports = (companyId: string) => {
  return useQuery<FileImport[], AxiosError<APIError>>({
    queryKey: ['file-imports', companyId],
    queryFn: async () => {
      try {
        const response = await api.get(`/file-imports?company_id=${companyId}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
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
  }): Promise<UploadResponse> => {
    const { file, periodId, companyId, userId } = params;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("company_id", companyId);
    fd.append("period_id", periodId);
    fd.append("user_id", userId);

    try {
      const response = await api.post("/uploads/trial-balance", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
    }
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
  ): Promise<Period> => {
    try {
      const response = await api.post(`/periods`, { ...periodData, company_id: companyId });
      return response.data;
    } catch (error) {
      throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
    }
  };
};

export const useCompanyProfile = (companyId: string) => {
  return useQuery<UserProfile, AxiosError<APIError>>({ // Assuming UserProfile can also serve as CompanyProfile with slight adjustment
    queryKey: ['company-profile', companyId],
    queryFn: async () => {
      try {
        const response = await api.get(`/companies/${companyId}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId,
  });
};

export const useUpdateCompany = () => {
  return async (companyId: string, updates: { name?: string; industry?: string }): Promise<UserProfile> => {
    try {
      const response = await api.put(`/companies/${companyId}`, updates);
      return response.data;
    } catch (error) {
      throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
    }
  };
};

export const useUnmappedAccounts = (companyId: string) => {
  return useQuery<UnmappedAccount[], AxiosError<APIError>>({
    queryKey: ['unmapped-accounts', companyId],
    queryFn: async () => {
      try {
        const [unmappedResponse, mappingsResponse] = await Promise.all([
          api.get<UnmappedAccount[]>(`/trial-balance/unmapped-accounts?company_id=${companyId}`),
          api.get<AccountMapping[]>(`/mappings?company_id=${companyId}`)
        ]);

        const data = unmappedResponse.data;
        const mappings = mappingsResponse.data;

        const mappedSet = new Set(
          mappings?.map((m: AccountMapping) => `${m.client_account_code || ''}:${m.client_account_name}`) || []
        );

        const uniqueAccounts = data.reduce((acc: UnmappedAccount[], row: UnmappedAccount) => {
          const key = `${row.client_account_code || ''}:${row.client_account_name}`;
          if (!mappedSet.has(key) && !acc.some(a => 
            a.client_account_code === row.client_account_code && a.client_account_name === row.client_account_name
          )) {
            acc.push(row);
          }
          return acc;
        }, []);

        return uniqueAccounts;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId,
  });
};

export const useMappedAccounts = (companyId: string) => {
  return useQuery<AccountMapping[], AxiosError<APIError>>({
    queryKey: ['mapped-accounts', companyId],
    queryFn: async () => {
      try {
        const response = await api.get(`/mappings?company_id=${companyId}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId,
  });
};

export const useStandardAccounts = () => {
  return useQuery<StandardAccount[], AxiosError<APIError>>({
    queryKey: ['standard-accounts'],
    queryFn: async () => {
      try {
        const response = await api.get(`/standard-accounts`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
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
  }): Promise<AccountMapping> => {
    try {
      const response = await api.post(`/mappings`, {
        company_id: params.companyId,
        client_account_code: params.clientAccountCode,
        client_account_name: params.clientAccountName,
        std_account_id: params.stdAccountId,
        mapped_by: params.userId,
        confidence_score: 1.0, // Manual mappings are 100% confident
      });
      return response.data;
    } catch (error) {
      throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
    }
  };
};

export const useUpdateAccountMapping = () => {
  return async (mappingId: string, stdAccountId: string): Promise<AccountMapping> => {
    try {
      const response = await api.put(`/mappings/${mappingId}`, { std_account_id: stdAccountId });
      return response.data;
    } catch (error) {
      throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
    }
  };
};

export const useDeleteAccountMapping = () => {
  return async (mappingId: string): Promise<void> => {
    try {
      await api.delete(`/mappings/${mappingId}`);
    } catch (error) {
      throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
    }
  };
};

export const useMappedTrialBalance = (companyId: string, periodId: string) => {
  return useQuery<MappedTrialBalanceEntry[], AxiosError<APIError>>({
    queryKey: ['mapped-trial-balance', companyId, periodId],
    queryFn: async () => {
      try {
        const response = await api.get(`/trial-balance/mapped-detail?company_id=${companyId}&period_id=${periodId}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId && !!periodId,
  });
};

export const useComputeKPIs = () => {
  const queryClient = useQueryClient();

  return useMutation<ComputeKpiResponse, AxiosError<APIError>, { companyId: string; periodId: string }> ({
    mutationFn: async ({ companyId, periodId }) => {
      try {
        const response = await api.post(`/kpi/compute`, { company_id: companyId, period_id: periodId });
        if (response.data?.error) throw new Error(response.data.error);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-values'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    },
  });
};

export const useProfitabilityTrend = (companyId: string) => {
  return useQuery<{ month: string; profit: number; margin: number }[], AxiosError<APIError>>({
    queryKey: ['profitability-trend', companyId],
    queryFn: async () => {
      try {
        const [periodsResponse, summariesResponse] = await Promise.all([
          api.get<Period[]>(`/periods?company_id=${companyId}`),
          api.get<FinancialSummary[]>(`/trial-balance/summary-all-periods?company_id=${companyId}`) 
        ]);

        const periods = periodsResponse.data;
        const summaries = summariesResponse.data;
      
        return periods?.map((p: Period) => ({
          month: p.label,
          profit: summaries?.find((s:FinancialSummary) => s.period_id === p.id)?.net_profit || 0,
          margin: summaries?.find((s:FinancialSummary) => s.period_id === p.id)?.margin_percent || 0
        })) || [];
      }
       catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId
  });
};

export const useRatioTrend = (companyId: string, kpiCode: string) => {
  return useQuery<RatioTrendEntry[], AxiosError<APIError>>({
    queryKey: ['ratio-trend', companyId, kpiCode],
    queryFn: async () => {
      try {
        const response = await api.get(`/kpi/trend?company_id=${companyId}&kpi_code=${kpiCode}`);
        return response.data;
      } catch (error) {
        throw (error as AxiosError<APIError>).response?.data?.detail || (error as Error).message;
      }
    },
    enabled: !!companyId && !!kpiCode
  });
};
