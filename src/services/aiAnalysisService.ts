
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

export const getStockAnalysisFromDB = async (symbol: string): Promise<StockAnalysis | null> => {
  return await fetchStockAnalysis(symbol);
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

// Function to analyze stock with AI using Groq API
export const analyzeStockWithAI = async (symbol: string, companyData: any): Promise<StockAnalysis | null> => {
  try {
    // Check if we already have a recent analysis
    const existingAnalysis = await fetchStockAnalysis(symbol);
    
    // If we have a recent analysis (less than 24 hours old), return it
    if (existingAnalysis) {
      const analysisDate = new Date(existingAnalysis.analysis_date);
      const now = new Date();
      const hoursSinceAnalysis = (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceAnalysis < 24) {
        console.log('Using cached analysis from database');
        return existingAnalysis;
      }
    }
    
    console.log('Generating new analysis with Groq API');
    
    // Prepare message for Groq API
    const promptText = `
      I need a detailed stock analysis for ${symbol}. 
      Here's what I know about the company:
      Symbol: ${symbol}
      Company Name: ${companyData?.company_name || companyData?.shortName || 'Unknown'}
      Sector: ${companyData?.sector || 'Unknown'}
      Industry: ${companyData?.industry || 'Unknown'}
      Price: $${companyData?.currentprice || companyData?.previousClose || 'Unknown'}
      Dividend Yield: ${companyData?.dividend_yield || companyData?.dividendYield || 'Unknown'}%
      
      Please provide:
      1. A comprehensive analysis (2-3 paragraphs)
      2. SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
      3. Price target
      4. Investment recommendation (Buy/Hold/Sell)
      5. Overall sentiment (Bullish/Neutral/Bearish)
      
      Format your response as a JSON object with these keys:
      {
        "analysis_text": "...",
        "strength": "...",
        "weakness": "...",
        "opportunity": "...",
        "threat": "...",
        "price_target": number,
        "recommendation": "...",
        "sentiment": "..."
      }
    `;
    
    // Check if GROQ_API_KEY is available
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment variables');
      throw new Error('GROQ_API_KEY not found');
    }
    
    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst specialized in stock market analysis. Provide concise, data-driven insights.'
          },
          {
            role: 'user',
            content: promptText
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let parsedContent;
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw response:', content);
      
      // Attempt to create a structured response from unstructured text
      parsedContent = {
        analysis_text: content.substring(0, 1000),
        sentiment: 'Neutral',
        recommendation: 'Hold',
        price_target: null
      };
    }
    
    // Create a StockAnalysis object
    const analysis: StockAnalysis = {
      symbol,
      analysis_text: parsedContent.analysis_text || 'Analysis not available',
      analysis_date: new Date().toISOString(),
      sentiment: parsedContent.sentiment || 'Neutral',
      strength: parsedContent.strength || null,
      weakness: parsedContent.weakness || null,
      opportunity: parsedContent.opportunity || null,
      threat: parsedContent.threat || null,
      price_target: parsedContent.price_target || null,
      recommendation: parsedContent.recommendation || 'Hold'
    };
    
    // Save the analysis to the database
    const savedAnalysis = await saveStockAnalysis(analysis);
    return savedAnalysis;
    
  } catch (error) {
    console.error('Error analyzing stock with AI:', error);
    return null;
  }
};
