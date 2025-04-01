
import { supabase } from '../lib/supabase';

async function createDividendDatesTable() {
  try {
    const { error } = await supabase.rpc('create_dividend_dates_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS dividend_dates (
          id SERIAL PRIMARY KEY,
          symbol TEXT UNIQUE NOT NULL,
          buy_date DATE,
          payout_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );

        CREATE INDEX IF NOT EXISTS idx_dividend_dates_symbol ON dividend_dates(symbol);
      `
    });

    if (error) throw error;
    console.log('Dividend dates table created successfully!');
  } catch (error) {
    console.error('Error creating dividend dates table:', error);
  }
}

createDividendDatesTable();
