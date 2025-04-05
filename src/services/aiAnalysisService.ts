
import { StockAnalysis } from "@/utils/types";
import { supabase } from "@/integrations/supabase/client";

// For demo purposes, we'll create some sample analysis data
const SAMPLE_ANALYSES: Record<string, StockAnalysis> = {
  "AAPL": {
    symbol: "AAPL",
    analysis_text: "Apple continues to show strong revenue growth with its services segment becoming an increasingly important contributor. The company has a robust balance sheet with significant cash reserves, allowing for continued investment in R&D and strategic acquisitions. Recent product launches have been well-received, though there are concerns about market saturation in the smartphone segment. Apple's dividend yield remains modest, but the company has consistently increased its dividend payout over the past years, making it attractive for dividend growth investors.",
    analysis_date: new Date().toISOString(),
    sentiment: "positive",
    strength: "Strong balance sheet, growing services revenue, brand loyalty",
    weakness: "Smartphone market saturation, regulatory scrutiny",
    opportunity: "Expansion into healthcare and AR/VR markets",
    threat: "Increasing competition in services, supply chain disruptions",
    price_target: 225.50,
    recommendation: "Buy",
  },
  "MSFT": {
    symbol: "MSFT",
    analysis_text: "Microsoft continues to deliver strong performance across its various business segments. The cloud segment, particularly Azure, shows robust growth, competing effectively with AWS. Microsoft's subscription-based model for Office and other software provides steady, recurring revenue. The company has a solid dividend history with regular increases. While valuation is somewhat elevated, Microsoft's diverse revenue streams and strong positioning in enterprise software justify a premium. The dividend yield is modest but sustainable with room for future growth.",
    analysis_date: new Date().toISOString(),
    sentiment: "positive",
    strength: "Strong cloud growth, recurring revenue model, enterprise relationships",
    weakness: "High valuation, slowing PC market",
    opportunity: "AI integration, expanding cloud services",
    threat: "Cloud competition, potential regulatory actions",
    price_target: 430.75,
    recommendation: "Buy",
  },
  "GT": {
    symbol: "GT",
    analysis_text: "Goodyear Tire is facing challenges in a competitive tire market with pressure from rising raw material costs and shifting consumer preferences. The company has struggled with debt management but has implemented restructuring efforts to improve operational efficiency. The dividend has been inconsistent historically, reflecting the cyclical nature of the automotive industry. Recent quarters have shown some improvement in operational metrics, but challenges remain. The current valuation reflects these uncertainties, potentially offering value for contrarian investors willing to accept the risks.",
    analysis_date: new Date().toISOString(),
    sentiment: "neutral",
    strength: "Strong brand recognition, global manufacturing footprint",
    weakness: "High debt levels, margin pressure from raw materials",
    opportunity: "Electric vehicle tire market, operational efficiency improvements",
    threat: "Rising material costs, changing automotive landscape",
    price_target: 11.25,
    recommendation: "Hold",
  }
};

export async function analyzeStockWithAI(symbol: string, companyData: any): Promise<StockAnalysis> {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      console.error("Groq API key is missing");
      return getFallbackAnalysis(symbol);
    }
    
    const prompt = `
      Analyze the following stock and provide insights, particularly focusing on dividend potential and investment outlook:
      
      Symbol: ${symbol}
      Company Name: ${companyData?.company_name || companyData?.shortName || ''}
      Industry: ${companyData?.industry || ''}
      Sector: ${companyData?.sector || ''}
      Current Price: $${companyData?.price || companyData?.previousClose || 0}
      Dividend Yield: ${companyData?.dividend_yield || companyData?.dividendYield || 0}%
      P/E Ratio: ${companyData?.trailingPE || 0}
      
      Respond with a structured analysis with these sections:
      1. Overall assessment (3-4 sentences)
      2. SWOT analysis (brief bullet points for Strengths, Weaknesses, Opportunities, Threats)
      3. Dividend outlook
      4. Price target
      5. Recommendation (Buy/Hold/Sell)
      
      Format your response as JSON with these fields:
      {
        "analysis_text": "overall analysis here",
        "sentiment": "positive/neutral/negative", 
        "strength": "key strengths",
        "weakness": "key weaknesses",
        "opportunity": "key opportunities",
        "threat": "key threats", 
        "price_target": number,
        "recommendation": "Buy/Hold/Sell"
      }
    `;
    
    // Call the Groq API
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: "You are a professional stock analyst specializing in dividend stocks. Provide concise, insightful analysis."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Groq API response:", result);
      
      let analysisResult: StockAnalysis;
      
      try {
        const content = result.choices[0]?.message?.content;
        // Try to parse as JSON, handling cases where it might be wrapped in markdown code blocks
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const parsedAnalysis = JSON.parse(cleanedContent);
        
        analysisResult = {
          symbol,
          analysis_text: parsedAnalysis.analysis_text,
          analysis_date: new Date().toISOString(),
          sentiment: parsedAnalysis.sentiment,
          strength: parsedAnalysis.strength,
          weakness: parsedAnalysis.weakness,
          opportunity: parsedAnalysis.opportunity,
          threat: parsedAnalysis.threat,
          price_target: parseFloat(parsedAnalysis.price_target),
          recommendation: parsedAnalysis.recommendation
        };
      } catch (parseError) {
        console.error("Error parsing Groq API response:", parseError);
        return getFallbackAnalysis(symbol);
      }
      
      // Save to database
      await saveAnalysisToDatabase(analysisResult);
      
      return analysisResult;
    } catch (apiError) {
      console.error("Error calling Groq API:", apiError);
      return getFallbackAnalysis(symbol);
    }
  } catch (error) {
    console.error("Error in analyzeStockWithAI:", error);
    return getFallbackAnalysis(symbol);
  }
}

function getFallbackAnalysis(symbol: string): StockAnalysis {
  // Return pre-defined sample analysis if available, or a generic one
  return SAMPLE_ANALYSES[symbol] || {
    symbol,
    analysis_text: "This is a placeholder analysis. The AI-powered analysis is currently unavailable. Please try again later.",
    analysis_date: new Date().toISOString(),
    sentiment: "neutral",
    strength: "Unable to determine",
    weakness: "Unable to determine",
    opportunity: "Unable to determine",
    threat: "Unable to determine",
    price_target: 0,
    recommendation: "Hold",
  };
}

export async function saveAnalysisToDatabase(analysis: StockAnalysis): Promise<void> {
  try {
    const { error } = await supabase
      .from('stock_analysis')
      .upsert({
        symbol: analysis.symbol,
        analysis_text: analysis.analysis_text,
        analysis_date: analysis.analysis_date,
        sentiment: analysis.sentiment,
        strength: analysis.strength,
        weakness: analysis.weakness,
        opportunity: analysis.opportunity,
        threat: analysis.threat,
        price_target: analysis.price_target,
        recommendation: analysis.recommendation,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
    console.log("Analysis saved to database successfully");
  } catch (error) {
    console.error("Error saving analysis to database:", error);
  }
}

export async function getStockAnalysisFromDB(symbol: string): Promise<StockAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('stock_analysis')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log("No analysis found for symbol:", symbol);
        return null;
      }
      throw error;
    }
    
    return data as StockAnalysis;
  } catch (error) {
    console.error("Error fetching analysis from database:", error);
    return null;
  }
}
