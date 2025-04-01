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
      annual_dividend_history: {
        Row: {
          created_at: string | null
          date: string
          dividends: number
          id: number
          symbol: string
        }
        Insert: {
          created_at?: string | null
          date: string
          dividends: number
          id?: number
          symbol: string
        }
        Update: {
          created_at?: string | null
          date?: string
          dividends?: number
          id?: number
          symbol?: string
        }
        Relationships: []
      }
      annual_dividends: {
        Row: {
          created_at: string | null
          date: string
          dividends: number
          id: number
          symbol: string
        }
        Insert: {
          created_at?: string | null
          date: string
          dividends: number
          id?: number
          symbol: string
        }
        Update: {
          created_at?: string | null
          date?: string
          dividends?: number
          id?: number
          symbol?: string
        }
        Relationships: []
      }
      company_logos: {
        Row: {
          company_name: string | null
          created_at: string
          domain: string | null
          id: number
          LogoURL: string
          Symbol: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          domain?: string | null
          id?: number
          LogoURL: string
          Symbol: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          domain?: string | null
          id?: number
          LogoURL?: string
          Symbol?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          address: string | null
          audit_risk: number | null
          beta: number | null
          board_risk: number | null
          book_value: number | null
          compensation_risk: number | null
          created_at: string | null
          current_ratio: number | null
          debt_to_equity: number | null
          dividend_rate: number | null
          dividend_yield: number | null
          earnings_growth: number | null
          earnings_quarterly_growth: number | null
          ebitda: number | null
          ebitda_margins: number | null
          enterprise_to_ebitda: number | null
          enterprise_to_revenue: number | null
          ex_dividend_date: string | null
          exchange: string | null
          fifty_day_average: number | null
          five_year_avg_dividend_yield: number | null
          forward_eps: number | null
          forward_pe: number | null
          free_cashflow: number | null
          full_time_employees: number | null
          gross_margins: number | null
          gross_profits: number | null
          held_percent_insiders: number | null
          held_percent_institutions: number | null
          id: number
          industry: string | null
          last_dividend_date: string | null
          last_dividend_value: number | null
          last_fiscal_year_end: string | null
          long_business_summary: string | null
          net_income_to_common: number | null
          number_of_analyst_opinions: number | null
          operating_cashflow: number | null
          operating_margins: number | null
          overall_risk: number | null
          payout_ratio: number | null
          phone: string | null
          price_to_book: number | null
          price_to_sales_trailing_12_months: number | null
          profit_margins: number | null
          quick_ratio: number | null
          quote_type: string | null
          recommendation_key: string | null
          recommendation_mean: number | null
          return_on_assets: number | null
          return_on_equity: number | null
          revenue_growth: number | null
          revenue_per_share: number | null
          sand_p_52_week_change: number | null
          sector: string | null
          share_holder_rights_risk: number | null
          short_name: string | null
          symbol: string
          target_high_price: number | null
          target_low_price: number | null
          target_mean_price: number | null
          target_median_price: number | null
          total_cash: number | null
          total_cash_per_share: number | null
          total_debt: number | null
          total_revenue: number | null
          trailing_annual_dividend_rate: number | null
          trailing_annual_dividend_yield: number | null
          trailing_eps: number | null
          trailing_pe: number | null
          trailing_peg_ratio: number | null
          two_hundred_day_average: number | null
          updated_at: string | null
          website: string | null
          week_change_52: number | null
        }
        Insert: {
          address?: string | null
          audit_risk?: number | null
          beta?: number | null
          board_risk?: number | null
          book_value?: number | null
          compensation_risk?: number | null
          created_at?: string | null
          current_ratio?: number | null
          debt_to_equity?: number | null
          dividend_rate?: number | null
          dividend_yield?: number | null
          earnings_growth?: number | null
          earnings_quarterly_growth?: number | null
          ebitda?: number | null
          ebitda_margins?: number | null
          enterprise_to_ebitda?: number | null
          enterprise_to_revenue?: number | null
          ex_dividend_date?: string | null
          exchange?: string | null
          fifty_day_average?: number | null
          five_year_avg_dividend_yield?: number | null
          forward_eps?: number | null
          forward_pe?: number | null
          free_cashflow?: number | null
          full_time_employees?: number | null
          gross_margins?: number | null
          gross_profits?: number | null
          held_percent_insiders?: number | null
          held_percent_institutions?: number | null
          id?: number
          industry?: string | null
          last_dividend_date?: string | null
          last_dividend_value?: number | null
          last_fiscal_year_end?: string | null
          long_business_summary?: string | null
          net_income_to_common?: number | null
          number_of_analyst_opinions?: number | null
          operating_cashflow?: number | null
          operating_margins?: number | null
          overall_risk?: number | null
          payout_ratio?: number | null
          phone?: string | null
          price_to_book?: number | null
          price_to_sales_trailing_12_months?: number | null
          profit_margins?: number | null
          quick_ratio?: number | null
          quote_type?: string | null
          recommendation_key?: string | null
          recommendation_mean?: number | null
          return_on_assets?: number | null
          return_on_equity?: number | null
          revenue_growth?: number | null
          revenue_per_share?: number | null
          sand_p_52_week_change?: number | null
          sector?: string | null
          share_holder_rights_risk?: number | null
          short_name?: string | null
          symbol: string
          target_high_price?: number | null
          target_low_price?: number | null
          target_mean_price?: number | null
          target_median_price?: number | null
          total_cash?: number | null
          total_cash_per_share?: number | null
          total_debt?: number | null
          total_revenue?: number | null
          trailing_annual_dividend_rate?: number | null
          trailing_annual_dividend_yield?: number | null
          trailing_eps?: number | null
          trailing_pe?: number | null
          trailing_peg_ratio?: number | null
          two_hundred_day_average?: number | null
          updated_at?: string | null
          website?: string | null
          week_change_52?: number | null
        }
        Update: {
          address?: string | null
          audit_risk?: number | null
          beta?: number | null
          board_risk?: number | null
          book_value?: number | null
          compensation_risk?: number | null
          created_at?: string | null
          current_ratio?: number | null
          debt_to_equity?: number | null
          dividend_rate?: number | null
          dividend_yield?: number | null
          earnings_growth?: number | null
          earnings_quarterly_growth?: number | null
          ebitda?: number | null
          ebitda_margins?: number | null
          enterprise_to_ebitda?: number | null
          enterprise_to_revenue?: number | null
          ex_dividend_date?: string | null
          exchange?: string | null
          fifty_day_average?: number | null
          five_year_avg_dividend_yield?: number | null
          forward_eps?: number | null
          forward_pe?: number | null
          free_cashflow?: number | null
          full_time_employees?: number | null
          gross_margins?: number | null
          gross_profits?: number | null
          held_percent_insiders?: number | null
          held_percent_institutions?: number | null
          id?: number
          industry?: string | null
          last_dividend_date?: string | null
          last_dividend_value?: number | null
          last_fiscal_year_end?: string | null
          long_business_summary?: string | null
          net_income_to_common?: number | null
          number_of_analyst_opinions?: number | null
          operating_cashflow?: number | null
          operating_margins?: number | null
          overall_risk?: number | null
          payout_ratio?: number | null
          phone?: string | null
          price_to_book?: number | null
          price_to_sales_trailing_12_months?: number | null
          profit_margins?: number | null
          quick_ratio?: number | null
          quote_type?: string | null
          recommendation_key?: string | null
          recommendation_mean?: number | null
          return_on_assets?: number | null
          return_on_equity?: number | null
          revenue_growth?: number | null
          revenue_per_share?: number | null
          sand_p_52_week_change?: number | null
          sector?: string | null
          share_holder_rights_risk?: number | null
          short_name?: string | null
          symbol?: string
          target_high_price?: number | null
          target_low_price?: number | null
          target_mean_price?: number | null
          target_median_price?: number | null
          total_cash?: number | null
          total_cash_per_share?: number | null
          total_debt?: number | null
          total_revenue?: number | null
          trailing_annual_dividend_rate?: number | null
          trailing_annual_dividend_yield?: number | null
          trailing_eps?: number | null
          trailing_pe?: number | null
          trailing_peg_ratio?: number | null
          two_hundred_day_average?: number | null
          updated_at?: string | null
          website?: string | null
          week_change_52?: number | null
        }
        Relationships: []
      }
      dividend: {
        Row: {
          buy_date: string | null
          currentprice: number | null
          date: string | null
          dividend: number | null
          dividenddate: string | null
          dividendrate: number | null
          dividendyield: number | null
          earningsdate: string | null
          "Ex-Dividend": string | null
          exdividenddate: string | null
          hist: string | null
          id: number
          insight: string | null
          message: string | null
          payoutdate: string | null
          payoutratio: number | null
          previousclose: number | null
          quotetype: string | null
          shortname: string | null
          symbol: string | null
        }
        Insert: {
          buy_date?: string | null
          currentprice?: number | null
          date?: string | null
          dividend?: number | null
          dividenddate?: string | null
          dividendrate?: number | null
          dividendyield?: number | null
          earningsdate?: string | null
          "Ex-Dividend"?: string | null
          exdividenddate?: string | null
          hist?: string | null
          id?: number
          insight?: string | null
          message?: string | null
          payoutdate?: string | null
          payoutratio?: number | null
          previousclose?: number | null
          quotetype?: string | null
          shortname?: string | null
          symbol?: string | null
        }
        Update: {
          buy_date?: string | null
          currentprice?: number | null
          date?: string | null
          dividend?: number | null
          dividenddate?: string | null
          dividendrate?: number | null
          dividendyield?: number | null
          earningsdate?: string | null
          "Ex-Dividend"?: string | null
          exdividenddate?: string | null
          hist?: string | null
          id?: number
          insight?: string | null
          message?: string | null
          payoutdate?: string | null
          payoutratio?: number | null
          previousclose?: number | null
          quotetype?: string | null
          shortname?: string | null
          symbol?: string | null
        }
        Relationships: []
      }
      dividend_announcements: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          header: string
          id: string
          message: string
          symbol: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          header: string
          id?: string
          message: string
          symbol: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          header?: string
          id?: string
          message?: string
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
      payout_history: {
        Row: {
          created_at: string | null
          date: string
          dividends: number
          eps: number | null
          id: number
          payout: number | null
          quarter_year: string | null
          symbol: string
        }
        Insert: {
          created_at?: string | null
          date: string
          dividends: number
          eps?: number | null
          id?: number
          payout?: number | null
          quarter_year?: string | null
          symbol: string
        }
        Update: {
          created_at?: string | null
          date?: string
          dividends?: number
          eps?: number | null
          id?: number
          payout?: number | null
          quarter_year?: string | null
          symbol?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          email_frequency: string | null
          email_notifications_enabled: string | null
          id: string
          notifications_enabled: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          email_frequency?: string | null
          email_notifications_enabled?: string | null
          id: string
          notifications_enabled?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          email_frequency?: string | null
          email_notifications_enabled?: string | null
          id?: string
          notifications_enabled?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      quarterly_dividend_history: {
        Row: {
          created_at: string | null
          date: string
          dividends: number
          id: number
          symbol: string
        }
        Insert: {
          created_at?: string | null
          date: string
          dividends: number
          id?: number
          symbol: string
        }
        Update: {
          created_at?: string | null
          date?: string
          dividends?: number
          id?: number
          symbol?: string
        }
        Relationships: []
      }
      quarterly_dividends: {
        Row: {
          created_at: string | null
          date: string
          dividends: number
          id: number
          symbol: string
        }
        Insert: {
          created_at?: string | null
          date: string
          dividends: number
          id?: number
          symbol: string
        }
        Update: {
          created_at?: string | null
          date?: string
          dividends?: number
          id?: number
          symbol?: string
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
          company_name: string | null
          created_at: string | null
          description: string | null
          id: number
          revenue_2024: string | null
          similar_symbol: string
          symbol: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          revenue_2024?: string | null
          similar_symbol: string
          symbol: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          revenue_2024?: string | null
          similar_symbol?: string
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
      stock_rankings: {
        Row: {
          created_at: string | null
          id: number
          industry: string | null
          rank: number
          score: number
          sector: string | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          industry?: string | null
          rank: number
          score: number
          sector?: string | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          industry?: string | null
          rank?: number
          score?: number
          sector?: string | null
          symbol?: string
          updated_at?: string | null
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
          grade_date: string | null
          id: string
          symbol: string
          to_grade: string
        }
        Insert: {
          action: string
          created_at?: string
          firm: string
          from_grade: string
          grade_date?: string | null
          id?: string
          symbol: string
          to_grade: string
        }
        Update: {
          action?: string
          created_at?: string
          firm?: string
          from_grade?: string
          grade_date?: string | null
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
