
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// In development, use environment variables from .env.local
const supabaseUrl = "https://imrrxaziqfppoiubayrs.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcnJ4YXppcWZwcG9pdWJheXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NzEzNTQsImV4cCI6MjA1ODQ0NzM1NH0.hgpp54SWTMNSdMDC5_DE1Sl_tmxE_BAfcYxkIHrp3lg"

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
