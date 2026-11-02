import { createClient } from '@supabase/supabase-js'

// Uses the secret key. Only import this in server files (like API routes), never in browser code.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)