
import { supabase } from '../lib/supabase';

async function createDividendDatesTable() {
  try {
    // Check if table exists before creating it
    const { data: existingTables, error: checkError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'dividend_dates');
    
    if (checkError) {
      console.error('Error checking for existing table:', checkError);
      return;
    }
    
    // If table doesn't exist, create it
    if (!existingTables || existingTables.length === 0) {
      const { error } = await supabase.rpc('create_table_sql', {
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
    } else {
      console.log('Dividend dates table already exists, skipping creation.');
    }
  } catch (error) {
    console.error('Error creating dividend dates table:', error);
  }
}

createDividendDatesTable();
