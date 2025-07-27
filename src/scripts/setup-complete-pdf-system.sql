-- Complete PDF System Setup Script
-- This script sets up all necessary database tables and policies for the PDF upload system

-- Step 1: Create the pdf_documents table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.pdf_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(255),
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    document_type VARCHAR(100) DEFAULT 'financial_report',
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security on the pdf_documents table
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies for pdf_documents (if they exist)
DROP POLICY IF EXISTS "Allow authenticated users to insert pdf_documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Allow authenticated users to select pdf_documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Allow authenticated users to update pdf_documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Allow authenticated users to delete pdf_documents" ON public.pdf_documents;

-- Step 4: Create correct RLS policies for pdf_documents table
-- Note: Using auth.uid() IS NOT NULL instead of auth.role() = 'authenticated'

-- Allow authenticated users to insert PDF documents
CREATE POLICY "Allow authenticated users to insert pdf_documents" ON public.pdf_documents
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to view PDF documents
CREATE POLICY "Allow authenticated users to select pdf_documents" ON public.pdf_documents
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to update PDF documents
CREATE POLICY "Allow authenticated users to update pdf_documents" ON public.pdf_documents
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete PDF documents
CREATE POLICY "Allow authenticated users to delete pdf_documents" ON public.pdf_documents
    FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Step 5: Drop existing policies for storage.objects (if they exist)
DROP POLICY IF EXISTS "Allow authenticated users to upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update PDFs" ON storage.objects;

-- Step 6: Create RLS policies for storage.objects (pdfdocument bucket)
-- These policies allow authenticated users to perform file operations within the pdfdocument bucket

-- Allow authenticated users to upload files to the pdfdocument bucket
CREATE POLICY "Allow authenticated users to upload PDFs" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
        AND (storage.extension(name)) = ANY (ARRAY['pdf'])
    );

-- Allow authenticated users to view files in the pdfdocument bucket
CREATE POLICY "Allow authenticated users to view PDFs" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
    );

-- Allow authenticated users to update files in the pdfdocument bucket
CREATE POLICY "Allow authenticated users to update PDFs" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
    );

-- Allow authenticated users to delete files from the pdfdocument bucket
CREATE POLICY "Allow authenticated users to delete PDFs" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
    );

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdf_documents_symbol ON public.pdf_documents(symbol);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_upload_date ON public.pdf_documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_document_type ON public.pdf_documents(document_type);

-- IMPORTANT: Manual Step Required
-- After running this script, you MUST manually create the storage bucket in the Supabase dashboard:
--
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Storage > Buckets
-- 3. Click "Create a new bucket"
-- 4. Set the bucket name to: pdfdocument
-- 5. Make sure it's set to private (not public)
-- 6. Set allowed MIME types to: application/pdf
-- 7. Set file size limit to: 52428800 (50MB)
-- 8. Click "Create bucket"
--
-- The client-side application cannot create storage buckets due to permission restrictions.
-- The bucket must be created manually or through a backend service with administrative privileges.

-- Verification queries (run these after setup to verify everything is working):
-- SELECT * FROM public.pdf_documents LIMIT 1;
-- SELECT * FROM storage.objects WHERE bucket_id = 'pdfdocument' LIMIT 1; 