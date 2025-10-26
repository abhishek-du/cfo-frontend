export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_mappings: {
        Row: {
          client_account_code: string
          client_account_name: string
          company_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          mapped_by: string | null
          std_account_id: string
          updated_at: string | null
        }
        Insert: {
          client_account_code: string
          client_account_name: string
          company_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          mapped_by?: string | null
          std_account_id: string
          updated_at?: string | null
        }
        Update: {
          client_account_code?: string
          client_account_name?: string
          company_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          mapped_by?: string | null
          std_account_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_mappings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_mappings_mapped_by_fkey"
            columns: ["mapped_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_mappings_std_account_id_fkey"
            columns: ["std_account_id"]
            isOneToOne: false
            referencedRelation: "std_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_mappings_std_account_id_fkey"
            columns: ["std_account_id"]
            isOneToOne: false
            referencedRelation: "v_period_account_totals"
            referencedColumns: ["std_account_id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      file_imports: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          error_rows: number | null
          filename: string
          id: string
          period_id: string | null
          status: Database["public"]["Enums"]["import_status"] | null
          successful_rows: number | null
          total_rows: number | null
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_rows?: number | null
          filename: string
          id?: string
          period_id?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
          successful_rows?: number | null
          total_rows?: number | null
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_rows?: number | null
          filename?: string
          id?: string
          period_id?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
          successful_rows?: number | null
          total_rows?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_imports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_imports_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_imports_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_catalog: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          display_format: string | null
          formula_definition: Json
          formula_type: Database["public"]["Enums"]["kpi_formula_type"]
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          display_format?: string | null
          formula_definition: Json
          formula_type: Database["public"]["Enums"]["kpi_formula_type"]
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          display_format?: string | null
          formula_definition?: Json
          formula_type?: Database["public"]["Enums"]["kpi_formula_type"]
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      kpi_rollouts: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          kpi_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          kpi_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          kpi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_rollouts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_rollouts_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_values: {
        Row: {
          change_percent: number | null
          company_id: string
          computed_at: string | null
          id: string
          kpi_id: string
          period_id: string
          previous_period_value: number | null
          value: number | null
        }
        Insert: {
          change_percent?: number | null
          company_id: string
          computed_at?: string | null
          id?: string
          kpi_id: string
          period_id: string
          previous_period_value?: number | null
          value?: number | null
        }
        Update: {
          change_percent?: number | null
          company_id?: string
          computed_at?: string | null
          id?: string
          kpi_id?: string
          period_id?: string
          previous_period_value?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_values_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_values_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      period_summary: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          net_balance: number | null
          period_id: string
          std_account_id: string
          total_credit: number | null
          total_debit: number | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          net_balance?: number | null
          period_id: string
          std_account_id: string
          total_credit?: number | null
          total_debit?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          net_balance?: number | null
          period_id?: string
          std_account_id?: string
          total_credit?: number | null
          total_debit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "period_summary_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_summary_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_summary_std_account_id_fkey"
            columns: ["std_account_id"]
            isOneToOne: false
            referencedRelation: "std_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_summary_std_account_id_fkey"
            columns: ["std_account_id"]
            isOneToOne: false
            referencedRelation: "v_period_account_totals"
            referencedColumns: ["std_account_id"]
          },
        ]
      }
      periods: {
        Row: {
          company_id: string
          created_at: string | null
          end_date: string
          id: string
          is_closed: boolean | null
          label: string
          period_type: Database["public"]["Enums"]["period_type"]
          start_date: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          end_date: string
          id?: string
          is_closed?: boolean | null
          label: string
          period_type?: Database["public"]["Enums"]["period_type"]
          start_date: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          is_closed?: boolean | null
          label?: string
          period_type?: Database["public"]["Enums"]["period_type"]
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      std_accounts: {
        Row: {
          category: Database["public"]["Enums"]["account_category"]
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["account_category"]
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["account_category"]
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "std_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "std_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "std_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_period_account_totals"
            referencedColumns: ["std_account_id"]
          },
        ]
      }
      trial_balance_rows: {
        Row: {
          account_code: string
          account_name: string
          balance: number | null
          company_id: string
          created_at: string | null
          credit: number | null
          debit: number | null
          id: string
          import_id: string
          period_id: string
          row_number: number | null
        }
        Insert: {
          account_code: string
          account_name: string
          balance?: number | null
          company_id: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          id?: string
          import_id: string
          period_id: string
          row_number?: number | null
        }
        Update: {
          account_code?: string
          account_name?: string
          balance?: number | null
          company_id?: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          id?: string
          import_id?: string
          period_id?: string
          row_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_balance_rows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_balance_rows_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "file_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_balance_rows_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_period_account_totals: {
        Row: {
          category: Database["public"]["Enums"]["account_category"] | null
          company_id: string | null
          net_balance: number | null
          period_id: string | null
          std_account_code: string | null
          std_account_id: string | null
          std_account_name: string | null
          total_credit: number | null
          total_debit: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_balance_rows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_balance_rows_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      v_revenue_cost_summary: {
        Row: {
          company_id: string | null
          margin_percent: number | null
          net_profit: number | null
          period_id: string | null
          total_cogs: number | null
          total_opex: number | null
          total_revenue: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_balance_rows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_balance_rows_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      compute_kpis: {
        Args: { p_company_id: string; p_period_id: string }
        Returns: undefined
      }
      compute_period_summary: {
        Args: { p_company_id: string; p_period_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_category:
        | "asset"
        | "liability"
        | "equity"
        | "revenue"
        | "cogs"
        | "operating_expense"
        | "other_income"
        | "other_expense"
      app_role: "admin" | "user"
      import_status: "pending" | "processing" | "succeeded" | "failed"
      kpi_formula_type: "ratio" | "percentage" | "absolute" | "custom"
      period_type: "monthly" | "quarterly" | "annual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_category: [
        "asset",
        "liability",
        "equity",
        "revenue",
        "cogs",
        "operating_expense",
        "other_income",
        "other_expense",
      ],
      app_role: ["admin", "user"],
      import_status: ["pending", "processing", "succeeded", "failed"],
      kpi_formula_type: ["ratio", "percentage", "absolute", "custom"],
      period_type: ["monthly", "quarterly", "annual"],
    },
  },
} as const
