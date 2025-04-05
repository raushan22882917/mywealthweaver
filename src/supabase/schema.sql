
-- Schema for stock_analysis table
CREATE TABLE IF NOT EXISTS public.stock_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  analysis_text TEXT NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
  sentiment TEXT,
  strength TEXT,
  weakness TEXT,
  opportunity TEXT,
  threat TEXT,
  price_target NUMERIC,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Schema for stock_prices table
CREATE TABLE IF NOT EXISTS public.stock_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  current_price NUMERIC,
  price_change NUMERIC,
  percent_change NUMERIC,
  previous_close NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Schema for stock_historical_prices table
CREATE TABLE IF NOT EXISTS public.stock_historical_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  price NUMERIC NOT NULL,
  volume NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Schema for similar_stocks table
CREATE TABLE IF NOT EXISTS public.similar_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  similar_symbol TEXT NOT NULL,
  similarity_score NUMERIC,
  last_price NUMERIC,
  change NUMERIC,
  change_percent NUMERIC,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
