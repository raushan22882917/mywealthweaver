import { supabase } from '../integrations/supabase/client';

async function createStockAnalysisTable() {
  try {
    console.log('Creating stock_ai_analysis table...');

    const { error } = await supabase.rpc('create_stock_analysis_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS stock_ai_analysis (
          id SERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          analysis_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          financial_health TEXT,
          investment_rating TEXT,
          price_target DECIMAL,
          risk_level TEXT,
          strengths TEXT[],
          weaknesses TEXT[],
          opportunities TEXT[],
          threats TEXT[],
          short_term_outlook TEXT,
          long_term_outlook TEXT,
          dividend_analysis TEXT,
          technical_indicators TEXT,
          analyst_consensus TEXT,
          ai_recommendation TEXT,
          key_metrics JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(symbol)
        );
        
        CREATE INDEX IF NOT EXISTS idx_stock_ai_analysis_symbol ON stock_ai_analysis(symbol);
      `
    });
    
    if (error) {
      console.error('Error creating stock_ai_analysis table:', error);
      throw error;
    }

    console.log('Stock analysis table created successfully!');

    // Insert sample data
    await insertSampleData();

  } catch (error) {
    console.error('Error creating stock analysis table:', error);
  }
}

async function insertSampleData() {
  try {
    console.log('Inserting sample analysis data...');

    const sampleAnalysis = {
      symbol: 'GT',
      analysis_date: new Date().toISOString(),
      financial_health: "Goodyear Tire & Rubber Company shows moderate financial stability with improving liquidity ratios but still elevated debt levels. The company has been working to strengthen its balance sheet following recent challenges.",
      investment_rating: "Hold",
      price_target: 12.50,
      risk_level: "Medium",
      strengths: [
        "Strong brand recognition globally",
        "Extensive distribution network",
        "Diverse product portfolio across multiple price points",
        "Significant manufacturing scale and capabilities"
      ],
      weaknesses: [
        "High debt burden compared to industry peers",
        "Margin pressure from raw material costs",
        "Exposure to cyclical automotive industry",
        "Legacy cost structure in some markets"
      ],
      opportunities: [
        "Growing demand for specialty and premium tires",
        "Expansion in emerging markets",
        "Development of tires for electric vehicles",
        "Aftermarket services growth potential"
      ],
      threats: [
        "Intense competition from low-cost manufacturers",
        "Volatile rubber and oil prices",
        "Potential economic slowdown affecting automotive sales",
        "Regulatory changes related to environmental standards"
      ],
      short_term_outlook: "In the next 3-6 months, Goodyear faces headwinds from inflationary pressures and supply chain challenges. However, pricing actions and cost-cutting initiatives should help stabilize performance.",
      long_term_outlook: "The long-term outlook (1-3 years) is cautiously positive as the company continues its transformation strategy. Focus on premium products, operational efficiency, and debt reduction should improve financial performance over time.",
      dividend_analysis: "Goodyear currently does not pay a dividend as it prioritizes debt reduction and reinvestment in the business. Dividend reinstatement would likely require sustained improvement in free cash flow generation and further debt reduction.",
      technical_indicators: "Technical indicators show mixed signals. The stock is trading below key moving averages with negative momentum indicators. However, oversold conditions suggest potential for a technical bounce.",
      analyst_consensus: "Wall Street analysts maintain a mixed view, with the consensus leaning toward Hold. Recent analyst reports highlight both turnaround potential and ongoing execution risks.",
      ai_recommendation: "Based on comprehensive analysis of financial metrics, market positioning, and industry trends, our AI recommendation is to HOLD shares at current levels. The risk-reward profile appears balanced, with potential upside if management execution improves but downside risks from macroeconomic factors.",
      key_metrics: {
        pe_ratio: 7.02,
        price_to_book: 0.85,
        debt_to_equity: 1.45,
        profit_margin: 0.03,
        revenue_growth: 0.02
      }
    };

    const { error } = await supabase
      .from('stock_ai_analysis')
      .upsert(sampleAnalysis, { onConflict: 'symbol' });

    if (error) {
      console.error('Error inserting sample analysis data:', error);
      throw error;
    }

    console.log('Sample analysis data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Run the function
createStockAnalysisTable()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err));
