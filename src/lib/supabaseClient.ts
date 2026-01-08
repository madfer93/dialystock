import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

// Usamos valores de marcador (placeholders) válidos sintácticamente 
// para que el proceso de "build" de Vercel no truene si las variables 
// no están presentes en ese microsegundo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
