
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      dividends: {
        Row: {
          id: number
          symbol: string
          company_name: string
          dividend_rate: string
          previous_close: string
          current_price: string
          dividend_yield: string
          payout_ratio: string
          annual_rate: string
          message: string
          ex_dividend_date: string
          buy_date: string
          dividend_date: string
          earnings_date: string
          payout_date: string
          history: string
          insight: string
          logo_url: string
          industry: string
          employees: string
          founded: string
          address: string
          ceo: string
          website: string
          description: string
          market_cap: string
          pe_ratio: string
          week_range: string
          volume: string
          yield_range: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          symbol: string
          company_name: string
          dividend_rate?: string
          previous_close?: string
          current_price?: string
          dividend_yield?: string
          payout_ratio?: string
          annual_rate?: string
          message?: string
          ex_dividend_date?: string
          buy_date?: string
          dividend_date?: string
          earnings_date?: string
          payout_date?: string
          history?: string
          insight?: string
          logo_url?: string
          industry?: string
          employees?: string
          founded?: string
          address?: string
          ceo?: string
          website?: string
          description?: string
          market_cap?: string
          pe_ratio?: string
          week_range?: string
          volume?: string
          yield_range?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          symbol?: string
          company_name?: string
          dividend_rate?: string
          previous_close?: string
          current_price?: string
          dividend_yield?: string
          payout_ratio?: string
          annual_rate?: string
          message?: string
          ex_dividend_date?: string
          buy_date?: string
          dividend_date?: string
          earnings_date?: string
          payout_date?: string
          history?: string
          insight?: string
          logo_url?: string
          industry?: string
          employees?: string
          founded?: string
          address?: string
          ceo?: string
          website?: string
          description?: string
          market_cap?: string
          pe_ratio?: string
          week_range?: string
          volume?: string
          yield_range?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      logo: {
        Row: {
          id: number
          symbol: string
          logo_urls: string
          company_name?: string
          domain?: string
        }
        Insert: {
          id?: number
          symbol: string
          logo_urls: string
          company_name?: string
          domain?: string
        }
        Update: {
          id?: number
          symbol?: string
          logo_urls?: string
          company_name?: string
          domain?: string
        }
      }
      dividend_safety: {
        Row: {
          id?: number
          symbol: string
          status?: string
          payout_ratio?: number
          fcf_coverage?: number
          debt_to_equity?: number
        }
        Insert: {
          id?: number
          symbol: string
          status?: string
          payout_ratio?: number
          fcf_coverage?: number
          debt_to_equity?: number
        }
        Update: {
          id?: number
          symbol?: string
          status?: string
          payout_ratio?: number
          fcf_coverage?: number
          debt_to_equity?: number
        }
      }
      dividend_yield: {
        Row: {
          id: string
          symbol: string
          yield: number
          date: string
          dividends: number
          stock_price?: number
          quarter_year?: string
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          yield: number
          date: string
          dividends: number
          stock_price?: number
          quarter_year?: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          yield?: number
          date?: string
          dividends?: number
          stock_price?: number
          quarter_year?: string
          created_at?: string
        }
      }
      earnings_report: {
        Row: {
          symbol: string;
          earnings_date: string | null;
          earnings_high: number | null;
          earnings_low: number | null;
          earnings_average: number | null;
          revenue_high: number | null;
          revenue_low: number | null;
          revenue_average: number | null;
          as_of_date: string | null;
        };
        Insert: {
          symbol: string;
          earnings_date?: string | null;
          earnings_high?: number | null;
          earnings_low?: number | null;
          earnings_average?: number | null;
          revenue_high?: number | null;
          revenue_low?: number | null;
          revenue_average?: number | null;
          as_of_date?: string | null;
        };
        Update: {
          symbol?: string;
          earnings_date?: string | null;
          earnings_high?: number | null;
          earnings_low?: number | null;
          earnings_average?: number | null;
          revenue_high?: number | null;
          revenue_low?: number | null;
          revenue_average?: number | null;
          as_of_date?: string | null;
        };
      };
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
  }
}
