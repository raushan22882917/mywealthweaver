import { supabase } from '../lib/supabase';

async function createTables() {
  try {
    // Create company_profiles table
    const { error: profileError } = await supabase.rpc('create_company_profiles_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS company_profiles (
          id SERIAL PRIMARY KEY,
          symbol TEXT UNIQUE NOT NULL,
          phone TEXT,
          website TEXT,
          industry TEXT,
          sector TEXT,
          long_business_summary TEXT,
          full_time_employees INTEGER,
          audit_risk DECIMAL,
          board_risk DECIMAL,
          compensation_risk DECIMAL,
          share_holder_rights_risk DECIMAL,
          overall_risk DECIMAL,
          dividend_rate DECIMAL,
          dividend_yield DECIMAL,
          ex_dividend_date DATE,
          payout_ratio DECIMAL,
          five_year_avg_dividend_yield DECIMAL,
          beta DECIMAL,
          trailing_pe DECIMAL,
          forward_pe DECIMAL,
          price_to_sales_trailing_12_months DECIMAL,
          fifty_day_average DECIMAL,
          two_hundred_day_average DECIMAL,
          trailing_annual_dividend_rate DECIMAL,
          trailing_annual_dividend_yield DECIMAL,
          profit_margins DECIMAL,
          held_percent_insiders DECIMAL,
          held_percent_institutions DECIMAL,
          book_value DECIMAL,
          price_to_book DECIMAL,
          last_fiscal_year_end DATE,
          earnings_quarterly_growth DECIMAL,
          net_income_to_common DECIMAL,
          trailing_eps DECIMAL,
          forward_eps DECIMAL,
          enterprise_to_revenue DECIMAL,
          enterprise_to_ebitda DECIMAL,
          week_change_52 DECIMAL,
          sand_p_52_week_change DECIMAL,
          last_dividend_value DECIMAL,
          last_dividend_date DATE,
          exchange TEXT,
          quote_type TEXT,
          short_name TEXT,
          target_high_price DECIMAL,
          target_low_price DECIMAL,
          target_mean_price DECIMAL,
          target_median_price DECIMAL,
          recommendation_mean DECIMAL,
          recommendation_key TEXT,
          number_of_analyst_opinions INTEGER,
          total_cash BIGINT,
          total_cash_per_share DECIMAL,
          ebitda BIGINT,
          total_debt BIGINT,
          quick_ratio DECIMAL,
          current_ratio DECIMAL,
          total_revenue BIGINT,
          debt_to_equity DECIMAL,
          revenue_per_share DECIMAL,
          return_on_assets DECIMAL,
          return_on_equity DECIMAL,
          gross_profits BIGINT,
          free_cashflow BIGINT,
          operating_cashflow BIGINT,
          earnings_growth DECIMAL,
          revenue_growth DECIMAL,
          gross_margins DECIMAL,
          ebitda_margins DECIMAL,
          operating_margins DECIMAL,
          trailing_peg_ratio DECIMAL,
          address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );

        -- Create indexes for frequently queried columns
        CREATE INDEX IF NOT EXISTS idx_company_profiles_symbol ON company_profiles(symbol);
        CREATE INDEX IF NOT EXISTS idx_company_profiles_sector ON company_profiles(sector);
        CREATE INDEX IF NOT EXISTS idx_company_profiles_industry ON company_profiles(industry);
      `
    });
    if (profileError) throw profileError;

    // Create annual_dividends table
    const { error: annualDivError } = await supabase.rpc('create_annual_dividends_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS annual_dividends (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          date DATE NOT NULL,
          dividends DECIMAL NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol, date)
        );
      `
    });
    if (annualDivError) throw annualDivError;

    // Create quarterly_dividends table
    const { error: quarterlyDivError } = await supabase.rpc('create_quarterly_dividends_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS quarterly_dividends (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          date DATE NOT NULL,
          dividends DECIMAL NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol, date)
        );
      `
    });
    if (quarterlyDivError) throw quarterlyDivError;

    // Create stock_rankings table
    const { error: rankingError } = await supabase.rpc('create_stock_rankings_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS stock_rankings (
          id SERIAL PRIMARY KEY,
          symbol TEXT UNIQUE NOT NULL,
          rank INTEGER NOT NULL,
          score DECIMAL NOT NULL,
          sector TEXT,
          industry TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
      `
    });
    if (rankingError) throw rankingError;

    // Create similar_companies table
    const { error: similarError } = await supabase.rpc('create_similar_companies_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS similar_companies (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          similar_symbol TEXT NOT NULL,
          company_name TEXT,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol, similar_symbol)
        );
      `
    });
    if (similarError) throw similarError;

    // Create company_logos table
    const { error: logoError } = await supabase.rpc('create_company_logos_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS company_logos (
          id SERIAL PRIMARY KEY,
          symbol TEXT UNIQUE NOT NULL,
          logo_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
      `
    });
    if (logoError) throw logoError;

    // Create payout_history table
    const { error: payoutError } = await supabase.rpc('create_payout_history_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS payout_history (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          date DATE NOT NULL,
          dividends DECIMAL NOT NULL,
          eps DECIMAL,
          quarter_year TEXT,
          payout DECIMAL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol, date)
        );
      `
    });
    if (payoutError) throw payoutError;

    // Create annual_dividend_history table
    const { error: annualHistError } = await supabase.rpc('create_annual_dividend_history_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS annual_dividend_history (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          date DATE NOT NULL,
          dividends DECIMAL NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol, date)
        );
      `
    });
    if (annualHistError) throw annualHistError;

    // Create quarterly_dividend_history table
    const { error: quarterlyHistError } = await supabase.rpc('create_quarterly_dividend_history_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS quarterly_dividend_history (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          date DATE NOT NULL,
          dividends DECIMAL NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol, date)
        );
      `
    });
    if (quarterlyHistError) throw quarterlyHistError;

    // Create dividend_dates table
    const { error: datesError } = await supabase.rpc('create_dividend_dates_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS dividend_dates (
          id SERIAL PRIMARY KEY,
          symbol TEXT UNIQUE NOT NULL,
          buy_date DATE,
          payout_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
      `
    });
    if (datesError) throw datesError;

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
