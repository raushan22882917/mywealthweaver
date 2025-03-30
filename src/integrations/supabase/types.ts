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
      dividend_safety: {
        Row: {
          debt_to_equity: number | null
          fcf_coverage: number | null
          payout_ratio: number | null
          status: string | null
          symbol: string | null
        }
        Insert: {
          debt_to_equity?: number | null
          fcf_coverage?: number | null
          payout_ratio?: number | null
          status?: string | null
          symbol?: string | null
        }
        Update: {
          debt_to_equity?: number | null
          fcf_coverage?: number | null
          payout_ratio?: number | null
          status?: string | null
          symbol?: string | null
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
          annualrate: number | null
          buy_date: string | null
          currentprice: number | null
          dividenddate: string | null
          dividendrate: number | null
          dividendyield: number | null
          earningsdate: string | null
          exdividenddate: string | null
          hist: string | null
          id: number
          insight_data: string | null
          lastdividendvalue: number | null
          message: string | null
          payoutdate: string | null
          payoutratio: number | null
          previousclose: number | null
          quotetype: string | null
          shortname: string | null
          symbol: string | null
          trailingannualdividendrate: number | null
          trailingannualdividendyield: number | null
        }
        Insert: {
          annualrate?: number | null
          buy_date?: string | null
          currentprice?: number | null
          dividenddate?: string | null
          dividendrate?: number | null
          dividendyield?: number | null
          earningsdate?: string | null
          exdividenddate?: string | null
          hist?: string | null
          id?: never
          insight_data?: string | null
          lastdividendvalue?: number | null
          message?: string | null
          payoutdate?: string | null
          payoutratio?: number | null
          previousclose?: number | null
          quotetype?: string | null
          shortname?: string | null
          symbol?: string | null
          trailingannualdividendrate?: number | null
          trailingannualdividendyield?: number | null
        }
        Update: {
          annualrate?: number | null
          buy_date?: string | null
          currentprice?: number | null
          dividenddate?: string | null
          dividendrate?: number | null
          dividendyield?: number | null
          earningsdate?: string | null
          exdividenddate?: string | null
          hist?: string | null
          id?: never
          insight_data?: string | null
          lastdividendvalue?: number | null
          message?: string | null
          payoutdate?: string | null
          payoutratio?: number | null
          previousclose?: number | null
          quotetype?: string | null
          shortname?: string | null
          symbol?: string | null
          trailingannualdividendrate?: number | null
          trailingannualdividendyield?: number | null
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
      logo: {
        Row: {
          company_name: string
          domain: string
          logo_urls: string
          symbol: string
        }
        Insert: {
          company_name: string
          domain: string
          logo_urls: string
          symbol: string
        }
        Update: {
          company_name?: string
          domain?: string
          logo_urls?: string
          symbol?: string
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
