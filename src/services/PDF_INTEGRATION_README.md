# PDF Analysis API Frontend Integration

This document describes how the frontend React application integrates with the PDF Analysis API.

## Overview

The frontend provides a comprehensive interface for:
- 📄 Listing and selecting PDFs from the Supabase bucket
- 🔍 Analyzing PDF content with AI-powered insights
- 💬 Chatting with PDFs using natural language
- 📊 Viewing detailed analysis results
- 🔧 Testing API connectivity and health

## Components

### 1. ChatInterface (`src/pages/chatinterface.tsx`)
The main interface for interacting with PDFs. Features include:

- **PDF Selection Panel**: Lists all available PDFs with file information
- **Chat Interface**: Real-time conversation with selected PDF
- **Analysis View**: Detailed AI analysis of PDF content
- **API Health Monitoring**: Real-time status of API connectivity

### 2. PDFApiTest (`src/components/PDFApiTest.tsx`)
A testing component that:
- Tests API connectivity
- Displays API version and information
- Shows available PDFs
- Provides quick health status

### 3. PDFAnalysisApiService (`src/services/pdfAnalysisApiService.ts`)
The service layer that handles all API communication:

```typescript
// Key methods:
- getApiInfo(): Promise<ApiInfoResponse>
- checkApiHealth(): Promise<boolean>
- listPDFs(): Promise<PDFInfo[]>
- getPDFInfo(pdfName: string): Promise<PDFInfo>
- analyzePDF(pdfName: string): Promise<PDFAnalysis>
- chatWithPDF(pdfName: string, message: string): Promise<ChatResponse>
- chatWithPDFStandard(pdfName: string, message: string): Promise<ChatResponse>
```

## API Endpoints Used

The frontend integrates with the following API endpoints:

1. **GET** `/` - Get API information
2. **GET** `/health` - Check API health
3. **GET** `/pdfs` - List all PDFs
4. **GET** `/pdfs/{pdf_name}` - Get PDF information
5. **GET** `/pdfs/{pdf_name}/analyze` - Analyze PDF content
6. **POST** `/pdfs/{pdf_name}/chat-simple` - Chat with PDF (simplified)
7. **POST** `/pdfs/{pdf_name}/chat` - Chat with PDF (standard)

## Features

### PDF Management
- Automatic loading of available PDFs
- File size and creation date display
- Direct PDF viewing via Supabase URLs
- Refresh functionality

### Chat Interface
- Real-time messaging with PDFs
- Message history with timestamps
- Loading states and error handling
- Auto-scroll to latest messages
- Keyboard shortcuts (Enter to send)

### Analysis Display
- Comprehensive PDF analysis
- Key points extraction
- Financial metrics display
- Risk factors identification
- AI-generated recommendations
- Analysis metadata (content length, timestamp)

### Error Handling
- API connectivity monitoring
- Graceful error display
- Retry mechanisms
- User-friendly error messages

## Usage

### Starting the Application
1. Ensure the PDF Analysis API is running on `http://127.0.0.1:8000`
2. Start the React development server
3. Navigate to the chat interface

### Basic Workflow
1. **Select a PDF**: Choose from the available PDFs in the left panel
2. **Chat**: Send messages to interact with the PDF content
3. **Analyze**: Click "Analyze PDF" to get comprehensive analysis
4. **View Results**: Switch between chat and analysis tabs

### API Testing
Use the PDFApiTest component to:
- Verify API connectivity
- Check available PDFs
- Monitor API health status

## Configuration

### API Base URL
The API base URL is configured in `PDFAnalysisApiService`:
```typescript
private static baseUrl = 'http://127.0.0.1:8000';
```

### Environment Variables
No additional environment variables are required for the frontend. The API credentials are handled server-side.

## Error Handling

The application handles various error scenarios:

1. **API Unavailable**: Shows health status and error messages
2. **PDF Not Found**: Displays appropriate error messages
3. **Network Errors**: Graceful degradation with retry options
4. **Invalid Responses**: Fallback to default states

## Future Enhancements

Potential improvements for the frontend:

1. **File Upload**: Direct PDF upload to Supabase bucket
2. **Chat History**: Persistent chat sessions
3. **Export Features**: Export analysis results
4. **Advanced Filtering**: Filter PDFs by type, date, etc.
5. **Real-time Updates**: WebSocket integration for live updates
6. **Offline Support**: Service worker for offline functionality

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure the PDF Analysis API is running
   - Check the base URL configuration
   - Verify network connectivity

2. **No PDFs Displayed**
   - Check if PDFs exist in the Supabase bucket
   - Verify bucket permissions
   - Check API response format

3. **Chat Not Working**
   - Ensure OpenAI API key is configured on the backend
   - Check API endpoint responses
   - Verify PDF name encoding

### Debug Information
The application provides debug information through:
- Browser console logs
- API health status display
- Error messages in the UI
- Network tab for API requests 