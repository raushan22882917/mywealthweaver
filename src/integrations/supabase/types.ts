export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      company_logos: {
        Row: {
          company_name: string | null
          created_at: string
          domain: string | null
          id: number
          logo_url: string
          symbol: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          domain?: string | null
          id?: number
          logo_url: string
          symbol: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          domain?: string | null
          id?: number
          logo_url?: string
          symbol?: string
        }
        Relationships: []
      }
      dividend_payout: {
        Row: {
          created_at: string
          date: string
          dividends: number
          id: string
          last_quarter: string | null
          payout: number | null
          quarter_year: string | null
          quarterly_eps: number | null
          stock_symbol: string
        }
        Insert: {
          created_at?: string
          date: string
          dividends: number
          id?: string
          last_quarter?: string | null
          payout?: number | null
          quarter_year?: string | null
          quarterly_eps?: number | null
          stock_symbol: string
        }
        Update: {
          created_at?: string
          date?: string
          dividends?: number
          id?: string
          last_quarter?: string | null
          payout?: number | null
          quarter_year?: string | null
          quarterly_eps?: number | null
          stock_symbol?: string
        }
        Relationships: []
      }
      dividend_reports: {
        Row: {
          created_at: string | null
          dividend_date: string | null
          earnings_average: number | null
          earnings_date: string | null
          earnings_high: number | null
          earnings_low: number | null
          ex_dividend_date: string | null
          id: string
          revenue_average: number | null
          revenue_high: number | null
          revenue_low: number | null
          symbol: string
        }
        Insert: {
          created_at?: string | null
          dividend_date?: string | null
          earnings_average?: number | null
          earnings_date?: string | null
          earnings_high?: number | null
          earnings_low?: number | null
          ex_dividend_date?: string | null
          id?: string
          revenue_average?: number | null
          revenue_high?: number | null
          revenue_low?: number | null
          symbol: string
        }
        Update: {
          created_at?: string | null
          dividend_date?: string | null
          earnings_average?: number | null
          earnings_date?: string | null
          earnings_high?: number | null
          earnings_low?: number | null
          ex_dividend_date?: string | null
          id?: string
          revenue_average?: number | null
          revenue_high?: number | null
          revenue_low?: number | null
          symbol?: string
        }
        Relationships: []
      }
      dividend_safety: {
        Row: {
          created_at: string
          debt_to_equity: number | null
          fcf_coverage: number | null
          id: number
          payout_ratio: number | null
          status: string | null
          symbol: string
        }
        Insert: {
          created_at?: string
          debt_to_equity?: number | null
          fcf_coverage?: number | null
          id?: number
          payout_ratio?: number | null
          status?: string | null
          symbol: string
        }
        Update: {
          created_at?: string
          debt_to_equity?: number | null
          fcf_coverage?: number | null
          id?: number
          payout_ratio?: number | null
          status?: string | null
          symbol?: string
        }
        Relationships: []
      }
      dividend_yield: {
        Row: {
          created_at: string
          date: string
          dividends: number
          id: string
          quarter_year: string | null
          stock_price: number | null
          stock_symbol: string
          yield: number | null
        }
        Insert: {
          created_at?: string
          date: string
          dividends: number
          id?: string
          quarter_year?: string | null
          stock_price?: number | null
          stock_symbol: string
          yield?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          dividends?: number
          id?: string
          quarter_year?: string | null
          stock_price?: number | null
          stock_symbol?: string
          yield?: number | null
        }
        Relationships: []
      }
      dividends: {
        Row: {
          annual_rate: number | null
          buy_date: string | null
          created_at: string
          current_price: number | null
          dividend_date: string | null
          dividend_rate: number | null
          dividend_yield: number | null
          earnings_date: string | null
          ex_dividend_date: string | null
          hist: string | null
          id: number
          insight: string | null
          last_dividend_value: number | null
          message: string | null
          payout_date: string | null
          payout_ratio: number | null
          previous_close: number | null
          quote_type: string | null
          short_name: string | null
          symbol: string
          trailing_annual_dividend_rate: number | null
          trailing_annual_dividend_yield: number | null
        }
        Insert: {
          annual_rate?: number | null
          buy_date?: string | null
          created_at?: string
          current_price?: number | null
          dividend_date?: string | null
          dividend_rate?: number | null
          dividend_yield?: number | null
          earnings_date?: string | null
          ex_dividend_date?: string | null
          hist?: string | null
          id?: number
          insight?: string | null
          last_dividend_value?: number | null
          message?: string | null
          payout_date?: string | null
          payout_ratio?: number | null
          previous_close?: number | null
          quote_type?: string | null
          short_name?: string | null
          symbol: string
          trailing_annual_dividend_rate?: number | null
          trailing_annual_dividend_yield?: number | null
        }
        Update: {
          annual_rate?: number | null
          buy_date?: string | null
          created_at?: string
          current_price?: number | null
          dividend_date?: string | null
          dividend_rate?: number | null
          dividend_yield?: number | null
          earnings_date?: string | null
          ex_dividend_date?: string | null
          hist?: string | null
          id?: number
          insight?: string | null
          last_dividend_value?: number | null
          message?: string | null
          payout_date?: string | null
          payout_ratio?: number | null
          previous_close?: number | null
          quote_type?: string | null
          short_name?: string | null
          symbol?: string
          trailing_annual_dividend_rate?: number | null
          trailing_annual_dividend_yield?: number | null
        }
        Relationships: []
      }
      earnings: {
        Row: {
          created_at: string
          day: string | null
          earnings_date: string | null
          eps_estimate: number | null
          id: string
          report_date: string | null
          reported_eps: number | null
          stock_symbol: string
          surprise_percent: number | null
        }
        Insert: {
          created_at?: string
          day?: string | null
          earnings_date?: string | null
          eps_estimate?: number | null
          id?: string
          report_date?: string | null
          reported_eps?: number | null
          stock_symbol: string
          surprise_percent?: number | null
        }
        Update: {
          created_at?: string
          day?: string | null
          earnings_date?: string | null
          eps_estimate?: number | null
          id?: string
          report_date?: string | null
          reported_eps?: number | null
          stock_symbol?: string
          surprise_percent?: number | null
        }
        Relationships: []
      }
      next_week_earnings: {
        Row: {
          created_at: string
          day: string | null
          earnings_date: string | null
          eps_estimate: number | null
          id: string
          report_date: string | null
          reported_eps: number | null
          stock_symbol: string
          surprise_percent: number | null
        }
        Insert: {
          created_at?: string
          day?: string | null
          earnings_date?: string | null
          eps_estimate?: number | null
          id?: string
          report_date?: string | null
          reported_eps?: number | null
          stock_symbol: string
          surprise_percent?: number | null
        }
        Update: {
          created_at?: string
          day?: string | null
          earnings_date?: string | null
          eps_estimate?: number | null
          id?: string
          report_date?: string | null
          reported_eps?: number | null
          stock_symbol?: string
          surprise_percent?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_stocks: {
        Row: {
          company_name: string
          created_at: string
          dividend_yield: number | null
          id: string
          is_favorite: boolean | null
          logo_url: string | null
          next_dividend_date: string | null
          price: number | null
          symbol: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          dividend_yield?: number | null
          id?: string
          is_favorite?: boolean | null
          logo_url?: string | null
          next_dividend_date?: string | null
          price?: number | null
          symbol: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          dividend_yield?: number | null
          id?: string
          is_favorite?: boolean | null
          logo_url?: string | null
          next_dividend_date?: string | null
          price?: number | null
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      similar_companies: {
        Row: {
          created_at: string | null
          id: string
          similar_symbols: string[]
          symbol: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          similar_symbols: string[]
          symbol: string
        }
        Update: {
          created_at?: string | null
          id?: string
          similar_symbols?: string[]
          symbol?: string
        }
        Relationships: []
      }
      stock_financial_details: {
        Row: {
          adjusted_dividend_yield: number | null
          created_at: string | null
          debt_levels: number | null
          dividend_history: string | null
          dividend_yield: number | null
          earnings_per_share: number | null
          exchange: string | null
          financial_health_score: number | null
          five_year_dividend_yield: number | null
          id: string
          location: string | null
          net_income: number | null
          payout_ratio: number | null
          payout_ratio_penalty: number | null
          revenue: number | null
          revenue_growth: number | null
          sector: string | null
          sub_sector: string | null
          symbol: string
        }
        Insert: {
          adjusted_dividend_yield?: number | null
          created_at?: string | null
          debt_levels?: number | null
          dividend_history?: string | null
          dividend_yield?: number | null
          earnings_per_share?: number | null
          exchange?: string | null
          financial_health_score?: number | null
          five_year_dividend_yield?: number | null
          id?: string
          location?: string | null
          net_income?: number | null
          payout_ratio?: number | null
          payout_ratio_penalty?: number | null
          revenue?: number | null
          revenue_growth?: number | null
          sector?: string | null
          sub_sector?: string | null
          symbol: string
        }
        Update: {
          adjusted_dividend_yield?: number | null
          created_at?: string | null
          debt_levels?: number | null
          dividend_history?: string | null
          dividend_yield?: number | null
          earnings_per_share?: number | null
          exchange?: string | null
          financial_health_score?: number | null
          five_year_dividend_yield?: number | null
          id?: string
          location?: string | null
          net_income?: number | null
          payout_ratio?: number | null
          payout_ratio_penalty?: number | null
          revenue?: number | null
          revenue_growth?: number | null
          sector?: string | null
          sub_sector?: string | null
          symbol?: string
        }
        Relationships: []
      }
      stock_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          stock_symbol: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stock_symbol: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stock_symbol?: string
        }
        Relationships: []
      }
      stock_upgrades: {
        Row: {
          action: string
          created_at: string
          firm: string
          from_grade: string
          id: string
          symbol: string
          to_grade: string
        }
        Insert: {
          action: string
          created_at?: string
          firm: string
          from_grade: string
          id?: string
          symbol: string
          to_grade: string
        }
        Update: {
          action?: string
          created_at?: string
          firm?: string
          from_grade?: string
          id?: string
          symbol?: string
          to_grade?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
