'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Verificar sesión y redirigir según rol
  useEffect(() => {
    const checkSession = async () => {
      console.log('Verificando sesión...')
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.log('No hay sesión activa.')
        return
      }

      console.log('Sesión activa:', session.user.email)

      // 1. Buscar perfil existente
      let { data: profile } = await supabase
        .from('profiles')
        .select('*') // Traer todo para ver si existe pero está vacío
        .eq('id', session.user.id)
        .maybeSingle()

      console.log('Perfil encontrado:', profile)

      // 2. Si no tiene perfil, o su rol es "usuario" (default de supabase a veces), o está vacío
      // Buscamos si tiene alguna invitación (incluso si ya fue marcada como usada, para recuperar el rol perdido)
      if ((!profile || !profile.role || profile.role === 'usuario') && session.user.email) {
        console.log('Buscando invitación (pendiente o recuperable)...')

        // Primero buscar pendientes
        let { data: invitacion } = await supabase
          .from('invitaciones_pendientes')
          .select('*')
          .ilike('email', session.user.email)
          .eq('usado', false)
          .maybeSingle()

        // Si no hay pendiente, buscar alguna usada recientemente para "auto-corregir" el perfil si sigue siendo "usuario"
        if (!invitacion && profile?.role === 'usuario') {
          console.log('Buscando invitación histórica para corregir rol...')
          const { data: invHist } = await supabase
            .from('invitaciones_pendientes')
            .select('*')
            .ilike('email', session.user.email)
            .order('creado_en', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (invHist) invitacion = invHist
        }

        if (invitacion) {
          console.log('Invitación encontrada/recuperada:', invitacion)
          const newRole = invitacion.role
          const newArea = newRole === 'sala_hd' ? 'Sala HD' : 'Clínica'
          let updateError

          if (profile) {
            // Actualizar perfil existente mal configurado
            console.log('Corrigiendo perfil existente...')
            const { error } = await supabase
              .from('profiles')
              .update({
                role: newRole,
                tenant_id: invitacion.tenant_id,
                area: newArea
              })
              .eq('id', session.user.id)
            updateError = error
          } else {
            // ... crear nuevo
            const { error } = await supabase.from('profiles').insert({
              id: session.user.id, email: session.user.email, role: newRole, tenant_id: invitacion.tenant_id, nombre: session.user.user_metadata?.full_name || '', area: newArea
            })
            updateError = error
          }

          if (!updateError && !invitacion.usado) {
            await supabase.from('invitaciones_pendientes').update({ usado: true, usado_en: new Date().toISOString() }).eq('id', invitacion.id)
          }

          // Actualizar local
          profile = { ...profile, role: newRole }
        }
      }

      // 3. Redirección
      // Normalizamos
      const role = (profile?.role?.toLowerCase() || '').replace(/\s+/g, '_')
      console.log('Rol normalizado:', role)

      if (role === 'superadmin_global') {
        router.push('/superadmin')
      } else if (role === 'sala_hd') {
        router.push('/sala-hd')
      } else if (role === 'sala_pd') {
        router.push('/sala-pd')
      } else if (role === 'sala_quimico' || role === 'quimico') {
        router.push('/sala-quimico')
      } else if (role === 'jefe_hd') {
        router.push('/jefe-hd')
      } else if (role === 'jefe_pd') {
        router.push('/jefe-pd')
      } else if (role === 'admin_clinica') {
        router.push('/clinica')
      } else if (role === 'farmacia') {
        router.push('/farmacia')
      } else {
        console.log('Rol no reconocido o sin acceso:', role)
        setMessage(`Rol no autorizado: ${role}`)
      }
    }
    checkSession()
  }, [router])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin, // Mejor que hardcoded localhost
      },
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('¡Magic Link enviado! Revisa tu correo y haz clic en el enlace.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
        {/* Main Card */}
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden group">

          {/* Header/Logo */}
          <div className="text-center mb-12 transform group-hover:scale-105 transition-transform duration-500">
            <div className="inline-flex mb-8">
              <img
                src="/logo-dialystock.png"
                alt="DialyStock Logo"
                className="w-48 h-48 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Dialy<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Stock</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg">Gestión Inteligente de Inventario Médico</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Correo Electrónico</label>
              <div className="relative group/input">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all group-hover/input:border-white/20"
                  placeholder="ejemplo@clinica.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0f172a] rounded-2xl py-4 font-bold text-lg hover:bg-slate-200 transition-all transform active:scale-[0.98] shadow-lg shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#0f172a]/30 border-t-[#0f172a] rounded-full animate-spin"></div>
                  <span>Enviando enlace...</span>
                </>
              ) : (
                <>
                  <span>Ingresar con Magic Link</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </>
              )}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div className={`mt-8 p-4 rounded-2xl text-center font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${message.includes('Error')
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              }`}>
              {message}
            </div>
          )}

          {/* Support Integration */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">¿Necesitas ayuda con el acceso?</p>
            <a
              href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, necesito ayuda para ingresar al sistema DialyStock.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              Soporte Directo Manuel Madrid
            </a>
          </div>
        </div>

        {/* Root Footer */}
        <footer className="mt-12 text-center text-slate-500">
          <p className="text-sm">💻 DialyStock PRO © 2025 | Todos los derechos reservados</p>
        </footer>
      </div>
    </div>
  )
}