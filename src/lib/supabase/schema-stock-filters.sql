
-- Create a table to store comprehensive stock filter data
CREATE TABLE IF NOT EXISTS stock_financial_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  exchange TEXT,
  sector TEXT,
  sub_sector TEXT,
  revenue_growth NUMERIC,
  net_income NUMERIC,
  debt_levels NUMERIC,
  payout_ratio NUMERIC,
  dividend_yield NUMERIC,
  five_year_dividend_yield NUMERIC,
  dividend_history TEXT,
  financial_health_score NUMERIC,
  revenue NUMERIC,
  earnings_per_share NUMERIC,
  adjusted_dividend_yield NUMERIC,
  payout_ratio_penalty NUMERIC,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_financial_details_symbol ON stock_financial_details(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_financial_details_sector ON stock_financial_details(sector);
CREATE INDEX IF NOT EXISTS idx_stock_financial_details_dividend_yield ON stock_financial_details(dividend_yield);
