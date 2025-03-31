
-- Create function to add column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  table_name text,
  column_name text,
  column_type text
)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = add_column_if_not_exists.table_name
      AND column_name = add_column_if_not_exists.column_name
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s',
      table_name,
      column_name,
      column_type
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
