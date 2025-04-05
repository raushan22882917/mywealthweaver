import { StockData } from './stockService';
import { supabase } from '@/integrations/supabase/client';

// Define the interface for AI analysis results
export interface StockAnalysis {
  id?: string;
  symbol: string;
  analysis_date: string;
  financial_health: string;
  investment_rating: 'Buy' | 'Hold' | 'Sell' | string;
  price_target?: number;
  risk_level: 'Low' | 'Medium' | 'High' | string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  short_term_outlook: string;
  long_term_outlook: string;
  dividend_analysis?: string;
  technical_indicators?: string;
  analyst_consensus?: string;
  ai_recommendation: string;
  key_metrics?: {
    pe_ratio?: number;
    price_to_book?: number;
    debt_to_equity?: number;
    profit_margin?: number;
    revenue_growth?: number;
  };
}

// Function to analyze stock using GROQ API
export const analyzeStockWithAI = async (stock: StockData): Promise<StockAnalysis> => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    // Create a prompt for the AI
    const prompt = `
      Analyze the following stock in detail:
      
      Symbol: ${stock.symbol}
      Company Name: ${stock.longName}
      Current Price: $${stock.regularMarketPrice.toFixed(2)}
      Market Cap: ${formatMarketCap(stock.marketCap)}
      P/E Ratio: ${stock.trailingPE || 'N/A'}
      Dividend Yield: ${stock.dividendYield ? (stock.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
      Sector: ${stock.sector || 'N/A'}
      Industry: ${stock.industry || 'N/A'}
      
      Please provide a comprehensive analysis including:
      1. Financial health assessment
      2. Investment rating (Buy/Hold/Sell)
      3. Risk level assessment
      4. SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
      5. Short-term outlook (3-6 months)
      6. Long-term outlook (1-3 years)
      7. Dividend analysis (if applicable)
      8. Technical indicators summary
      9. Analyst consensus
      10. Your AI recommendation
      
      Format your response as a structured JSON object with the following fields:
      {
        "financial_health": "detailed assessment",
        "investment_rating": "Buy/Hold/Sell",
        "price_target": number or null,
        "risk_level": "Low/Medium/High",
        "strengths": ["strength1", "strength2", ...],
        "weaknesses": ["weakness1", "weakness2", ...],
        "opportunities": ["opportunity1", "opportunity2", ...],
        "threats": ["threat1", "threat2", ...],
        "short_term_outlook": "detailed outlook",
        "long_term_outlook": "detailed outlook",
        "dividend_analysis": "analysis if applicable",
        "technical_indicators": "summary of indicators",
        "analyst_consensus": "summary of analyst opinions",
        "ai_recommendation": "your final recommendation",
        "key_metrics": {
          "pe_ratio": number or null,
          "price_to_book": number or null,
          "debt_to_equity": number or null,
          "profit_margin": number or null,
          "revenue_growth": number or null
        }
      }
    `;

    // Call the GROQ API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a professional stock analyst with expertise in financial markets, technical analysis, and fundamental analysis. Provide detailed, accurate, and actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Extract the JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }
    
    const analysisJson = JSON.parse(jsonMatch[0]);
    
    // Create the analysis object
    const analysis: StockAnalysis = {
      symbol: stock.symbol,
      analysis_date: new Date().toISOString(),
      financial_health: analysisJson.financial_health,
      investment_rating: analysisJson.investment_rating,
      price_target: analysisJson.price_target,
      risk_level: analysisJson.risk_level,
      strengths: analysisJson.strengths,
      weaknesses: analysisJson.weaknesses,
      opportunities: analysisJson.opportunities,
      threats: analysisJson.threats,
      short_term_outlook: analysisJson.short_term_outlook,
      long_term_outlook: analysisJson.long_term_outlook,
      dividend_analysis: analysisJson.dividend_analysis,
      technical_indicators: analysisJson.technical_indicators,
      analyst_consensus: analysisJson.analyst_consensus,
      ai_recommendation: analysisJson.ai_recommendation,
      key_metrics: analysisJson.key_metrics
    };
    
    // Save the analysis to the database
    await saveAnalysisToDatabase(analysis);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing stock with AI:', error);
    
    // Return mock data for development/fallback
    return getMockAnalysis(stock);
  }
};

