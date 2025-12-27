'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <p className="text-center mt-10 text-white text-2xl">Cargando...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Bienvenido a DialyStock
        </h1>
        
        {user ? (
          <div className="text-center space-y-6">
            <p className="text-xl text-gray-700">
              Has iniciado sesión correctamente como:
            </p>
            <p className="text-2xl font-semibold text-blue-600">
              {user.email}
            </p>
            <p className="text-lg text-green-600">
              ¡Todo funciona! Estás dentro del sistema.
            </p>
            <button
              onClick={handleLogout}
              className="mt-8 px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <p className="text-center text-red-600 text-xl">
            No se pudo cargar el usuario.
          </p>
        )}
        
        <div className="mt-12 text-center text-gray-500">
          <p className="text-xl">Dashboard en desarrollo...</p>
          <p>Pronto tendrás acceso completo al inventario, solicitudes y gestión de usuarios.</p>
        </div>
      </div>
    </div>
  )
}