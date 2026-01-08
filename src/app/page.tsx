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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          DialyStock
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Sistema de Gestión de Inventario Médico
        </p>
        <form onSubmit={handleMagicLink} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@correo.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? 'Enviando...' : 'Enviar Magic Link'}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-center">
            {message}
          </div>
        )}
      </div>

      {/* FOOTER GENERAL */}
      <div className="footer-credits fixed bottom-0 w-full bg-white/50 backdrop-blur-sm py-4">
        💻 <strong>Sistema desarrollado por Manuel Fernando Madrid</strong> | DaVita Farmacia © 2025 Todos los derechos reservados | Sistema HD/PD V3.0
      </div>
    </div>
  )
}