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
  ArrowRight,
  Trash2,
  Edit3
} from 'lucide-react'

export default function SuperAdminHome() {
  const [clinicas, setClinicas] = useState<any[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalProductos, setTotalProductos] = useState(0)
  const [totalSolicitudes, setTotalSolicitudes] = useState(0)
  const [recentSolicitudes, setRecentSolicitudes] = useState<any[]>([])
  const [usuariosGlobales, setUsuariosGlobales] = useState<any[]>([])
  const [filterClinica, setFilterClinica] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // 1. Cargar Clínicas
      const { data: clinicasData } = await supabase.from('clinicas').select('*').order('created_at', { ascending: false })
      setClinicas(clinicasData || [])

      // 2. Cargar conteo global
      const [usersCount, prodsCount, solsCount, recentSols, allUsers] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('productos').select('*', { count: 'exact', head: true }),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }),
        supabase.from('solicitudes').select('*, clinicas(nombre)').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('*, clinicas:tenant_id(nombre)').order('created_at', { ascending: false }).limit(10)
      ])

      setTotalUsers(usersCount.count || 0)
      setTotalProductos(prodsCount.count || 0)
      setTotalSolicitudes(solsCount.count || 0)
      setRecentSolicitudes(recentSols.data || [])
      setUsuariosGlobales(allUsers.data || [])

      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    const fetchFilteredActivity = async () => {
      let query = supabase.from('solicitudes').select('*, clinicas(nombre)').order('created_at', { ascending: false }).limit(5)
      if (filterClinica !== 'all') {
        query = query.eq('tenant_id', filterClinica)
      }
      const { data } = await query
      setRecentSolicitudes(data || [])
    }
    if (!loading) fetchFilteredActivity()
  }, [filterClinica])

  const deleteClinica = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la clínica "${nombre}"? Esta acción no se puede deshacer y podría afectar a los usuarios asociados.`)) return

    try {
      const { error } = await supabase.from('clinicas').delete().eq('id', id)
      if (error) throw error

      setClinicas(clinicas.filter(c => c.id !== id))
      // Opcionalmente actualizar otros contadores
      setTotalSolicitudes(prev => prev) // placeholder
    } catch (err: any) {
      alert('Error al eliminar clínica: ' + err.message)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Cargando ecosistema DialyStock...</p>
    </div>
  )

  const stats = [
    { name: 'Clínicas Activas', value: clinicas.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Red Global' },
    { name: 'Usuarios Totales', value: totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Crecimiento' },
    { name: 'Productos Totales', value: totalProductos, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'En catálogo' },
    { name: 'Solicitudes Realizadas', value: totalSolicitudes, icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Frecuencia' },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
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
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold overflow-hidden">
                              {clinica.logo_url ? (
                                <img src={clinica.logo_url} alt={clinica.nombre} className="w-full h-full object-cover" />
                              ) : (
                                clinica.nombre.charAt(0)
                              )}
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
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => deleteClinica(clinica.id, clinica.nombre)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100"
                              title="Eliminar Clínica"
                            >
                              <Trash2 size={20} />
                            </button>
                            <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-100">
                              <ArrowRight size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Global Users List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-[#0f172a]">Usuarios Globales</h2>
              <span className="text-sm font-medium text-slate-500">{totalUsers} Total</span>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email / Usuario</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Clínica Asociada</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rol Permisos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {usuariosGlobales.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-[#0f172a]">{usr.email}</p>
                        <p className="text-[10px] text-slate-400">{usr.id}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-sm font-medium text-slate-600">
                            {usr.clinicas?.nombre || 'Acceso Global'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 border border-slate-200">
                          {usr.role?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={20} />
                Actividad Reciente
              </h3>
              <select
                value={filterClinica}
                onChange={(e) => setFilterClinica(e.target.value)}
                className="text-xs font-bold bg-slate-50 border-none rounded-lg p-1 focus:ring-0 cursor-pointer"
              >
                <option value="all">Todas</option>
                {clinicas.map(c => (
                  <option key={c.id} value={c.tenant_id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-6">
              {recentSolicitudes.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Sin actividad reciente.</p>
              ) : (
                recentSolicitudes.map((sol) => (
                  <div key={sol.id} className="flex gap-4 relative">
                    <div className="relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${sol.estado === 'Completado' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {sol.area.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0f172a]">
                        Solicitud en <span className="text-blue-600">{sol.clinicas?.nombre || 'Clínica'}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Área: {sol.area} • {new Date(sol.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className={sol.estado === 'Completado' ? 'text-emerald-500' : 'text-orange-500'}>
                          {sol.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-6">Soporte Técnico</h3>
            <div className="space-y-4">
              <p className="text-slate-500 text-sm">¿Dificultades con el sistema? Contacta directamente al desarrollador.</p>
              <a
                href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, necesito soporte técnico con el sistema DialyStock.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credits */}
      <footer className="pt-10 pb-4 text-center border-t border-slate-100">
        <p className="text-slate-400 text-sm">
          💻 <strong>Sistema DialyStock PRO</strong> | Desarrollado por <strong>Manuel Fernando Madrid</strong>
        </p>
        <p className="text-slate-300 text-[10px] uppercase tracking-widest mt-2 font-bold">
          DialyStock © 2025 Todos los derechos reservados
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