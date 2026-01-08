'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SuperAdminHome() {
  const [user, setUser] = useState<any>(null)
  const [clinicas, setClinicas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase.from('clinicas').select('*')
      setClinicas(data || [])

      setLoading(false)
    }
    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <p className="text-center mt-20 text-2xl text-white">Cargando panel del dueño...</p>

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">Panel del Dueño</h1>
          <p className="text-xl text-gray-600 mt-2">Bienvenido, {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold">
          Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-blue-100 rounded-xl p-8 text-center">
          <h2 className="text-5xl font-bold text-blue-600">{clinicas.length}</h2>
          <p className="text-xl mt-2">Clínicas Activas</p>
        </div>
        <div className="bg-green-100 rounded-xl p-8 text-center">
          <h2 className="text-5xl font-bold text-green-600">1</h2>
          <p className="text-xl mt-2">SuperAdmin</p>
        </div>
        <div className="bg-purple-100 rounded-xl p-8 text-center">
          <h2 className="text-5xl font-bold text-purple-600">∞</h2>
          <p className="text-xl mt-2">Potencial de Clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/clinicas/nueva">
          <div className="bg-blue-600 text-white rounded-xl p-8 text-center hover:bg-blue-700 cursor-pointer transition">
            <h3 className="text-2xl font-bold">Crear Nueva Clínica</h3>
            <p className="mt-4">Para revender el sistema a otra clínica</p>
          </div>
        </Link>

        <Link href="/usuario/nuevo">
          <div className="bg-green-600 text-white rounded-xl p-8 text-center hover:bg-green-700 cursor-pointer transition">
            <h3 className="text-2xl font-bold">Crear Usuario</h3>
            <p className="mt-4">Para cualquier clínica existente</p>
          </div>
        </Link>
      </div>

      <h2 className="text-3xl font-bold mt-16 mb-6">Clínicas Registradas</h2>
      {clinicas.length === 0 ? (
        <p className="text-gray-600">No hay clínicas creadas aún.</p>
      ) : (
        <div className="space-y-6">
          {clinicas.map((clinica) => (
            <div key={clinica.id} className="bg-gray-50 rounded-xl p-6 border">
              <h3 className="text-2xl font-bold">{clinica.nombre}</h3>
              <p className="text-gray-600 mt-2">{clinica.descripcion || 'Sin descripción'}</p>
              <p className="text-sm text-gray-500 mt-4">
                Tenant ID: <code className="bg-gray-200 px-3 py-1 rounded">{clinica.tenant_id}</code>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER GENERAL */}
      <div className="footer-credits">
        💻 <strong>Sistema desarrollado por Manuel Fernando Madrid</strong> | DaVita Farmacia © 2025 Todos los derechos reservados | Sistema HD/PD V3.0
      </div>
    </div>
  )
}