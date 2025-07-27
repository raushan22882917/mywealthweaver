export interface PDFInfo {
  name: string;
  size: number;
  created_at: string | null;
  url: string;
  content?: string | null;
}

export interface PDFListResponse {
  pdfs: PDFInfo[];
  total_count: number;
}

export interface PDFAnalysis {
  pdf_name: string;
  analysis: string;
  content_length: number;
  analyzed_at: string;
  summary?: string;
  key_points?: string[];
  financial_metrics?: Record<string, any>;
  risk_factors?: string[];
  recommendations?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  pdf_name?: string;
}

export interface ChatResponse {
  response: string;
  pdf_name: string;
  timestamp: string;
  message?: string; // For backward compatibility
}

export interface ApiHealthResponse {
  status: string;
  timestamp: string;
}

export interface ApiInfoResponse {
  message: string;
  version: string;
  endpoints: Record<string, string>;
}

export class PDFAnalysisApiService {
  private static baseUrl = 'http://127.0.0.1:8000';

  // Get API information
  static async getApiInfo(): Promise<ApiInfoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting API info:', error);
      throw error;
    }
  }

  // Check API health
  static async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        return false;
      }
      const healthData: ApiHealthResponse = await response.json();
      return healthData.status === 'healthy';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // List all available PDFs
  static async listPDFs(): Promise<PDFInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/pdfs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PDFListResponse = await response.json();
      return data.pdfs || [];
    } catch (error) {
      console.error('Error listing PDFs:', error);
      throw error;
    }
  }

  // Get information about a specific PDF
  static async getPDFInfo(pdfName: string): Promise<PDFInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/pdfs/${encodeURIComponent(pdfName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting PDF info:', error);
      throw error;
    }
  }

  // Analyze a specific PDF
  static async analyzePDF(pdfName: string): Promise<PDFAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/pdfs/${encodeURIComponent(pdfName)}/analyze`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the response to match our interface
      return {
        pdf_name: data.pdf_name,
        analysis: data.analysis,
        content_length: data.content_length,
        analyzed_at: data.analyzed_at,
        summary: data.analysis, // Use analysis as summary for backward compatibility
        key_points: data.key_points || [],
        financial_metrics: data.financial_metrics || {},
        risk_factors: data.risk_factors || [],
        recommendations: data.recommendations || []
      };
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      throw error;
    }
  }

  // Chat with a specific PDF (using the simplified endpoint)
  static async chatWithPDF(pdfName: string, message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pdfs/${encodeURIComponent(pdfName)}/chat-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the response to match our interface
      return {
        response: data.response,
        pdf_name: data.pdf_name,
        timestamp: data.timestamp,
        message: data.response // For backward compatibility
      };
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      throw error;
    }
  }

  // Chat with a specific PDF (using the standard endpoint)
  static async chatWithPDFStandard(pdfName: string, message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pdfs/${encodeURIComponent(pdfName)}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          pdf_name: pdfName
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the response to match our interface
      return {
        response: data.response,
        pdf_name: data.pdf_name,
        timestamp: data.timestamp,
        message: data.response // For backward compatibility
      };
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      throw error;
    }
  }
} 