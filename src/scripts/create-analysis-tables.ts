import { supabase } from '../integrations/supabase/client';

async function createAnalysisTables() {
  try {
    console.log('Creating stock analysis tables...');

    // Create stock_analysis table
    const { error: analysisError } = await supabase.rpc('create_stock_analysis_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS stock_analysis (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          symbol TEXT NOT NULL,
          analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
          financial_health TEXT,
          growth_potential TEXT,
          risk_assessment TEXT,
          dividend_analysis TEXT,
          competitive_position TEXT,
          recommendation TEXT NOT NULL,
          price_target TEXT,
          confidence_score INTEGER NOT NULL,
          key_metrics JSONB,
          key_strengths TEXT[],
          key_weaknesses TEXT[],
          investment_thesis TEXT,
          catalysts TEXT[],
          risks TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        CREATE INDEX IF NOT EXISTS idx_stock_analysis_symbol ON stock_analysis(symbol);
        CREATE INDEX IF NOT EXISTS idx_stock_analysis_date ON stock_analysis(analysis_date);
      `
    });
    
    if (analysisError) {
      console.error('Error creating stock_analysis table:', analysisError);
      throw analysisError;
    }

    // Create stock_analysis_history table
    const { error: historyError } = await supabase.rpc('create_stock_analysis_history_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS stock_analysis_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          symbol TEXT NOT NULL,
          company_name TEXT NOT NULL,
          analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
          recommendation TEXT NOT NULL,
          price_target TEXT,
          confidence_score INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        CREATE INDEX IF NOT EXISTS idx_stock_analysis_history_user ON stock_analysis_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_stock_analysis_history_symbol ON stock_analysis_history(symbol);
      `
    });
    
    if (historyError) {
      console.error('Error creating stock_analysis_history table:', historyError);
      throw historyError;
    }

    // Create favorite_analyses table
    const { error: favoritesError } = await supabase.rpc('create_favorite_analyses_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS favorite_analyses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          symbol TEXT NOT NULL,
          analysis_id UUID NOT NULL REFERENCES stock_analysis(id) ON DELETE CASCADE,
          saved_date TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          UNIQUE(user_id, analysis_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_favorite_analyses_user ON favorite_analyses(user_id);
      `
    });
    
    if (favoritesError) {
      console.error('Error creating favorite_analyses table:', favoritesError);
      throw favoritesError;
    }

    console.log('Stock analysis tables created successfully!');

    // Insert sample data
    await insertSampleData();

  } catch (error) {
    console.error('Error creating stock analysis tables:', error);
  }
}

async function insertSampleData() {
  try {
    console.log('Inserting sample analysis data...');

    // Sample analysis for GT (Goodyear Tire & Rubber Company)
    const sampleAnalysis = {
      symbol: 'GT',
      analysis_date: new Date().toISOString(),
      financial_health: "The company shows moderate financial health with stable cash flows and manageable debt levels.",
      growth_potential: "Growth prospects are positive, with expected expansion in key markets and new product lines.",
      risk_assessment: "Moderate risk profile with exposure to market volatility and competitive pressures.",
      dividend_analysis: "Currently offers a dividend yield of 2.3% with a sustainable payout ratio of 45%.",
      competitive_position: "Holds a strong competitive position with established market share and brand recognition.",
      recommendation: "Buy - The stock appears undervalued relative to peers and growth prospects.",
      price_target: "$12.50 (12-month target)",
      confidence_score: 7,
      key_metrics: {
        pe_ratio: 15.2,
        market_cap: "$2.91B",
        revenue_growth: "4.5%",
        profit_margin: "8.2%",
        debt_to_equity: 1.2,
        current_ratio: 1.8,
        dividend_yield: "2.3%",
        payout_ratio: "45%",
        beta: 1.3
      },
      key_strengths: [
        "Strong brand recognition in core markets",
        "Diversified product portfolio",
        "Efficient manufacturing operations",
        "Solid cash flow generation"
      ],
      key_weaknesses: [
        "Exposure to raw material price volatility",
        "Increasing competition in key segments",
        "Moderate debt levels",
        "Cyclical demand patterns"
      ],
      investment_thesis: "The company is well-positioned to benefit from industry trends and has demonstrated resilience during economic downturns. Management's focus on innovation and cost efficiency should drive margin expansion and earnings growth over the next 2-3 years.",
      catalysts: [
        "New product launches expected in Q3",
        "Expansion into emerging markets",
        "Potential margin improvement from cost-cutting initiatives",
        "Industry consolidation opportunities"
      ],
      risks: [
        "Economic slowdown affecting consumer demand",
        "Rising input costs pressuring margins",
        "Regulatory changes in key markets",
        "Technological disruption in the industry"
      ]
    };

    const { data: insertedAnalysis, error: analysisError } = await supabase
      .from('stock_analysis')
      .insert([sampleAnalysis])
      .select();

    if (analysisError) {
      console.error('Error inserting sample analysis:', analysisError);
      throw analysisError;
    }

    console.log('Sample analysis data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Run the function
createAnalysisTables()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err));
