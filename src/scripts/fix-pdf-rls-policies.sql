-- Fix RLS policies for pdf_documents table
-- This script updates the policies to properly handle authenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read pdf_documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Allow authenticated users to insert pdf_documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Allow authenticated users to update pdf_documents" ON public.pdf_documents;
DROP POLICY IF EXISTS "Allow authenticated users to delete pdf_documents" ON public.pdf_documents;

-- Create new policies that properly check for authenticated users
-- Read policy: Allow authenticated users to read all PDF documents
CREATE POLICY "Allow authenticated users to read pdf_documents" ON public.pdf_documents
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert policy: Allow authenticated users to insert PDF documents
CREATE POLICY "Allow authenticated users to insert pdf_documents" ON public.pdf_documents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update policy: Allow authenticated users to update PDF documents
CREATE POLICY "Allow authenticated users to update pdf_documents" ON public.pdf_documents
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Delete policy: Allow authenticated users to delete PDF documents
CREATE POLICY "Allow authenticated users to delete pdf_documents" ON public.pdf_documents
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Alternative: If you want to restrict users to only their own documents, use this instead:
-- (Uncomment the lines below and comment out the above policies if you want user-specific access)

/*
-- Read policy: Allow users to read only their own PDF documents
CREATE POLICY "Users can read their own pdf_documents" ON public.pdf_documents
    FOR SELECT USING (auth.uid() = user_id);

-- Insert policy: Allow users to insert PDF documents with their user_id
CREATE POLICY "Users can insert their own pdf_documents" ON public.pdf_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policy: Allow users to update only their own PDF documents
CREATE POLICY "Users can update their own pdf_documents" ON public.pdf_documents
    FOR UPDATE USING (auth.uid() = user_id);

-- Delete policy: Allow users to delete only their own PDF documents
CREATE POLICY "Users can delete their own pdf_documents" ON public.pdf_documents
    FOR DELETE USING (auth.uid() = user_id);
*/

-- Note: If you want user-specific access, you'll need to add a user_id column to the pdf_documents table:
-- ALTER TABLE public.pdf_documents ADD COLUMN user_id UUID REFERENCES auth.users(id); 