// Test script for GROQ API
const apiKey = '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';

async function testGroqApi() {
  try {
    console.log('Testing GROQ API...');
    
    const prompt = `
      You are a professional stock analyst with expertise in financial analysis and investment recommendations.
      
      Please provide a brief analysis of Apple Inc. (AAPL) in the Technology sector, currently trading at $170.
      
      Format your response as a structured JSON object with the following fields:
      {
        "financial_health": "brief assessment",
        "recommendation": "Buy/Hold/Sell with brief explanation",
        "confidence_score": number between 1-10
      }
    `;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a professional stock analyst with expertise in financial analysis and investment recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GROQ API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('GROQ API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    const analysisText = data.choices[0]?.message?.content;
    console.log('\nAnalysis Content:');
    console.log(analysisText);
    
  } catch (error) {
    console.error('Error testing GROQ API:', error);
  }
}

// Run the test
testGroqApi();
