'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [clinicas, setClinicas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: clinicasData } = await supabase.from('clinicas').select('*')
      setClinicas(clinicasData || [])

      setLoading(false)
    }
    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <p className="text-center mt-20 text-white text-2xl">Cargando panel...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-10 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Panel del Dueño</h1>
              <p className="text-xl text-gray-600 mt-2">Bienvenido, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center bg-blue-50 rounded-xl p-8">
              <h2 className="text-5xl font-bold text-blue-600">{clinicas.length}</h2>
              <p className="text-gray-700 mt-2 text-xl">Clínicas Activas</p>
            </div>
            <div className="text-center bg-green-50 rounded-xl p-8">
              <h2 className="text-5xl font-bold text-green-600">1</h2>
              <p className="text-gray-700 mt-2 text-xl">SuperAdmin</p>
            </div>
            <div className="text-center bg-purple-50 rounded-xl p-8">
              <h2 className="text-5xl font-bold text-purple-600">∞</h2>
              <p className="text-gray-700 mt-2 text-xl">Potencial de Ventas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/superadmin/clinicas/nueva">
              <div className="bg-blue-600 text-white rounded-xl p-8 text-center hover:bg-blue-700 transition cursor-pointer">
                <h3 className="text-2xl font-bold">Crear Nueva Clínica</h3>
                <p className="mt-4">Para revender el sistema a otra clínica</p>
              </div>
            </Link>

            <Link href="/superadmin/usuarios/nuevo">
              <div className="bg-green-600 text-white rounded-xl p-8 text-center hover:bg-green-700 transition cursor-pointer">
                <h3 className="text-2xl font-bold">Crear Usuario</h3>
                <p className="mt-4">Para cualquier clínica existente</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold mb-6">Clínicas Registradas</h2>
          {clinicas.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No hay clínicas creadas aún.</p>
          ) : (
            <div className="space-y-6">
              {clinicas.map((clinica) => (
                <div key={clinica.id} className="border rounded-xl p-6 bg-gray-50">
                  <h3 className="text-2xl font-bold">{clinica.nombre}</h3>
                  <p className="text-gray-600 mt-2">{clinica.descripcion || 'Sin descripción'}</p>
                  <p className="text-sm text-gray-500 mt-4">
                    Tenant ID: <code className="bg-gray-200 px-3 py-1 rounded">{clinica.tenant_id}</code>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Creada: {new Date(clinica.created_at).toLocaleDateString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}