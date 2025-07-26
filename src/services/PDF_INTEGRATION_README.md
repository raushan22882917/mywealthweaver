# PDF Integration with Supabase

This document describes the PDF storage and retrieval system integrated into the chat interface.

## Overview

The PDF integration allows users to:
- Upload PDF documents to Supabase storage
- Search for PDFs by stock symbol
- Preview PDFs directly in the chat interface
- Chat with AI about the content of PDF documents

## Setup Instructions

### 1. Database Setup

Run the following SQL script in your Supabase dashboard to create the required table:

```sql
-- Run the contents of src/scripts/create-pdf-table.sql
```

This will create:
- `pdf_documents` table with proper indexes
- Row Level Security (RLS) policies
- Sample data for testing

### 2. Storage Bucket Setup

The system automatically creates a storage bucket called `pdf-documents` with the following configuration:
- Private bucket (not public)
- PDF files only (MIME type restriction)
- 50MB file size limit
- Organized by symbol folders

### 3. Environment Variables

Ensure your Supabase credentials are properly configured in `src/lib/supabase/client.ts`.

## Features

### PDF Upload
- Users can upload PDF files through the chat interface
- Files are automatically organized by stock symbol
- Metadata is stored in the database for easy retrieval
- Progress indicators show upload status

### PDF Search
- Search by stock symbol (e.g., "AAPL", "MSFT")
- Results show document type, file size, and upload date
- Click to preview documents in the interface

### PDF Preview
- Inline PDF preview using iframe
- External link to open in new tab
- Document metadata display
- Easy navigation between documents

### AI Integration
- When users mention stock symbols in chat, the system automatically searches for related PDFs
- AI responses reference found documents
- Users can ask questions about PDF content

## File Structure

```
src/
├── services/
│   ├── pdfService.ts          # Main PDF service class
│   └── PDF_INTEGRATION_README.md
├── scripts/
│   ├── create-pdf-table.sql   # Database setup script
│   └── setup-pdf-storage.ts   # Storage initialization
├── lib/supabase/
│   ├── client.ts              # Supabase client
│   └── types.ts               # TypeScript types (updated)
└── pages/
    └── chatinterface.tsx      # Updated chat interface
```

## Usage Examples

### Searching for PDFs
1. Type a stock symbol in the chat (e.g., "AAPL")
2. The system automatically searches for related PDFs
3. Results appear in the PDF Preview tab
4. Click on a document to preview it

### Uploading PDFs
1. Go to the PDF Preview tab
2. Click "Choose File" to select a PDF
3. Enter the stock symbol and company name when prompted
4. Click "Upload to Supabase"
5. The file will be stored and available for future searches

### Chatting with PDF Content
1. Search for or upload a PDF
2. Ask questions about the document content
3. The AI will reference the PDF in its responses

## API Reference

### PDFService Class

#### Methods

- `initializeBucket()`: Creates the storage bucket if it doesn't exist
- `uploadPDF(file, symbol, companyName, documentType)`: Uploads a PDF file
- `searchPDFsBySymbol(symbol)`: Searches for PDFs by stock symbol
- `getPDFById(id)`: Retrieves a specific PDF by ID
- `getPDFDownloadURL(filePath)`: Gets a signed download URL
- `getPDFPublicURL(filePath)`: Gets a public preview URL
- `deletePDF(id)`: Deletes a PDF from storage and database
- `getAllPDFs()`: Retrieves all PDF documents

## Security Considerations

- Row Level Security (RLS) is enabled on the pdf_documents table
- Storage bucket is private by default
- File type restrictions prevent non-PDF uploads
- File size limits prevent abuse

## Troubleshooting

### Common Issues

1. **Bucket not found**: Run the setup script to initialize the bucket
2. **Table not found**: Execute the SQL script in Supabase dashboard
3. **Upload fails**: Check file size and type restrictions
4. **Preview not working**: Ensure the PDF URL is accessible

### Debug Mode

Enable console logging to debug issues:
```typescript
// In pdfService.ts, uncomment console.log statements
```

## Future Enhancements

- PDF text extraction for better AI analysis
- Document versioning
- Advanced search filters
- Bulk upload functionality
- Document sharing and collaboration 