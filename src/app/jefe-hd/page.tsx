'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
    LayoutDashboard,
    FileText,
    AlertTriangle,
    LogOut,
    Sun,
    Moon,
    ClipboardList,
    MessageSquarePlus,
    Package
} from 'lucide-react'

export default function JefeHDPage() {
    const router = useRouter()

    // Theme State
    const [darkMode, setDarkMode] = useState(false)
    const [currentTheme, setCurrentTheme] = useState('')
    const [activeTab, setActiveTab] = useState('dashboard')
    const [loading, setLoading] = useState(true)

    // Data State
    const [stats, setStats] = useState({ solicitudes_mes: 0, alertas: 0, pendientes: 0 })
    const [solicitudes, setSolicitudes] = useState<any[]>([])

    // Reporte State
    const [reporteFarmacia, setReporteFarmacia] = useState('')
    const [reporteAdmin, setReporteAdmin] = useState('')
    const [enviandoReporte, setEnviandoReporte] = useState(false)
    const [tenantId, setTenantId] = useState('')

    // Modal Detalle State
    const [modalDetalle, setModalDetalle] = useState<any>(null)
    const [itemsDetalle, setItemsDetalle] = useState<any[]>([])

    // Styles (Reusing standard styles)
    const styles = `
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --text-primary: #2c3e50;
      --text-secondary: #6c757d;
      --primary: #3b82f6; 
      --secondary: #64748b;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444; 
      --info: #06b6d4;
      --border-color: #e2e8f0;
    }
    .dark-mode {
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --border-color: #334155;
    }
    
    .app-container { display: flex; min-height: 100vh; background: var(--bg-secondary); color: var(--text-primary); transition: all 0.3s; }
    .sidebar { width: 260px; background: #0f172a; color: white; display: flex; flex-direction: column; transition: all 0.3s; }
    .sidebar-link { 
      padding: 15px 20px; display: flex; items-center; gap: 12px; color: #94a3b8; 
      text-align: left; width: 100%; transition: all 0.2s; border-left: 3px solid transparent;
    }
    .sidebar-link:hover, .sidebar-link.active { background: rgba(255,255,255,0.05); color: white; border-left-color: var(--primary); }
    
    .stat-card {
      background: var(--bg-primary); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);
      display: flex; alignItems: center; gap: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .stat-icon {
      width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
      color: white; font-size: 24px;
    }

    .table-container { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 15px; text-align: left; background: var(--bg-secondary); border-bottom: 2px solid var(--border-color); font-weight: 600;}
    td { padding: 12px 15px; border-bottom: 1px solid var(--border-color); }
  `

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) router.push('/')

            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()
            if (!profile) return

            setTenantId(profile.tenant_id)

            // Cargar solicitudes del área Sala HD del tenant
            const { data: sols } = await supabase
                .from('solicitudes')
                .select('*')
                .eq('tenant_id', profile.tenant_id)
                .eq('area', 'Sala HD')
                .order('created_at', { ascending: false })

            const pendientes = sols?.filter(s => s.estado === 'Pendiente').length || 0

            setSolicitudes(sols || [])
            setStats({
                solicitudes_mes: sols?.length || 0,
                pendientes: pendientes,
                alertas: 0 // TODO: Lógica de alertas
            })
            setLoading(false)

        } catch (e) {
            console.error(e)
            setLoading(false)
        }
    }

    const handleReporteFarmacia = async () => {
        if (!reporteFarmacia.trim()) return alert('Escribe el reporte')
        setEnviandoReporte(true)
        try {
            const { error } = await supabase.from('reportes').insert({
                tenant_id: tenantId,
                tipo_destino: 'farmacia',
                area_origen: 'Sala HD',
                titulo: 'Reporte de Inventario/Medicamentos',
                descripcion: reporteFarmacia,
                estado: 'pendiente'
            })
            if (error) throw error
            alert('✅ Reporte enviado a Farmacia')
            setReporteFarmacia('')
        } catch (e: any) {
            alert('Error: ' + e.message)
        }
        setEnviandoReporte(false)
    }

    const handleReporteAdmin = async () => {
        if (!reporteAdmin.trim()) return alert('Escribe el reporte')
        setEnviandoReporte(true)
        try {
            const { error } = await supabase.from('reportes').insert({
                tenant_id: tenantId,
                tipo_destino: 'admin',
                area_origen: 'Sala HD',
                titulo: 'Reporte Operativo/Infraestructura',
                descripcion: reporteAdmin,
                estado: 'pendiente'
            })
            if (error) throw error
            alert('✅ Reporte enviado a Administración')
            setReporteAdmin('')
        } catch (e: any) {
            alert('Error: ' + e.message)
        }
        setEnviandoReporte(false)
    }

    const verDetalleSolicitud = async (solicitud: any) => {
        setModalDetalle(solicitud)
        const { data } = await supabase
            .from('solicitudes_items')
            .select('*')
            .eq('solicitud_id', solicitud.id)
        setItemsDetalle(data || [])
    }

    if (loading) return <div className="p-10 text-center">Cargando Panel de Supervisión...</div>

    return (
        <>
            <style jsx global>{styles}</style>
            <div className={`app-container ${darkMode ? 'dark-mode' : ''} ${currentTheme}`}>

                {/* SIDEBAR */}
                <aside className="sidebar">
                    <div className="p-6">
                        <h1 className="text-xl font-bold text-white mb-2">Jefe HD</h1>
                        <p className="text-white/60 text-sm">Supervisión Sala</p>
                    </div>
                    <nav className="mt-4">
                        <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                            <LayoutDashboard size={20} /> Resumen
                        </button>
                        <button className={`sidebar-link ${activeTab === 'solicitudes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitudes')}>
                            <ClipboardList size={20} /> Historial Solicitudes
                        </button>
                        <button className={`sidebar-link ${activeTab === 'reportes' ? 'active' : ''}`} onClick={() => setActiveTab('reportes')}>
                            <MessageSquarePlus size={20} /> Reportes
                        </button>
                    </nav>
                    <div className="mt-auto p-4 border-t border-white/10">
                        <button className="sidebar-link text-red-300 hover:text-red-100" onClick={() => supabase.auth.signOut().then(() => router.push('/'))}>
                            <LogOut size={20} /> Cerrar Sesión
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-8 bg-[var(--bg-primary)] p-4 rounded-xl shadow-sm border border-[var(--border-color)]">
                        <div>
                            <h2 className="text-2xl font-bold">Panel de Supervisión</h2>
                            <p className="text-[var(--text-secondary)]">Sala de Hemodiálisis</p>
                        </div>
                        <button className="p-2 rounded-full hover:bg-[var(--bg-secondary)]" onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <div className="stat-icon" style={{ background: 'var(--primary)' }}><FileText /></div>
                            <div>
                                <h3 className="text-2xl font-bold">{stats.solicitudes_mes}</h3>
                                <p className="text-sm opacity-70">Total Solicitudes</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                            <div className="stat-icon" style={{ background: 'var(--warning)' }}><AlertTriangle /></div>
                            <div>
                                <h3 className="text-2xl font-bold">{stats.pendientes || 0}</h3>
                                <p className="text-sm opacity-70">Pendientes</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                            <div className="stat-icon" style={{ background: 'var(--success)' }}><Package /></div>
                            <div>
                                <h3 className="text-2xl font-bold">OK</h3>
                                <p className="text-sm opacity-70">Estado Stock Sala</p>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    {activeTab === 'dashboard' && (
                        <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                            <h3 className="font-bold mb-4">Últimos Movimientos</h3>
                            {solicitudes.length === 0 ? <p className="text-gray-500">No hay actividad reciente.</p> : (
                                <div className="space-y-4">
                                    {solicitudes.slice(0, 5).map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-3 border-b border-[var(--border-color)]">
                                            <div>
                                                <span className="font-bold block">Solicitud #{s.id.slice(0, 8)}</span>
                                                <span className="text-sm opacity-60">{new Date(s.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {s.estado}
                                            </span>
                                        </div>
                                    ))}
                                    <button onClick={() => setActiveTab('solicitudes')} className="text-blue-500 text-sm font-bold mt-2 hover:underline">Ver todo el historial</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'solicitudes' && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Solicitante</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map(s => (
                                        <tr key={s.id}>
                                            <td className="font-mono text-sm">{s.id.slice(0, 8)}</td>
                                            <td>{new Date(s.created_at).toLocaleString()}</td>
                                            <td>{s.solicitante || 'Desconocido'}</td>
                                            <td>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${s.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                    {s.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                                    onClick={() => verDetalleSolicitud(s)}
                                                >
                                                    👁️ Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reportes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* REPORTE A FARMACIA */}
                            <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold">Reporte a Farmacia</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mt-2">Problemas de inventario, medicamentos o insumos</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Descripción</label>
                                        <textarea
                                            className="w-full p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] h-32 focus:ring-2 focus:ring-green-500 outline-none transition"
                                            placeholder="Ej: Falta de medicamento X, lote vencido..."
                                            value={reporteFarmacia}
                                            onChange={e => setReporteFarmacia(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <button
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                                        onClick={handleReporteFarmacia}
                                        disabled={enviandoReporte}
                                    >
                                        {enviandoReporte ? 'Enviando...' : '📦 Enviar a Farmacia'}
                                    </button>
                                </div>
                            </div>

                            {/* REPORTE A ADMIN */}
                            <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold">Reporte a Administración</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mt-2">Problemas operativos, infraestructura o personal</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Descripción</label>
                                        <textarea
                                            className="w-full p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] h-32 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            placeholder="Ej: Fuga de agua, falla eléctrica, falta personal..."
                                            value={reporteAdmin}
                                            onChange={e => setReporteAdmin(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <button
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                                        onClick={handleReporteAdmin}
                                        disabled={enviandoReporte}
                                    >
                                        {enviandoReporte ? 'Enviando...' : '🏥 Enviar a Admin'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* FOOTER GENERAL */}
                    <div className="footer-credits" style={{ marginTop: 'auto' }}>
                        💻 <strong>Sistema desarrollado por Manuel Fernando Madrid</strong> | DaVita Farmacia © 2025 Todos los derechos reservados | Sistema HD/PD V3.0
                    </div>
                </main >
            </div >

            {/* MODAL DETALLE SOLICITUD */}
            {modalDetalle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
                    <div className="bg-[var(--bg-primary)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div>
                                <h3 className="text-xl font-bold">Detalle de Solicitud #{modalDetalle.id.slice(0, 8)}</h3>
                                <p className="text-white/80 text-sm">Solicitado por: {modalDetalle.solicitante}</p>
                            </div>
                            <button onClick={() => setModalDetalle(null)} className="p-2 hover:bg-white/20 rounded-full transition">
                                <LogOut size={20} className="rotate-180" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="pb-3 text-left">Producto</th>
                                        <th className="pb-3 text-center">Cant.</th>
                                        <th className="pb-3 text-left">Observación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {itemsDetalle.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-[var(--bg-secondary)] transition">
                                            <td className="py-3">{item.descripcion}</td>
                                            <td className="py-3 text-center font-bold">{item.cantidad_solicitada}</td>
                                            <td className="py-3 text-[var(--text-secondary)] italic">{item.observacion || '-'}</td>
                                        </tr>
                                    ))}
                                    {itemsDetalle.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-[var(--text-secondary)]">Cargando productos...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-secondary)]">
                            <button
                                onClick={() => setModalDetalle(null)}
                                className="px-6 py-2 bg-[var(--text-secondary)] text-white rounded-lg font-bold hover:opacity-90 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
