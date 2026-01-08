import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

// Estas variables se inyectan en tiempo de compilación por Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

if (supabaseUrl === 'https://placeholder.supabase.co' && typeof window !== 'undefined') {
  console.warn('⚠️ Advertencia: Usando configuración de Supabase de respaldo. Verifica las variables de entorno en Vercel.')
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
