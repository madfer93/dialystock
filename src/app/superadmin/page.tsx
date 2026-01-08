'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Building2,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  UserPlus,
  ArrowRight
} from 'lucide-react'

export default function SuperAdminHome() {
  const [clinicas, setClinicas] = useState<any[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Cargar Clínicas
      const { data: clinicasData } = await supabase.from('clinicas').select('*').order('created_at', { ascending: false })
      setClinicas(clinicasData || [])

      // Cargar conteo de perfiles
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      setTotalUsers(count || 0)

      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Cargando ecosistema DialyStock...</p>
    </div>
  )

  const stats = [
    { name: 'Clínicas Activas', value: clinicas.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+1 este mes' },
    { name: 'Usuarios Totales', value: totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Global' },
    { name: 'Uptime Sistema', value: '100%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Óptimo' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">Dashboard Global</h1>
          <p className="text-slate-500 mt-2 text-lg">Gestiona el crecimiento y despliegue de la red DialyStock.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/superadmin/clinicas/nueva">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95">
              <Plus size={20} />
              <span>Nueva Clínica</span>
            </button>
          </Link>
          <Link href="/superadmin/usuario/nuevo">
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0f172a] border border-slate-200 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95">
              <UserPlus size={20} />
              <span>Crear Admin</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon size={28} />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{stat.trend}</span>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">{stat.name}</p>
              <h3 className="text-3xl font-black text-[#0f172a] tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Clinicas List */}
        <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-[#0f172a]">Clínicas Registradas</h2>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{clinicas.length} Total</span>
          </div>
          <div className="p-0 overflow-x-auto">
            {clinicas.length === 0 ? (
              <div className="py-20 text-center">
                <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium text-lg">No hay clínicas registradas aún.</p>
                <Link href="/superadmin/clinicas/nueva" className="text-blue-500 hover:underline mt-2 inline-block">Crea la primera ahora</Link>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles Clínica</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tenant ID</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {clinicas.map((clinica) => (
                    <tr key={clinica.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                            {clinica.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0f172a]">{clinica.nombre}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{clinica.descripcion || 'Sin descripción'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <code className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-mono">
                          {clinica.tenant_id}
                        </code>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-100">
                          <ArrowRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-3xl text-white relative overflow-hidden group shadow-xl shadow-slate-200">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Multi-tenant activo</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Cada nueva clínica que agregas genera un ecosistema independiente de inventario y usuarios.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-medium text-emerald-400 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>Escalado habilitado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-6">Soporte Técnico</h3>
            <div className="space-y-4">
              <p className="text-slate-500 text-sm">¿Dificultades con el sistema?</p>
              <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-[#0f172a] rounded-xl font-bold text-sm transition-colors border border-slate-200">
                Contactar Desarrollador
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credits */}
      <footer className="pt-10 pb-4 text-center border-t border-slate-100">
        <p className="text-slate-400 text-sm">
          💻 <strong>Sistema DialyStock v3.0</strong> | Desarrollado por <strong>Manuel Fernando Madrid</strong>
        </p>
        <p className="text-slate-300 text-[10px] uppercase tracking-widest mt-2 font-bold">
          DaVita Farmacia © 2025 Todos los derechos reservados
        </p>
      </footer>
    </div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}