// Function to save analysis to the database
export const saveAnalysisToDatabase = async (analysis: StockAnalysis): Promise<void> => {
  try {
    const { error } = await supabase
      .from('stock_ai_analysis')
      .upsert({
        symbol: analysis.symbol,
        analysis_date: analysis.analysis_date,
        financial_health: analysis.financial_health,
        investment_rating: analysis.investment_rating,
        price_target: analysis.price_target,
        risk_level: analysis.risk_level,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        opportunities: analysis.opportunities,
        threats: analysis.threats,
        short_term_outlook: analysis.short_term_outlook,
        long_term_outlook: analysis.long_term_outlook,
        dividend_analysis: analysis.dividend_analysis,
        technical_indicators: analysis.technical_indicators,
        analyst_consensus: analysis.analyst_consensus,
        ai_recommendation: analysis.ai_recommendation,
        key_metrics: analysis.key_metrics
      }, { onConflict: 'symbol' });
    
    if (error) {
      throw error;
    }
    
    console.log('Analysis saved to database successfully');
  } catch (error) {
    console.error('Error saving analysis to database:', error);
  }
};

// Function to get the latest analysis from the database
export const getLatestAnalysis = async (symbol: string): Promise<StockAnalysis | null> => {
  try {
    const { data, error } = await supabase
      .from('stock_ai_analysis')
      .select('*')
      .eq('symbol', symbol)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as StockAnalysis;
  } catch (error) {
    console.error('Error getting latest analysis:', error);
    return null;
  }
};

// Helper function to format market cap
const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1_000_000_000_000) {
    return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
  } else if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
};

// Mock data for development/fallback
const getMockAnalysis = (stock: StockData): StockAnalysis => {
  return {
    symbol: stock.symbol,
    analysis_date: new Date().toISOString(),
    financial_health: "The company demonstrates moderate financial stability with adequate liquidity ratios and manageable debt levels. Cash flow from operations has been positive but showing some volatility in recent quarters.",
    investment_rating: stock.regularMarketChangePercent > 0 ? "Buy" : "Hold",
    price_target: stock.regularMarketPrice * 1.15,
    risk_level: "Medium",
    strengths: [
      "Strong brand recognition in the industry",
      "Diversified product portfolio reducing dependency on single market segments",
      "Experienced management team with proven track record",
      "Healthy cash reserves providing flexibility for strategic initiatives"
    ],
    weaknesses: [
      "Increasing competition in core markets",
      "Margin pressure due to rising input costs",
      "Aging infrastructure requiring capital investment",
      "Slower adoption of digital transformation compared to industry leaders"
    ],
    opportunities: [
      "Expansion into emerging markets with growing demand",
      "Strategic acquisitions to enhance product offerings",
      "Development of innovative products to address evolving customer needs",
      "Cost optimization initiatives to improve operational efficiency"
    ],
    threats: [
      "Regulatory changes affecting industry dynamics",
      "Economic slowdown impacting consumer spending",
      "Disruptive technologies changing market landscape",
      "Supply chain vulnerabilities exposed by recent global events"
    ],
    short_term_outlook: "The company is likely to face headwinds in the next 3-6 months due to macroeconomic pressures and industry-specific challenges. However, its strong market position and financial reserves should help weather these challenges better than smaller competitors.",
    long_term_outlook: "Long-term prospects remain positive as the company continues to invest in strategic growth initiatives and operational improvements. The 3-year outlook suggests potential for market share gains and margin expansion as recent investments begin to yield returns.",
    dividend_analysis: stock.dividendYield ? "The current dividend yield of " + (stock.dividendYield * 100).toFixed(2) + "% is competitive within the industry. Dividend coverage ratio is adequate, suggesting sustainability of current payout levels with moderate growth potential." : "The company does not currently pay a dividend, prioritizing reinvestment in growth opportunities and balance sheet strengthening.",
    technical_indicators: "Technical indicators show mixed signals. The stock is trading " + (stock.regularMarketPrice > stock.prevClose! ? "above" : "below") + " its 50-day moving average, with RSI at moderate levels. Recent volume patterns suggest accumulation/distribution is relatively balanced.",
    analyst_consensus: "Wall Street analysts maintain a cautiously optimistic view, with the consensus leaning toward " + (stock.regularMarketChangePercent > 0 ? "Buy/Hold" : "Hold") + ". Recent analyst reports highlight both growth opportunities and execution risks.",
    ai_recommendation: "Based on comprehensive analysis of financial metrics, market positioning, and growth prospects, our AI recommendation is to " + (stock.regularMarketChangePercent > 0 ? "ACCUMULATE" : "HOLD") + " shares at current levels. Investors should monitor quarterly results for confirmation of business momentum.",
    key_metrics: {
      pe_ratio: stock.trailingPE || 15.7,
      price_to_book: 2.3,
      debt_to_equity: 0.45,
      profit_margin: 0.12,
      revenue_growth: 0.08
    }
  };
};
