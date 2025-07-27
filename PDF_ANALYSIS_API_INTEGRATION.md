# PDF Analysis API Integration

This document describes the integration of the PDF Analysis API with the MyWealthWeaver application.

## Overview

The PDF Analysis API integration allows users to:
- List available PDF documents
- Chat with PDF documents using natural language
- Get detailed analysis of PDF content
- View financial metrics, risk factors, and recommendations

## API Endpoints

The integration connects to the PDF Analysis API at `http://127.0.0.1:8000` with the following endpoints:

- `GET /` - Health check
- `GET /pdfs` - List all available PDFs (returns `{pdfs: PDFInfo[], total_count: number}`)
- `GET /pdfs/{pdf_name}` - Get information about a specific PDF
- `POST /pdfs/{pdf_name}/analyze` - Analyze a specific PDF
- `POST /pdfs/{pdf_name}/chat` - Chat with a specific PDF

**Note**: The API expects PDF names without the `.pdf` extension. The integration automatically removes the extension when making API calls.

## Components

### 1. PDFAnalysisApiService (`src/services/pdfAnalysisApiService.ts`)

A service class that handles all API communication with the PDF Analysis API.

**Key Methods:**
- `checkApiHealth()` - Check if the API is available
- `listPDFs()` - Get list of available PDFs
- `getPDFInfo(pdfName)` - Get detailed information about a PDF
- `analyzePDF(pdfName)` - Perform analysis on a PDF
- `chatWithPDF(pdfName, message)` - Send a chat message to a PDF

### 2. ChatInterface (`src/pages/chatinterface.tsx`)

The main chat interface component that provides:
- PDF selection dropdown
- Real-time chat with PDF documents
- PDF analysis results display
- API health status monitoring

**Features:**
- Two-tab interface (Chat and Analysis)
- Real-time message exchange
- PDF analysis with summary, key points, financial metrics
- Error handling and loading states
- Auto-scroll chat messages

### 3. PDFApiTest (`src/components/PDFApiTest.tsx`)

A test component for verifying API connectivity and functionality.

**Features:**
- API health check
- PDF listing test
- Connection status display
- Error reporting

## Navigation

The chat interface is accessible via:
- Desktop navigation: "Chat" link in the main navbar
- Mobile navigation: "Chat" link in the mobile menu
- Direct URL: `/chatinterface`

## Usage

### 1. Accessing the Chat Interface

1. Navigate to the chat interface using the "Chat" link in the navigation
2. The interface will automatically check API connectivity
3. If the API is available, available PDFs will be loaded

### 2. Chatting with PDFs

1. Select a PDF from the dropdown menu
2. Type your message in the chat input
3. Press Enter or click the Send button
4. The AI will respond based on the PDF content

### 3. Analyzing PDFs

1. Select a PDF from the dropdown
2. Click the "Analyze PDF" button
3. Switch to the "Analysis" tab to view results
4. View summary, key points, financial metrics, risk factors, and recommendations

### 4. Testing API Connection

Use the PDF API Test component (displayed on the chat interface) to:
- Test API connectivity
- Verify PDF listing functionality
- Check for connection issues

## Error Handling

The integration includes comprehensive error handling:

- **API Connection Errors**: Displayed as alerts with retry options
- **PDF Loading Errors**: Graceful fallback to empty state
- **Chat Errors**: Error messages in chat with retry suggestions
- **Analysis Errors**: Clear error messages with retry buttons

## Data Types

### PDFInfo
```typescript
interface PDFInfo {
  name: string;
  size: number;
  created_at: string | null;
  url: string;
  content: string | null;
}

interface PDFListResponse {
  pdfs: PDFInfo[];
  total_count: number;
}
```

### PDFAnalysis
```typescript
interface PDFAnalysis {
  summary: string;
  key_points: string[];
  financial_metrics?: Record<string, any>;
  risk_factors?: string[];
  recommendations?: string[];
}
```

### ChatMessage
```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### ChatResponse
```typescript
interface ChatResponse {
  message: string;
  context?: string;
  sources?: string[];
}
```

## Setup Requirements

1. **API Server**: Ensure the PDF Analysis API is running on `http://127.0.0.1:8000`
2. **CORS**: The API should allow CORS requests from the frontend
3. **PDF Documents**: Upload PDF documents to the API server
4. **Network Access**: Ensure the frontend can reach the API endpoint

## Troubleshooting

### Common Issues

1. **"PDF Analysis API is not available"**
   - Check if the API server is running
   - Verify the API endpoint URL
   - Check network connectivity

2. **"No PDFs available"**
   - Ensure PDFs are uploaded to the API server
   - Check API permissions
   - Verify the `/pdfs` endpoint returns data

3. **Chat not working**
   - Verify the selected PDF exists
   - Check API response format
   - Ensure the chat endpoint is working

4. **Analysis not working**
   - Verify the PDF is analyzable
   - Check API response format
   - Ensure the analyze endpoint is working

### Debug Steps

1. Use the PDF API Test component to verify connectivity
2. Check browser developer tools for network errors
3. Verify API server logs for errors
4. Test API endpoints directly using curl or Postman

## Future Enhancements

Potential improvements for the integration:

1. **File Upload**: Add ability to upload PDFs directly from the interface
2. **Chat History**: Persist chat conversations
3. **Multiple PDF Support**: Chat with multiple PDFs simultaneously
4. **Export Features**: Export analysis results
5. **Advanced Filtering**: Filter PDFs by type, date, or content
6. **Real-time Updates**: WebSocket support for real-time chat
7. **Voice Input**: Add voice-to-text for chat messages
8. **Mobile Optimization**: Improve mobile experience

## Security Considerations

1. **API Authentication**: Consider adding authentication to the API
2. **Input Validation**: Validate all user inputs
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Data Privacy**: Ensure PDF content is handled securely
5. **CORS Configuration**: Properly configure CORS for production

## Performance Optimization

1. **Caching**: Cache PDF lists and analysis results
2. **Lazy Loading**: Load PDFs on demand
3. **Pagination**: Implement pagination for large PDF lists
4. **Debouncing**: Debounce chat input to reduce API calls
5. **Error Boundaries**: Add React error boundaries for better error handling 