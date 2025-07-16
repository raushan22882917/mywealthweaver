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
      analytics_data: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          clicks: number | null
          created_at: string
          date: string
          id: string
          page_views: number | null
          route_id: string
          unique_visitors: number | null
          updated_at: string
          website_id: string
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          clicks?: number | null
          created_at?: string
          date: string
          id?: string
          page_views?: number | null
          route_id: string
          unique_visitors?: number | null
          updated_at?: string
          website_id: string
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          clicks?: number | null
          created_at?: string
          date?: string
          id?: string
          page_views?: number | null
          route_id?: string
          unique_visitors?: number | null
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "website_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_data_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "connected_websites"
            referencedColumns: ["id"]
          },
        ]
      }
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
      connected_websites: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
          website_name: string
          website_url: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
          website_name: string
          website_url: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
          website_name?: string
          website_url?: string
        }
        Relationships: []
      }
      daily_stock_list: {
        Row: {
          as_of_date: string
          id: number
          symbol: string | null
        }
        Insert: {
          as_of_date: string
          id?: number
          symbol?: string | null
        }
        Update: {
          as_of_date?: string
          id?: number
          symbol?: string | null
        }
        Relationships: []
      }
      div_frequency: {
        Row: {
          as_of_date: string
          days: number | null
          frequency: number | null
          frequency_tx: string | null
          id: number
          special_dividend: string | null
          symbol: string | null
        }
        Insert: {
          as_of_date: string
          days?: number | null
          frequency?: number | null
          frequency_tx?: string | null
          id?: number
          special_dividend?: string | null
          symbol?: string | null
        }
        Update: {
          as_of_date?: string
          days?: number | null
          frequency?: number | null
          frequency_tx?: string | null
          id?: number
          special_dividend?: string | null
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
      dividend_dates: {
        Row: {
          buy_date: string | null
          created_at: string | null
          id: string
          payout_date: string | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          buy_date?: string | null
          created_at?: string | null
          id?: string
          payout_date?: string | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          buy_date?: string | null
          created_at?: string | null
          id?: string
          payout_date?: string | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dividend_metrics: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
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
          earnings_average: number | null
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
          earnings_average?: number | null
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
          earnings_average?: number | null
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
      dividendsymbol: {
        Row: {
          as_of_date: string | null
          buy_date: string | null
          currentprice: number | null
          dividend: number | null
          dividendrate: number | null
          dividendyield: number | null
          earningsdate: string | null
          exdividenddate: string | null
          hist: string | null
          insight: string | null
          message: string | null
          payoutdate: string | null
          payoutratio: number | null
          previousclose: number | null
          quotetype: string | null
          recovery_period: string | null
          shortname: string | null
          symbol: string | null
          yearly_change: string | null
        }
        Insert: {
          as_of_date?: string | null
          buy_date?: string | null
          currentprice?: number | null
          dividend?: number | null
          dividendrate?: number | null
          dividendyield?: number | null
          earningsdate?: string | null
          exdividenddate?: string | null
          hist?: string | null
          insight?: string | null
          message?: string | null
          payoutdate?: string | null
          payoutratio?: number | null
          previousclose?: number | null
          quotetype?: string | null
          recovery_period?: string | null
          shortname?: string | null
          symbol?: string | null
          yearly_change?: string | null
        }
        Update: {
          as_of_date?: string | null
          buy_date?: string | null
          currentprice?: number | null
          dividend?: number | null
          dividendrate?: number | null
          dividendyield?: number | null
          earningsdate?: string | null
          exdividenddate?: string | null
          hist?: string | null
          insight?: string | null
          message?: string | null
          payoutdate?: string | null
          payoutratio?: number | null
          previousclose?: number | null
          quotetype?: string | null
          recovery_period?: string | null
          shortname?: string | null
          symbol?: string | null
          yearly_change?: string | null
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
      google_analytics_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          project_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: number
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: number
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: number
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      insight: {
        Row: {
          diff: number | null
          fiveyearavgdividendyield: number | null
          statement: string | null
          symbol: string | null
          yield: number | null
        }
        Insert: {
          diff?: number | null
          fiveyearavgdividendyield?: number | null
          statement?: string | null
          symbol?: string | null
          yield?: number | null
        }
        Update: {
          diff?: number | null
          fiveyearavgdividendyield?: number | null
          statement?: string | null
          symbol?: string | null
          yield?: number | null
        }
        Relationships: []
      }
      news: {
        Row: {
          date: string
          id: number
          news_title: string
          original_link: string
          sentiment: string
          sentiment_score: string
          source: string
          symbol: string
          weblink: string
        }
        Insert: {
          date: string
          id?: number
          news_title: string
          original_link: string
          sentiment: string
          sentiment_score: string
          source: string
          symbol: string
          weblink: string
        }
        Update: {
          date?: string
          id?: number
          news_title?: string
          original_link?: string
          sentiment?: string
          sentiment_score?: string
          source?: string
          symbol?: string
          weblink?: string
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
      pe_ratio_industry: {
        Row: {
          as_of_date: string
          company_count: number
          id: number
          industry: string
          pe_ratio: number
          sector: string
        }
        Insert: {
          as_of_date: string
          company_count: number
          id?: number
          industry: string
          pe_ratio: number
          sector: string
        }
        Update: {
          as_of_date?: string
          company_count?: number
          id?: number
          industry?: string
          pe_ratio?: number
          sector?: string
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
      quantity: {
        Row: {
          created_at: string | null
          id: string
          quantity: number
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity?: number
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number
          symbol?: string
          updated_at?: string | null
          user_id?: string
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
      quarterly_payout_ratio: {
        Row: {
          symbol: string;
          date: string;
          net_income: number | null;
          payout_ratio: number | null;
          dividends_paid: number | null;
          as_of_date: string | null;
        };
        Insert: {
          symbol: string;
          date: string;
          net_income?: number | null;
          payout_ratio?: number | null;
          dividends_paid?: number | null;
          as_of_date?: string | null;
        };
        Update: {
          symbol?: string;
          date?: string;
          net_income?: number | null;
          payout_ratio?: number | null;
          dividends_paid?: number | null;
          as_of_date?: string | null;
        };
        Relationships: [];
      },
      saved_stocks: {
        Row: {
          company_name: string
          created_at: string
          dividend_yield: number | null
          id: string
          is_favorite: boolean | null
          LogoURL: string | null
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
          LogoURL?: string | null
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
          LogoURL?: string | null
          next_dividend_date?: string | null
          price?: number | null
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      similar_companies: {
        Row: {
          dividend_yield: string | null
          id: number
          revenue_2025: string | null
          risks: string | null
          similar_symbol: string | null
          symbol: string | null
        }
        Insert: {
          dividend_yield?: string | null
          id?: number
          revenue_2025?: string | null
          risks?: string | null
          similar_symbol?: string | null
          symbol?: string | null
        }
        Update: {
          dividend_yield?: string | null
          id?: number
          revenue_2025?: string | null
          risks?: string | null
          similar_symbol?: string | null
          symbol?: string | null
        }
        Relationships: []
      }
      stock_ai_analysis: {
        Row: {
          ai_recommendation: string | null
          analysis_date: string | null
          analyst_consensus: string | null
          created_at: string | null
          dividend_analysis: string | null
          financial_health: string | null
          id: number
          investment_rating: string | null
          key_metrics: Json | null
          long_term_outlook: string | null
          opportunities: string[] | null
          price_target: number | null
          risk_level: string | null
          short_term_outlook: string | null
          strengths: string[] | null
          symbol: string
          technical_indicators: string | null
          threats: string[] | null
          updated_at: string | null
          weaknesses: string[] | null
        }
        Insert: {
          ai_recommendation?: string | null
          analysis_date?: string | null
          analyst_consensus?: string | null
          created_at?: string | null
          dividend_analysis?: string | null
          financial_health?: string | null
          id?: number
          investment_rating?: string | null
          key_metrics?: Json | null
          long_term_outlook?: string | null
          opportunities?: string[] | null
          price_target?: number | null
          risk_level?: string | null
          short_term_outlook?: string | null
          strengths?: string[] | null
          symbol: string
          technical_indicators?: string | null
          threats?: string[] | null
          updated_at?: string | null
          weaknesses?: string[] | null
        }
        Update: {
          ai_recommendation?: string | null
          analysis_date?: string | null
          analyst_consensus?: string | null
          created_at?: string | null
          dividend_analysis?: string | null
          financial_health?: string | null
          id?: number
          investment_rating?: string | null
          key_metrics?: Json | null
          long_term_outlook?: string | null
          opportunities?: string[] | null
          price_target?: number | null
          risk_level?: string | null
          short_term_outlook?: string | null
          strengths?: string[] | null
          symbol?: string
          technical_indicators?: string | null
          threats?: string[] | null
          updated_at?: string | null
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      stock_analysis: {
        Row: {
          analysis_date: string
          analysis_text: string
          created_at: string
          id: string
          opportunity: string | null
          price_target: number | null
          recommendation: string | null
          sentiment: string | null
          strength: string | null
          symbol: string
          threat: string | null
          weakness: string | null
        }
        Insert: {
          analysis_date: string
          analysis_text: string
          created_at?: string
          id?: string
          opportunity?: string | null
          price_target?: number | null
          recommendation?: string | null
          sentiment?: string | null
          strength?: string | null
          symbol: string
          threat?: string | null
          weakness?: string | null
        }
        Update: {
          analysis_date?: string
          analysis_text?: string
          created_at?: string
          id?: string
          opportunity?: string | null
          price_target?: number | null
          recommendation?: string | null
          sentiment?: string | null
          strength?: string | null
          symbol?: string
          threat?: string | null
          weakness?: string | null
        }
        Relationships: []
      }
      stock_filter: {
        Row: {
          "5-Year-Dividend-Yield": number | null
          "Adjusted-Dividend-Yield": number | null
          created_at: string | null
          "Debt Levels": number | null
          "Dividend-History": string | null
          "Dividend-Yield": number | null
          Earnings_per_share: number | null
          Exchange: string | null
          "Financial-Health-Score": number | null
          id: string
          Location: string | null
          Net_Income: number | null
          "Payout Ratio": number | null
          "Payout-Ratio-Penalty": number | null
          Revenue: number | null
          "Revenue Growth": number | null
          Sector: string | null
          "Sub-Sector": string | null
          Symbol: string
        }
        Insert: {
          "5-Year-Dividend-Yield"?: number | null
          "Adjusted-Dividend-Yield"?: number | null
          created_at?: string | null
          "Debt Levels"?: number | null
          "Dividend-History"?: string | null
          "Dividend-Yield"?: number | null
          Earnings_per_share?: number | null
          Exchange?: string | null
          "Financial-Health-Score"?: number | null
          id?: string
          Location?: string | null
          Net_Income?: number | null
          "Payout Ratio"?: number | null
          "Payout-Ratio-Penalty"?: number | null
          Revenue?: number | null
          "Revenue Growth"?: number | null
          Sector?: string | null
          "Sub-Sector"?: string | null
          Symbol: string
        }
        Update: {
          "5-Year-Dividend-Yield"?: number | null
          "Adjusted-Dividend-Yield"?: number | null
          created_at?: string | null
          "Debt Levels"?: number | null
          "Dividend-History"?: string | null
          "Dividend-Yield"?: number | null
          Earnings_per_share?: number | null
          Exchange?: string | null
          "Financial-Health-Score"?: number | null
          id?: string
          Location?: string | null
          Net_Income?: number | null
          "Payout Ratio"?: number | null
          "Payout-Ratio-Penalty"?: number | null
          Revenue?: number | null
          "Revenue Growth"?: number | null
          Sector?: string | null
          "Sub-Sector"?: string | null
          Symbol?: string
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
          is_subscribed: boolean | null
          stock_symbol: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_subscribed?: boolean | null
          stock_symbol: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_subscribed?: boolean | null
          stock_symbol?: string
          user_id?: string | null
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
      top_stocks: {
        Row: {
          id: number
          industry: string
          Rank: number | null
          Score: number | null
          sector: string | null
          symbol: string
        }
        Insert: {
          id?: number
          industry: string
          Rank?: number | null
          Score?: number | null
          sector?: string | null
          symbol: string
        }
        Update: {
          id?: number
          industry?: string
          Rank?: number | null
          Score?: number | null
          sector?: string | null
          symbol?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          country: string | null
          created_at: string
          device_type: string | null
          end_time: string | null
          id: string
          referrer: string | null
          route_id: string
          session_id: string
          start_time: string
          user_agent: string | null
          website_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          end_time?: string | null
          id?: string
          referrer?: string | null
          route_id: string
          session_id: string
          start_time?: string
          user_agent?: string | null
          website_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          end_time?: string | null
          id?: string
          referrer?: string | null
          route_id?: string
          session_id?: string
          start_time?: string
          user_agent?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "website_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "connected_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      website_routes: {
        Row: {
          created_at: string
          id: string
          page_title: string | null
          route_path: string
          website_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_title?: string | null
          route_path: string
          website_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_title?: string | null
          route_path?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_routes_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "connected_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      yield_data: {
        Row: {
          close: number
          created_at: string | null
          date: string
          dividends: number
          id: string
          symbol: string
          yield: number
        }
        Insert: {
          close: number
          created_at?: string | null
          date: string
          dividends: number
          id?: string
          symbol: string
          yield: number
        }
        Update: {
          close?: number
          created_at?: string | null
          date?: string
          dividends?: number
          id?: string
          symbol?: string
          yield?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_table_names: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: unknown
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
