'use client'

export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando tu acceso...')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      // 1. Intentar obtener el 'code' (Flujo PKCE - Query Params)
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')

      // 2. Intentar obtener 'access_token' (Flujo Implícito - Hash Params)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      let sessionData = null

      // 1. Verificar primero si Supabase ya capturó la sesión automáticamente
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        console.log('✅ Sesión ya detectada automáticamente')
        sessionData = { session: existingSession, user: existingSession.user }
      } else if (code) {
        setMessage('Intercambiando código por sesión...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.warn('Fallo intercambio de código, reintentando ver sesión...', error.message)
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (retrySession) {
            sessionData = { session: retrySession, user: retrySession.user }
          } else {
            throw error
          }
        } else {
          sessionData = data
        }
      } else if (accessToken) {
        setMessage('Configurando tu sesión...')
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })
        if (error) throw error
        sessionData = data
      } else {
        // Si no hay nada, intentar ver si Supabase ya capturó la sesión
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          sessionData = { session, user: session.user }
        } else {
          throw new Error('No se recibió token ni código de acceso')
        }
      }

      const user = sessionData?.user
      if (!user) throw new Error('No se pudo obtener información del usuario')

      setMessage('Verificando tu perfil...')

      // Esperar un momento para que el trigger cree el perfil
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Verificar que el perfil existe
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Error al obtener perfil:', profileError)
        throw new Error('Error al verificar tu perfil')
      }

      if (!profile) {
        setMessage('Creando tu perfil...')
        // Esperar más tiempo si el perfil no existe aún
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Intentar de nuevo
        const { data: profile2, error: profileError2 } = await supabase
          .from('profiles')
          .select('role, tenant_id')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError2 || !profile2) {
          throw new Error('No se pudo crear tu perfil. Contacta al administrador.')
        }
      }

      setStatus('success')
      setMessage('¡Acceso concedido! Redirigiendo...')

      // Redirigir según el rol (Sincronizado con Home)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const userProfile = profile || (await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()).data

      const role = (userProfile?.role?.toLowerCase() || '').replace(/\s+/g, '_')
      console.log('Rol detectado en callback:', role)

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
        router.push('/clinica')
      }

    } catch (error: any) {
      console.error('Error en callback:', error)
      setStatus('error')
      setMessage(error.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Procesando...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  )
}