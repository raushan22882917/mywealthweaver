
-- Create a function to create stock_analysis table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_stock_analysis_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'stock_analysis'
  ) THEN
    CREATE TABLE public.stock_analysis (
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
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'stock_prices'
  ) THEN
    CREATE TABLE public.stock_prices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      symbol TEXT NOT NULL,
      current_price NUMERIC,
      price_change NUMERIC,
      percent_change NUMERIC,
      previous_close NUMERIC,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'stock_historical_prices'
  ) THEN
    CREATE TABLE public.stock_historical_prices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      symbol TEXT NOT NULL,
      date DATE NOT NULL,
      price NUMERIC NOT NULL,
      volume NUMERIC,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'similar_stocks'
  ) THEN
    CREATE TABLE public.similar_stocks (
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
  END IF;
END;
$$;
