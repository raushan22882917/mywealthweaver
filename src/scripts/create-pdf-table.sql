-- Create pdf_documents table
CREATE TABLE IF NOT EXISTS public.pdf_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    document_type VARCHAR(100) DEFAULT 'financial_report',
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on symbol for faster searches
CREATE INDEX IF NOT EXISTS idx_pdf_documents_symbol ON public.pdf_documents(symbol);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_pdf_documents_created_at ON public.pdf_documents(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all PDF documents
CREATE POLICY "Allow authenticated users to read pdf_documents" ON public.pdf_documents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert PDF documents
CREATE POLICY "Allow authenticated users to insert pdf_documents" ON public.pdf_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update their own PDF documents
CREATE POLICY "Allow authenticated users to update pdf_documents" ON public.pdf_documents
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete their own PDF documents
CREATE POLICY "Allow authenticated users to delete pdf_documents" ON public.pdf_documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add some sample data for testing
INSERT INTO public.pdf_documents (symbol, company_name, file_path, file_name, file_size, document_type) VALUES
('AAPL', 'Apple Inc.', 'AAPL/apple_earnings_q4_2024.pdf', 'Apple Q4 2024 Earnings Report.pdf', 2048576, 'earnings_report'),
('MSFT', 'Microsoft Corporation', 'MSFT/microsoft_annual_report_2024.pdf', 'Microsoft Annual Report 2024.pdf', 5120000, 'annual_report'),
('GOOGL', 'Alphabet Inc.', 'GOOGL/google_quarterly_report_q3_2024.pdf', 'Google Q3 2024 Quarterly Report.pdf', 3072000, 'quarterly_report'),
('TSLA', 'Tesla Inc.', 'TSLA/tesla_financial_statement_2024.pdf', 'Tesla Financial Statement 2024.pdf', 4096000, 'financial_statement'),
('AMZN', 'Amazon.com Inc.', 'AMZN/amazon_earnings_q2_2024.pdf', 'Amazon Q2 2024 Earnings Report.pdf', 2560000, 'earnings_report')
ON CONFLICT (id) DO NOTHING; 