-- Update pdf_documents table to make company_name nullable
ALTER TABLE public.pdf_documents ALTER COLUMN company_name DROP NOT NULL;

-- Update existing records to set company_name to NULL where it's empty or 'Unknown Company'
UPDATE public.pdf_documents 
SET company_name = NULL 
WHERE company_name = '' OR company_name = 'Unknown Company';

-- Add a comment to document the change
COMMENT ON COLUMN public.pdf_documents.company_name IS 'Company name (optional) - can be NULL'; 