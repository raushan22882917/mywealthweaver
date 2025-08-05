-- Add as_of_date column to similar_companies table
ALTER TABLE public.similar_companies 
ADD COLUMN as_of_date TEXT NULL;

-- Add comment to the column for documentation
COMMENT ON COLUMN public.similar_companies.as_of_date IS 'Date when the similar company data was last updated or as of which the data is valid'; 