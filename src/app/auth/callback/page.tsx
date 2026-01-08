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
      // Obtener el código del hash de la URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken) {
        throw new Error('No se recibió token de acceso')
      }

      setMessage('Configurando tu sesión...')

      // Establecer la sesión manualmente
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      })

      if (sessionError) throw sessionError

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

      // Redirigir según el rol
      await new Promise(resolve => setTimeout(resolve, 1000))

      const userProfile = profile || (await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()).data

      if (userProfile?.role === 'admin_clinica') {
        router.push('/admin')
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