# Gemini AI Integration Setup

This application now uses Google's Gemini AI for PDF chat functionality instead of OpenAI.

## Setup Instructions

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the API key

2. **Configure Environment Variables**
   - Create a `.env.local` file in the project root
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## Features

- **PDF Chat**: Chat with your PDF documents using Gemini 1.5 Flash
- **Context Awareness**: Gemini maintains conversation context with your PDFs
- **Error Handling**: Graceful error handling with helpful messages
- **Chat History**: Maintains conversation history for better context

## API Usage

The chat interface now uses:
- `GeminiService` for AI interactions
- `PDFAnalysisApiService.chatWithPDFGemini()` for PDF-aware conversations
- Gemini 1.5 Flash model for fast, accurate responses

## Troubleshooting

- **"Gemini API key is required" error**: Make sure you've set `VITE_GEMINI_API_KEY` in your `.env.local` file
- **API errors**: Check that your API key is valid and has sufficient quota
- **PDF content errors**: Ensure your PDF analysis API is running and accessible