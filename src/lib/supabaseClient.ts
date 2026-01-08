import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

// Usamos las llaves proporcionadas directamente para asegurar que funcione en Vercel
// Estas son llaves PÚBLICAS (anon), por lo que es seguro tenerlas en el código del cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uralmzgniwcafidyqtiu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYWxtemduaXdjYWZpZHlxdGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NzMyMzksImV4cCI6MjA4MjM0OTIzOX0.uLjqwuSZuyAm5KpgZPG1xX_RltO0dUJh5nxn7pH7bC0'

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
