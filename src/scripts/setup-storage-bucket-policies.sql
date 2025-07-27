-- Setup Storage Bucket Policies for PDF Storage
-- This script configures the necessary policies for the pdfdocument storage bucket

-- First, let's create the bucket if it doesn't exist
-- Note: This should be done through the Supabase dashboard or CLI
-- The bucket should be named 'pdfdocument' and be private

-- Enable RLS on storage.objects (this is usually enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for the pdfdocument bucket if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update PDFs" ON storage.objects;

-- Create policy to allow authenticated users to upload files to the pdfdocument bucket
CREATE POLICY "Allow authenticated users to upload PDFs" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
        AND (storage.extension(name)) = ANY (ARRAY['pdf'])
    );

-- Create policy to allow authenticated users to view files in the pdfdocument bucket
CREATE POLICY "Allow authenticated users to view PDFs" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
    );

-- Create policy to allow authenticated users to update files in the pdfdocument bucket
CREATE POLICY "Allow authenticated users to update PDFs" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
    );

-- Create policy to allow authenticated users to delete files in the pdfdocument bucket
CREATE POLICY "Allow authenticated users to delete PDFs" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid() IS NOT NULL
    );

-- Optional: If you want to restrict users to only their own files, use these policies instead:
-- (Uncomment and comment out the above policies if you want user-specific access)

/*
-- Create policy to allow users to upload their own files
CREATE POLICY "Users can upload their own PDFs" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'pdfdocument' 
        AND auth.uid()::text = (storage.foldername(name))[1]
        AND (storage.extension(name)) = ANY (ARRAY['pdf'])
    );

-- Create policy to allow users to view their own files
CREATE POLICY "Users can view their own PDFs" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own PDFs" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own PDFs" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'pdfdocument' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
*/

-- Note: The bucket creation itself should be done through the Supabase dashboard
-- or using the Supabase CLI with the following configuration:
-- - Bucket name: pdfdocument
-- - Public: false (private bucket)
-- - Allowed MIME types: application/pdf
-- - File size limit: 52428800 (50MB) 