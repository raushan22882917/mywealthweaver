import { supabase } from '../integrations/supabase/client';

async function createStockTables() {
  try {
    console.log('Creating stock tables...');

    // Create stock_prices table
    const { error: pricesError } = await supabase.rpc('create_stock_prices_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS stock_prices (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          current_price DECIMAL NOT NULL,
          price_change DECIMAL,
          percent_change DECIMAL,
          previous_close DECIMAL,
          open_price DECIMAL,
          day_high DECIMAL,
          day_low DECIMAL,
          volume BIGINT,
          market_cap BIGINT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol)
        );
        
        CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
      `
    });
    
    if (pricesError) {
      console.error('Error creating stock_prices table:', pricesError);
      throw pricesError;
    }

    // Create stock_historical_prices table
    const { error: historicalError } = await supabase.rpc('create_stock_historical_prices_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS stock_historical_prices (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          date DATE NOT NULL,
          price DECIMAL NOT NULL,
          volume BIGINT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol, date)
        );
        
        CREATE INDEX IF NOT EXISTS idx_stock_historical_prices_symbol ON stock_historical_prices(symbol);
        CREATE INDEX IF NOT EXISTS idx_stock_historical_prices_date ON stock_historical_prices(date);
      `
    });
    
    if (historicalError) {
      console.error('Error creating stock_historical_prices table:', historicalError);
      throw historicalError;
    }

    // Create similar_stocks table
    const { error: similarError } = await supabase.rpc('create_similar_stocks_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS similar_stocks (
          id SERIAL PRIMARY KEY,
          base_symbol TEXT NOT NULL,
          symbol TEXT NOT NULL,
          company_name TEXT,
          last_price DECIMAL,
          change DECIMAL,
          change_percent DECIMAL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(base_symbol, symbol)
        );
        
        CREATE INDEX IF NOT EXISTS idx_similar_stocks_base_symbol ON similar_stocks(base_symbol);
      `
    });
    
    if (similarError) {
      console.error('Error creating similar_stocks table:', similarError);
      throw similarError;
    }

    console.log('Stock tables created successfully!');

    // Insert sample data for GT (Goodyear Tire & Rubber Company)
    await insertSampleData();

  } catch (error) {
    console.error('Error creating stock tables:', error);
  }
}

async function insertSampleData() {
  try {
    console.log('Inserting sample data...');

    // Insert GT stock price
    const { error: priceError } = await supabase
      .from('stock_prices')
      .upsert([
        {
          symbol: 'GT',
          current_price: 9.56,
          price_change: -0.63,
          percent_change: -6.23,
          previous_close: 10.19,
          open_price: 9.97,
          day_high: 9.97,
          day_low: 9.52,
          volume: 4226851,
          market_cap: 2910000000
        }
      ], { onConflict: 'symbol' });

    if (priceError) {
      console.error('Error inserting stock price data:', priceError);
      throw priceError;
    }

    // Insert GT historical prices (last 30 days)
    const historicalPrices = [];
    const today = new Date();
    let basePrice = 9.56;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Add some random variation to the price
      basePrice = basePrice * (1 + (Math.random() - 0.5) * 0.02);
      
      historicalPrices.push({
        symbol: 'GT',
        date: date.toISOString().split('T')[0],
        price: Number(basePrice.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000) + 2000000
      });
    }

    const { error: historicalError } = await supabase
      .from('stock_historical_prices')
      .upsert(historicalPrices, { onConflict: 'symbol, date' });

    if (historicalError) {
      console.error('Error inserting historical price data:', historicalError);
      throw historicalError;
    }

    // Insert similar stocks for GT
    const similarStocks = [
      { base_symbol: 'GT', symbol: 'HOG', company_name: 'Harley-Davidson, Inc.', last_price: 21.94, change: -1.05, change_percent: -4.65 },
      { base_symbol: 'GT', symbol: 'HBI', company_name: 'Hanesbrands Inc.', last_price: 4.74, change: -0.18, change_percent: -3.66 },
      { base_symbol: 'GT', symbol: 'M', company_name: 'Macy\'s, Inc.', last_price: 11.32, change: -0.09, change_percent: -0.79 },
      { base_symbol: 'GT', symbol: 'KSS', company_name: 'Kohl\'s Corporation', last_price: 6.95, change: 0.31, change_percent: 4.67 },
      { base_symbol: 'GT', symbol: 'NWL', company_name: 'Newell Brands Inc.', last_price: 5.14, change: -0.33, change_percent: -5.95 }
    ];

    const { error: similarError } = await supabase
      .from('similar_stocks')
      .upsert(similarStocks, { onConflict: 'base_symbol, symbol' });

    if (similarError) {
      console.error('Error inserting similar stocks data:', similarError);
      throw similarError;
    }

    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Run the function
createStockTables()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err));
