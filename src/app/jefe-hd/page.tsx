'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics'
import {
    LayoutDashboard,
    FileText,
    AlertTriangle,
    LogOut,
    Sun,
    Moon,
    ClipboardList,
    MessageSquarePlus,
    Package,
    CheckCircle2,
    XCircle,
    Bell,
    Settings,
    Printer,
    Eye,
    Send,
    RotateCcw,
    Save,
    Plus,
    Trash2
} from 'lucide-react'

interface ReglaValidacion {
    id: string
    nombre: string
    tipo: string
    configuracion: {
        lineas?: string[]
        filtros?: string[]
    }
    mensaje_error?: string
    activo: boolean
}

export default function JefeHDPage() {
    const router = useRouter()

    // Theme State
    const [darkMode, setDarkMode] = useState(false)
    const [currentTheme, setCurrentTheme] = useState('')
    const [activeTab, setActiveTab] = useState('aprobaciones')
    const [loading, setLoading] = useState(true)

    // Data State
    const [stats, setStats] = useState({ solicitudes_mes: 0, alertas: 0, pendientes: 0, devueltas: 0 })
    const [solicitudes, setSolicitudes] = useState<any[]>([])
    const [solicitudesPendientes, setSolicitudesPendientes] = useState<any[]>([])

    // Reporte State
    const [reporteFarmacia, setReporteFarmacia] = useState('')
    const [reporteAdmin, setReporteAdmin] = useState('')
    const [enviandoReporte, setEnviandoReporte] = useState(false)
    const [tenantId, setTenantId] = useState('')
    const [userId, setUserId] = useState('')
    const [userEmail, setUserEmail] = useState('')

    // Modal Detalle/Aprobación State
    const [modalDetalle, setModalDetalle] = useState<any>(null)
    const [itemsDetalle, setItemsDetalle] = useState<any[]>([])
    const [comentarioRechazo, setComentarioRechazo] = useState('')
    const [procesandoAccion, setProcesandoAccion] = useState(false)

    // Configuración de Reglas State
    const [reglas, setReglas] = useState<ReglaValidacion[]>([])
    const [nuevaReglaLineas, setNuevaReglaLineas] = useState('')
    const [nuevaReglaFiltros, setNuevaReglaFiltros] = useState('')
    const [guardandoReglas, setGuardandoReglas] = useState(false)

    // Notificaciones
    const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0)

    // Print ref
    const printRef = useRef<HTMLDivElement>(null)

    // Analytics - Aprendizaje automático
    const analyticsContext = useMemo(() => ({
        tenantId,
        userId,
        userName: userEmail.split('@')[0],
        userRole: 'jefe_hd'
    }), [tenantId, userId, userEmail])
    const { eventos: analytics } = useLearningAnalytics(analyticsContext.tenantId ? analyticsContext : null)

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
      padding: 15px 20px; display: flex; align-items: center; gap: 12px; color: #94a3b8;
      text-align: left; width: 100%; transition: all 0.2s; border-left: 3px solid transparent;
    }
    .sidebar-link:hover, .sidebar-link.active { background: rgba(255,255,255,0.05); color: white; border-left-color: var(--primary); }

    .stat-card {
      background: var(--bg-primary); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);
      display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .stat-icon {
      width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
      color: white; font-size: 24px;
    }

    .table-container { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 15px; text-align: left; background: var(--bg-secondary); border-bottom: 2px solid var(--border-color); font-weight: 600;}
    td { padding: 12px 15px; border-bottom: 1px solid var(--border-color); }

    .badge-notify {
      position: absolute; top: -5px; right: -5px; background: #ef4444; color: white;
      font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @media print {
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible !important; }
      .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white !important;
        color: black !important;
        padding: 20px !important;
      }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      .print-area table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      .print-area th, .print-area td {
        border: 1px solid #333 !important;
        padding: 8px !important;
        color: black !important;
      }
      .print-area th {
        background: #f0f0f0 !important;
        font-weight: bold !important;
      }
      .print-header {
        display: block !important;
        border-bottom: 2px solid #333 !important;
        padding-bottom: 15px !important;
        margin-bottom: 15px !important;
      }
      .print-header h2 {
        font-size: 24px !important;
        margin-bottom: 10px !important;
      }
      .print-info-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin-top: 10px !important;
      }
      .print-info-item {
        display: flex !important;
        gap: 5px !important;
      }
      .print-obs-general {
        background: #f5f5f5 !important;
        border: 1px solid #ccc !important;
        padding: 10px !important;
        margin: 15px 0 !important;
        border-radius: 5px !important;
      }
    }
  `

    // Sonido Notificación
    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = 800
            osc.type = 'sine'
            gain.gain.setValueAtTime(0.1, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5)
            osc.start()
            osc.stop(ctx.currentTime + 0.5)
        } catch (e) { console.error('Audio error', e) }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    useEffect(() => {
        if (!tenantId) return

        // REALTIME: Escuchar nuevas solicitudes pendientes de revisión
        const channel = supabase
            .channel('jefe-hd-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'solicitudes',
                filter: `tenant_id=eq.${tenantId}`
            }, (payload: any) => {
                // Nueva solicitud pendiente de revisión
                if (payload.eventType === 'INSERT' && payload.new.estado_aprobacion === 'pendiente_revision') {
                    playNotificationSound()
                    setNotificacionesNoLeidas(prev => prev + 1)
                    cargarSolicitudesPendientes(tenantId)
                }
                // Solicitud modificada (reenvío)
                if (payload.eventType === 'UPDATE' &&
                    payload.new.estado_aprobacion === 'pendiente_revision' &&
                    payload.old.estado_aprobacion === 'devuelto') {
                    playNotificationSound()
                    setNotificacionesNoLeidas(prev => prev + 1)
                    cargarSolicitudesPendientes(tenantId)
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [tenantId])

    const cargarDatos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) router.push('/')
            setUserId(user?.id || '')
            setUserEmail(user?.email || '')

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

            const pendientes = sols?.filter(s => s.estado_aprobacion === 'pendiente_revision').length || 0
            const devueltas = sols?.filter(s => s.estado_aprobacion === 'devuelto').length || 0

            setSolicitudes(sols || [])
            setStats({
                solicitudes_mes: sols?.length || 0,
                pendientes: pendientes,
                devueltas: devueltas,
                alertas: pendientes
            })

            // Cargar pendientes de aprobación
            await cargarSolicitudesPendientes(profile.tenant_id)

            // Cargar reglas de validación
            await cargarReglas(profile.tenant_id)

            setLoading(false)

        } catch (e) {
            console.error(e)
            setLoading(false)
        }
    }

    const cargarSolicitudesPendientes = async (tid: string) => {
        const { data } = await supabase
            .from('solicitudes')
            .select('*')
            .eq('tenant_id', tid)
            .eq('estado_aprobacion', 'pendiente_revision')
            .order('created_at', { ascending: true })
        setSolicitudesPendientes(data || [])
    }

    const cargarReglas = async (tid: string) => {
        const { data } = await supabase
            .from('reglas_validacion')
            .select('*')
            .eq('tenant_id', tid)

        if (data && data.length > 0) {
            setReglas(data)
            // Cargar líneas/filtros en los inputs
            const reglaLF = data.find(r => r.tipo === 'LINEAS_FILTROS')
            if (reglaLF?.configuracion) {
                setNuevaReglaLineas(reglaLF.configuracion.lineas?.join(', ') || '')
                setNuevaReglaFiltros(reglaLF.configuracion.filtros?.join(', ') || '')
            }
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
        setComentarioRechazo('')
        const { data } = await supabase
            .from('solicitudes_items')
            .select('*')
            .eq('solicitud_id', solicitud.id)
        setItemsDetalle(data || [])
    }

    // APROBAR SOLICITUD
    const aprobarSolicitud = async () => {
        if (!modalDetalle) return
        if (!confirm('¿Aprobar esta solicitud y enviarla a Farmacia?')) return

        setProcesandoAccion(true)
        try {
            // Actualizar estado
            const { error } = await supabase
                .from('solicitudes')
                .update({
                    estado_aprobacion: 'aprobado',
                    fecha_revision: new Date().toISOString(),
                    revisado_por: userId
                })
                .eq('id', modalDetalle.id)

            if (error) throw error

            // Registrar en log
            await supabase.from('aprobaciones_log').insert({
                solicitud_id: modalDetalle.id,
                tenant_id: tenantId,
                accion: 'APROBADO',
                usuario_id: userId,
                usuario_email: userEmail,
                usuario_rol: 'jefe_sala_hd',
                comentario: 'Solicitud aprobada y enviada a Farmacia'
            })

            // Crear notificación para Sala HD
            await supabase.from('notificaciones_pendientes').insert({
                tenant_id: tenantId,
                usuario_destino_id: modalDetalle.usuario_id,
                tipo: 'SOLICITUD_APROBADA',
                titulo: 'Pedido Aprobado',
                mensaje: `Tu pedido #${modalDetalle.id.slice(0, 8)} fue aprobado y enviado a Farmacia`,
                solicitud_id: modalDetalle.id
            })

            // Crear notificación para Farmacia
            await supabase.from('notificaciones_pendientes').insert({
                tenant_id: tenantId,
                rol_destino: 'farmacia',
                tipo: 'NUEVA_SOLICITUD',
                titulo: 'Nueva Solicitud Aprobada',
                mensaje: `Pedido #${modalDetalle.id.slice(0, 8)} de ${modalDetalle.solicitante} aprobado por Jefe HD`,
                solicitud_id: modalDetalle.id
            })

            // Registrar evento de aprendizaje
            analytics?.solicitudAprobada({
                solicitudId: modalDetalle.id
            })

            // 🧠 APRENDIZAJE IA: Actualizar confianza de cada producto
            for (const item of itemsDetalle) {
                await supabase.rpc('actualizar_confianza_producto', {
                    p_tenant_id: tenantId,
                    p_producto_codigo: item.producto_codigo,
                    p_descripcion: item.descripcion,
                    p_cantidad: item.cantidad_solicitada || 1,
                    p_fue_aprobado: true,
                    p_solicitante: modalDetalle.solicitante
                })
            }

            alert('✅ Solicitud aprobada y enviada a Farmacia')
            setModalDetalle(null)
            cargarDatos()

        } catch (e: any) {
            alert('Error: ' + e.message)
        }
        setProcesandoAccion(false)
    }

    // DEVOLVER/RECHAZAR SOLICITUD
    const devolverSolicitud = async () => {
        if (!modalDetalle) return
        if (!comentarioRechazo.trim()) {
            alert('⚠️ Debes escribir un motivo de devolución')
            return
        }
        if (!confirm('¿Devolver esta solicitud a Sala HD para corrección?')) return

        setProcesandoAccion(true)
        try {
            // Actualizar estado
            const { error } = await supabase
                .from('solicitudes')
                .update({
                    estado_aprobacion: 'devuelto',
                    comentario_jefe: comentarioRechazo,
                    fecha_revision: new Date().toISOString(),
                    revisado_por: userId
                })
                .eq('id', modalDetalle.id)

            if (error) throw error

            // Registrar en log
            await supabase.from('aprobaciones_log').insert({
                solicitud_id: modalDetalle.id,
                tenant_id: tenantId,
                accion: 'DEVUELTO',
                usuario_id: userId,
                usuario_email: userEmail,
                usuario_rol: 'jefe_sala_hd',
                comentario: comentarioRechazo
            })

            // Crear notificación para Sala HD
            await supabase.from('notificaciones_pendientes').insert({
                tenant_id: tenantId,
                usuario_destino_id: modalDetalle.usuario_id,
                tipo: 'SOLICITUD_DEVUELTA',
                titulo: 'Pedido Devuelto',
                mensaje: `Tu pedido #${modalDetalle.id.slice(0, 8)} fue devuelto. Motivo: ${comentarioRechazo}`,
                solicitud_id: modalDetalle.id
            })

            // Registrar evento de aprendizaje
            analytics?.solicitudDevuelta({
                solicitudId: modalDetalle.id,
                motivo: comentarioRechazo
            })

            // 🧠 APRENDIZAJE IA: Registrar rechazo de productos (baja confianza)
            for (const item of itemsDetalle) {
                await supabase.rpc('actualizar_confianza_producto', {
                    p_tenant_id: tenantId,
                    p_producto_codigo: item.producto_codigo,
                    p_descripcion: item.descripcion,
                    p_cantidad: item.cantidad_solicitada || 1,
                    p_fue_aprobado: false,
                    p_solicitante: modalDetalle.solicitante
                })
            }

            alert('✅ Solicitud devuelta a Sala HD')
            setModalDetalle(null)
            setComentarioRechazo('')
            cargarDatos()

        } catch (e: any) {
            alert('Error: ' + e.message)
        }
        setProcesandoAccion(false)
    }

    // GUARDAR REGLAS DE VALIDACIÓN
    const guardarReglas = async () => {
        if (!nuevaReglaLineas.trim() || !nuevaReglaFiltros.trim()) {
            alert('Debes ingresar los códigos de líneas y filtros')
            return
        }

        setGuardandoReglas(true)
        try {
            const lineas = nuevaReglaLineas.split(',').map(s => s.trim()).filter(Boolean)
            const filtros = nuevaReglaFiltros.split(',').map(s => s.trim()).filter(Boolean)

            // Buscar regla existente
            const reglaExistente = reglas.find(r => r.tipo === 'LINEAS_FILTROS')

            if (reglaExistente) {
                // Actualizar
                const { error } = await supabase
                    .from('reglas_validacion')
                    .update({
                        configuracion: { lineas, filtros },
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', reglaExistente.id)

                if (error) throw error
            } else {
                // Crear nueva
                const { error } = await supabase
                    .from('reglas_validacion')
                    .insert({
                        tenant_id: tenantId,
                        nombre: 'Líneas igual a Filtros',
                        tipo: 'LINEAS_FILTROS',
                        configuracion: { lineas, filtros },
                        mensaje_error: 'La cantidad de líneas debe ser igual a la cantidad de filtros',
                        activo: true,
                        created_by: userId
                    })

                if (error) throw error
            }

            alert('✅ Reglas guardadas correctamente')
            await cargarReglas(tenantId)

        } catch (e: any) {
            alert('Error: ' + e.message)
        }
        setGuardandoReglas(false)
    }

    // IMPRIMIR
    const handlePrint = () => {
        window.print()
    }

    if (loading) return <div className="p-10 text-center">Cargando Panel de Supervisión...</div>

    return (
        <>
            <style jsx global>{styles}</style>
            <div className={`app-container ${darkMode ? 'dark-mode' : ''} ${currentTheme}`}>

                {/* SIDEBAR */}
                <aside className="sidebar no-print">
                    <div className="p-6">
                        <h1 className="text-xl font-bold text-white mb-2">DialyStock</h1>
                        <p className="text-white/60 text-sm">Jefe Sala HD</p>
                    </div>
                    <nav className="mt-4">
                        <button className={`sidebar-link relative ${activeTab === 'aprobaciones' ? 'active' : ''}`} onClick={() => { setActiveTab('aprobaciones'); setNotificacionesNoLeidas(0); }}>
                            <ClipboardList size={20} /> Aprobaciones
                            {solicitudesPendientes.length > 0 && (
                                <span className="badge-notify">{solicitudesPendientes.length}</span>
                            )}
                        </button>
                        <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                            <LayoutDashboard size={20} /> Resumen
                        </button>
                        <button className={`sidebar-link ${activeTab === 'solicitudes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitudes')}>
                            <FileText size={20} /> Historial
                        </button>
                        <button className={`sidebar-link ${activeTab === 'configuracion' ? 'active' : ''}`} onClick={() => setActiveTab('configuracion')}>
                            <Settings size={20} /> Configuración Reglas
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
                    <div className="flex justify-between items-center mb-8 bg-[var(--bg-primary)] p-4 rounded-xl shadow-sm border border-[var(--border-color)] no-print">
                        <div>
                            <h2 className="text-2xl font-bold">Panel de Jefe HD</h2>
                            <p className="text-[var(--text-secondary)]">Aprobación de Solicitudes</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {notificacionesNoLeidas > 0 && (
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                    {notificacionesNoLeidas} nuevas
                                </span>
                            )}
                            <button className="p-2 rounded-full hover:bg-[var(--bg-secondary)]" onClick={() => setDarkMode(!darkMode)}>
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 no-print">
                        <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                            <div className="stat-icon" style={{ background: 'var(--warning)' }}><ClipboardList /></div>
                            <div>
                                <h3 className="text-2xl font-bold">{stats.pendientes}</h3>
                                <p className="text-sm opacity-70">Pendientes Revisión</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                            <div className="stat-icon" style={{ background: 'var(--danger)' }}><RotateCcw /></div>
                            <div>
                                <h3 className="text-2xl font-bold">{stats.devueltas}</h3>
                                <p className="text-sm opacity-70">Devueltas</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <div className="stat-icon" style={{ background: 'var(--primary)' }}><FileText /></div>
                            <div>
                                <h3 className="text-2xl font-bold">{stats.solicitudes_mes}</h3>
                                <p className="text-sm opacity-70">Total Solicitudes</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                            <div className="stat-icon" style={{ background: 'var(--success)' }}><CheckCircle2 /></div>
                            <div>
                                <h3 className="text-2xl font-bold">{solicitudes.filter(s => s.estado_aprobacion === 'aprobado').length}</h3>
                                <p className="text-sm opacity-70">Aprobadas</p>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}

                    {/* TAB APROBACIONES */}
                    {activeTab === 'aprobaciones' && (
                        <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl">📋 Solicitudes Pendientes de Aprobación</h3>
                                <button onClick={() => cargarSolicitudesPendientes(tenantId)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                                    🔄 Actualizar
                                </button>
                            </div>

                            {solicitudesPendientes.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No hay solicitudes pendientes de revisión</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {solicitudesPendientes.map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-secondary)] transition">
                                            <div>
                                                <span className="font-bold text-lg text-[var(--primary)]">Solicitud #{s.id.slice(0, 8)}</span>
                                                <div className="text-sm text-[var(--text-secondary)] mt-1">
                                                    <span className="mr-4">👤 {s.solicitante}</span>
                                                    <span>📅 {new Date(s.created_at).toLocaleString()}</span>
                                                </div>
                                                {s.observacion_general && (
                                                    <div className="text-sm text-blue-600 mt-1">
                                                        💬 {s.observacion_general}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
                                                onClick={() => verDetalleSolicitud(s)}
                                            >
                                                <Eye size={18} /> Revisar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                            <h3 className="font-bold mb-4">Últimos Movimientos</h3>
                            {solicitudes.length === 0 ? <p className="text-gray-500">No hay actividad reciente.</p> : (
                                <div className="space-y-4">
                                    {solicitudes.slice(0, 10).map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-3 border-b border-[var(--border-color)]">
                                            <div>
                                                <span className="font-bold block">Solicitud #{s.id.slice(0, 8)}</span>
                                                <span className="text-sm opacity-60">{new Date(s.created_at).toLocaleDateString()} - {s.solicitante}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    s.estado_aprobacion === 'pendiente_revision' ? 'bg-yellow-100 text-yellow-800' :
                                                    s.estado_aprobacion === 'aprobado' ? 'bg-green-100 text-green-800' :
                                                    s.estado_aprobacion === 'devuelto' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {s.estado_aprobacion === 'pendiente_revision' ? '⏳ En Revisión' :
                                                     s.estado_aprobacion === 'aprobado' ? '✅ Aprobado' :
                                                     s.estado_aprobacion === 'devuelto' ? '↩️ Devuelto' :
                                                     s.estado_aprobacion || s.estado}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB HISTORIAL */}
                    {activeTab === 'solicitudes' && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Solicitante</th>
                                        <th>Estado</th>
                                        <th>Aprobación</th>
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
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    s.estado_aprobacion === 'pendiente_revision' ? 'bg-blue-100 text-blue-800' :
                                                    s.estado_aprobacion === 'aprobado' ? 'bg-green-100 text-green-800' :
                                                    s.estado_aprobacion === 'devuelto' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {s.estado_aprobacion || '-'}
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

                    {/* TAB CONFIGURACIÓN REGLAS */}
                    {activeTab === 'configuracion' && (
                        <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                            <h3 className="font-bold text-xl mb-6">⚙️ Configuración de Reglas de Validación</h3>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <h4 className="font-bold text-blue-800 mb-2">📌 Regla: Líneas = Filtros</h4>
                                <p className="text-sm text-blue-700">
                                    Esta regla valida que la cantidad total de LÍNEAS sea igual a la cantidad total de FILTROS antes de enviar un pedido.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-bold mb-2">Códigos de LÍNEAS</label>
                                    <p className="text-sm text-[var(--text-secondary)] mb-2">Separa los códigos con comas (ej: D009937, D009936)</p>
                                    <textarea
                                        className="w-full p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] h-24"
                                        placeholder="D009937, D009936"
                                        value={nuevaReglaLineas}
                                        onChange={e => setNuevaReglaLineas(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Códigos de FILTROS</label>
                                    <p className="text-sm text-[var(--text-secondary)] mb-2">Separa los códigos con comas (ej: D009888, D009889)</p>
                                    <textarea
                                        className="w-full p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] h-24"
                                        placeholder="D009888, D009889, D009890"
                                        value={nuevaReglaFiltros}
                                        onChange={e => setNuevaReglaFiltros(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-4">
                                <button
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                                    onClick={guardarReglas}
                                    disabled={guardandoReglas}
                                >
                                    <Save size={18} />
                                    {guardandoReglas ? 'Guardando...' : 'Guardar Reglas'}
                                </button>
                            </div>

                            {/* Mostrar reglas actuales */}
                            {reglas.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="font-bold mb-4">Reglas Configuradas</h4>
                                    <div className="space-y-2">
                                        {reglas.map(r => (
                                            <div key={r.id} className="p-3 bg-[var(--bg-secondary)] rounded-lg flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold">{r.nombre}</span>
                                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${r.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {r.activo ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-[var(--text-secondary)]">{r.tipo}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB REPORTES */}
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
                    <div className="footer-credits text-center py-6 border-t border-slate-100 opacity-80 no-print" style={{ marginTop: 'auto' }}>
                        <div className="footer-credits">
                            💻 <strong>Sistema desarrollado por Manuel Madrid</strong> |
                            DialyStock © 2025 |
                            <a
                                href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, soy el Jefe HD y necesito soporte con DialyStock.')}`}
                                target="_blank"
                                className="ml-2 text-emerald-400 font-bold hover:underline"
                            >
                                Soporte WhatsApp: +57 304 578 8873
                            </a>
                        </div>
                    </div>
                </main >
            </div >

            {/* MODAL DETALLE/APROBACIÓN SOLICITUD */}
            {modalDetalle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 print:bg-white print:static print:p-0">
                    <div className="bg-[var(--bg-primary)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 print:shadow-none print:rounded-none print:max-w-none">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white no-print">
                            <div>
                                <h3 className="text-xl font-bold">📋 Revisión de Solicitud #{modalDetalle.id.slice(0, 8)}</h3>
                                <p className="text-white/80 text-sm">Solicitado por: {modalDetalle.solicitante} | {new Date(modalDetalle.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="p-2 hover:bg-white/20 rounded-full transition" title="Imprimir">
                                    <Printer size={20} />
                                </button>
                                <button onClick={() => setModalDetalle(null)} className="p-2 hover:bg-white/20 rounded-full transition">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Área imprimible */}
                        <div ref={printRef} className="print-area">
                            {/* Header para impresión - visible solo al imprimir */}
                            <div className="print-header hidden print:block">
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                                    DialyStock - Solicitud de Pedido
                                </h2>
                                <div className="print-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div className="print-info-item">
                                        <strong>Solicitud:</strong> #{modalDetalle.id.slice(0, 8)}
                                    </div>
                                    <div className="print-info-item">
                                        <strong>Fecha:</strong> {new Date(modalDetalle.created_at).toLocaleString()}
                                    </div>
                                    <div className="print-info-item">
                                        <strong>Solicitante:</strong> {modalDetalle.solicitante}
                                    </div>
                                    <div className="print-info-item">
                                        <strong>Área:</strong> {modalDetalle.area || 'Sala HD'}
                                    </div>
                                    {modalDetalle.paciente && (
                                        <div className="print-info-item" style={{ gridColumn: 'span 2' }}>
                                            <strong>Paciente:</strong> {modalDetalle.paciente}
                                        </div>
                                    )}
                                </div>
                                {modalDetalle.observacion_general && (
                                    <div className="print-obs-general" style={{ marginTop: '15px', padding: '10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '5px' }}>
                                        <strong>Observación General:</strong>
                                        <p style={{ margin: '5px 0 0 0' }}>{modalDetalle.observacion_general}</p>
                                    </div>
                                )}
                            </div>

                            {/* Observación general - visible en pantalla */}
                            {modalDetalle.observacion_general && (
                                <div className="p-4 bg-blue-50 border-b border-blue-100 print:hidden">
                                    <span className="font-bold text-blue-800">Observación General:</span>
                                    <p className="text-blue-700">{modalDetalle.observacion_general}</p>
                                </div>
                            )}

                            <div className="p-6 max-h-[50vh] overflow-y-auto print:max-h-none print:overflow-visible">
                                <table className="w-full text-sm">
                                    <thead className="text-[var(--text-secondary)] border-b-2 border-[var(--border-color)]">
                                        <tr>
                                            <th className="pb-3 text-left">#</th>
                                            <th className="pb-3 text-left">Código</th>
                                            <th className="pb-3 text-left">Producto</th>
                                            <th className="pb-3 text-center">Cantidad</th>
                                            <th className="pb-3 text-left">Observación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]">
                                        {itemsDetalle.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-[var(--bg-secondary)] transition">
                                                <td className="py-3 text-[var(--text-secondary)]">{idx + 1}</td>
                                                <td className="py-3 font-mono text-sm">{item.producto_codigo}</td>
                                                <td className="py-3">{item.descripcion}</td>
                                                <td className="py-3 text-center font-bold text-lg">{item.cantidad_solicitada}</td>
                                                <td className="py-3 text-[var(--text-secondary)] italic">{item.observacion || '-'}</td>
                                            </tr>
                                        ))}
                                        {itemsDetalle.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">Cargando productos...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between text-sm">
                                    <span className="font-bold">Total de productos: {itemsDetalle.length}</span>
                                    <span className="font-bold">Total unidades: {itemsDetalle.reduce((sum, i) => sum + (i.cantidad_solicitada || 0), 0)}</span>
                                </div>

                                {/* Pie de página para impresión */}
                                <div className="hidden print:block mt-8 pt-4 border-t-2 border-gray-400">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span>DialyStock © 2025</span>
                                        <span>Impreso: {new Date().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acciones de aprobación (solo para pendientes) */}
                        {modalDetalle.estado_aprobacion === 'pendiente_revision' && (
                            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] no-print">
                                <div className="mb-4">
                                    <label className="block font-bold mb-2 text-red-600">
                                        ⚠️ Motivo de Devolución (obligatorio si rechaza)
                                    </label>
                                    <textarea
                                        className="w-full p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] h-20"
                                        placeholder="Escriba el motivo por el cual devuelve este pedido..."
                                        value={comentarioRechazo}
                                        onChange={e => setComentarioRechazo(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setModalDetalle(null)}
                                        className="px-6 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition"
                                        disabled={procesandoAccion}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={devolverSolicitud}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2"
                                        disabled={procesandoAccion}
                                    >
                                        <RotateCcw size={18} />
                                        {procesandoAccion ? 'Procesando...' : 'Devolver a Sala HD'}
                                    </button>
                                    <button
                                        onClick={aprobarSolicitud}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2"
                                        disabled={procesandoAccion}
                                    >
                                        <CheckCircle2 size={18} />
                                        {procesandoAccion ? 'Procesando...' : 'Aprobar y Enviar a Farmacia'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Info para solicitudes ya procesadas */}
                        {modalDetalle.estado_aprobacion !== 'pendiente_revision' && (
                            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] no-print">
                                <div className="flex items-center gap-4">
                                    {modalDetalle.estado_aprobacion === 'aprobado' && (
                                        <span className="flex items-center gap-2 text-green-600 font-bold">
                                            <CheckCircle2 size={20} /> Aprobado
                                        </span>
                                    )}
                                    {modalDetalle.estado_aprobacion === 'devuelto' && (
                                        <div>
                                            <span className="flex items-center gap-2 text-orange-600 font-bold">
                                                <RotateCcw size={20} /> Devuelto
                                            </span>
                                            {modalDetalle.comentario_jefe && (
                                                <p className="text-sm text-orange-700 mt-1">Motivo: {modalDetalle.comentario_jefe}</p>
                                            )}
                                        </div>
                                    )}
                                    <span className="ml-auto text-sm text-[var(--text-secondary)]">
                                        {modalDetalle.fecha_revision && `Revisado: ${new Date(modalDetalle.fecha_revision).toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => setModalDetalle(null)}
                                        className="px-6 py-2 bg-[var(--text-secondary)] text-white rounded-lg font-bold hover:opacity-90 transition"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
