import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiChatResponse {
  response: string;
  timestamp: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    // Use provided API key or environment variable
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!key) {
      throw new Error('Gemini API key is required. Please set VITE_GEMINI_API_KEY environment variable.');
    }

    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Send a message to Gemini with PDF context
   */
  async chatWithPDF(pdfContent: string, userMessage: string, chatHistory: GeminiChatMessage[] = []): Promise<GeminiChatResponse> {
    try {
      // Create context prompt with PDF content
      const contextPrompt = `You are an AI assistant helping users analyze and understand PDF documents. 

PDF Content:
${pdfContent}

Based on the PDF content above, please answer the following question accurately and helpfully. If the question cannot be answered from the PDF content, please say so clearly.

User Question: ${userMessage}`;

      // Start a chat session with history
      const chat = this.model.startChat({
        history: chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }]
        }))
      });

      // Send the message
      const result = await chat.sendMessage(contextPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        response: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error chatting with Gemini:', error);
      throw new Error(`Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze PDF content using Gemini
   */
  async analyzePDF(pdfContent: string): Promise<{
    analysis: string;
    summary: string;
    keyPoints: string[];
    recommendations: string[];
  }> {
    try {
      const analysisPrompt = `Please analyze the following PDF content and provide:
1. A comprehensive analysis
2. A concise summary
3. Key points (as a list)
4. Recommendations based on the content

PDF Content:
${pdfContent}

Please format your response as JSON with the following structure:
{
  "analysis": "detailed analysis here",
  "summary": "concise summary here", 
  "keyPoints": ["point 1", "point 2", "point 3"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Try to parse as JSON
        const parsed = JSON.parse(text);
        return {
          analysis: parsed.analysis || text,
          summary: parsed.summary || text.substring(0, 200) + '...',
          keyPoints: parsed.keyPoints || [],
          recommendations: parsed.recommendations || []
        };
      } catch (parseError) {
        // If JSON parsing fails, return the raw text
        return {
          analysis: text,
          summary: text.substring(0, 200) + '...',
          keyPoints: [],
          recommendations: []
        };
      }
    } catch (error) {
      console.error('Error analyzing PDF with Gemini:', error);
      throw new Error(`Failed to analyze PDF with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simple chat without PDF context
   */
  async simpleChat(message: string): Promise<GeminiChatResponse> {
    try {
      const result = await this.model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      return {
        response: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error with simple chat:', error);
      throw new Error(`Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}