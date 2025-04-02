
-- Create a table to store stock subscriptions with toggle preference
CREATE TABLE IF NOT EXISTS stock_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stock_symbol TEXT NOT NULL,
  is_subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

-- Add RLS policies
ALTER TABLE stock_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON stock_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own subscriptions
CREATE POLICY "Users can create their own subscriptions"
  ON stock_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON stock_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions"
  ON stock_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_subscriptions_user_stock
  ON stock_subscriptions(user_id, stock_symbol);
