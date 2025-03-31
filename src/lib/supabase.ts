
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://imrrxaziqfppoiubayrs.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcnJ4YXppcWZwcG9pdWJheXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NzEzNTQsImV4cCI6MjA1ODQ0NzM1NH0.hgpp54SWTMNSdMDC5_DE1Sl_tmxE_BAfcYxkIHrp3lg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
