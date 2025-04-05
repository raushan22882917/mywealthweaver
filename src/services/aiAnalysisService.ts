
import { supabase } from '@/lib/supabase/client';
import { StockAnalysis } from '@/utils/types';

// First, tell Supabase about the stock_analysis table by creating it if needed
const createStockAnalysisTable = async () => {
  const { error } = await supabase.rpc('create_stock_analysis_table_if_not_exists');
  if (error) {
    console.error('Error creating stock_analysis table:', error);
  }
};

export const fetchStockAnalysis = async (symbol: string): Promise<StockAnalysis | null> => {
  try {
    // Make sure we have the table
    await createStockAnalysisTable();
    
    // Try to fetch existing analysis
    const { data, error } = await supabase
      .from('stock_analysis')
      .select('*')
      .eq('symbol', symbol)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No analysis found, return null
        return null;
      }
      throw error;
    }
    
    return data as StockAnalysis;
  } catch (error) {
    console.error('Error fetching stock analysis:', error);
    return null;
  }
};

export const saveStockAnalysis = async (analysis: StockAnalysis): Promise<StockAnalysis | null> => {
  try {
    // Make sure we have the table
    await createStockAnalysisTable();
    
    // Insert the analysis
    const { data, error } = await supabase
      .from('stock_analysis')
      .insert([
        {
          symbol: analysis.symbol,
          analysis_text: analysis.analysis_text,
          analysis_date: analysis.analysis_date,
          sentiment: analysis.sentiment,
          strength: analysis.strength || null,
          weakness: analysis.weakness || null,
          opportunity: analysis.opportunity || null,
          threat: analysis.threat || null,
          price_target: analysis.price_target || null,
          recommendation: analysis.recommendation || null
        }
      ])
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data as StockAnalysis;
  } catch (error) {
    console.error('Error saving stock analysis:', error);
    return null;
  }
};

// Add the stored procedure
export const setupStoredProcedures = async () => {
  try {
    // Create the stored procedure to create the table if it doesn't exist
    const { error } = await supabase.rpc('create_stock_analysis_table_if_not_exists');
    
    if (error) {
      console.error('Error creating stored procedure:', error);
    }
  } catch (error) {
    console.error('Error setting up stored procedures:', error);
  }
};
