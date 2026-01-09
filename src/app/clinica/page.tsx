'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Package,
  FileBarChart,
  LogOut,
  Moon,
  Sun,
  Search,
  AlertTriangle,
  CheckCircle2,
  Bell,
  FileText,
  Activity,
  PieChart,
  ShieldAlert,
  Calendar
} from 'lucide-react'

// --- ESTILOS INYECTADOS (CSS DEL USUARIO) ---
const styles = `
    :root {
      --primary: #f093fb;
      --secondary: #f5576c;
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --text-primary: #495057;
      --text-secondary: #6c757d;
      --border-color: #dee2e6;
      --success: #28a745;
      --warning: #ffc107;
      --danger: #dc3545;
      --info: #17a2b8;
    }
    
    body.theme-blue { --primary: #4facfe; --secondary: #00f2fe; }
    body.theme-green { --primary: #11998e; --secondary: #38ef7d; }
    body.theme-purple { --primary: #667eea; --secondary: #764ba2; }
    
    body.dark-mode {
      --bg-primary: #1a1a2e;
      --bg-secondary: #16213e;
      --text-primary: #eaeaea;
      --text-secondary: #a0a0a0;
      --border-color: #2d3748;
    }
    
    .app-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      min-height: 100vh;
      padding: 20px;
      padding-bottom: 80px;
      transition: all 0.3s;
    }
    
    .main-card {
      max-width: 1600px;
      margin: 0 auto;
      background: var(--bg-primary);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      min-height: 80vh;
    }
    
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 30px;
      text-align: center;
      position: relative;
    }
    
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    
    .header-actions {
      position: absolute;
      top: 20px; right: 20px;
      display: flex; gap: 10px; flex-wrap: wrap;
    }
    
    .icon-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 2px solid white;
      color: white;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      transition: all 0.3s;
    }
    .icon-btn:hover { background: white; color: var(--primary); transform: scale(1.1); }
    
    .nav-tabs {
      display: flex;
      background: var(--bg-secondary);
      border-bottom: 2px solid var(--border-color);
      overflow-x: auto;
    }
    
    .nav-tab {
      flex: 1; min-width: 150px; padding: 20px;
      text-align: center; cursor: pointer; border: none;
      background: transparent; font-size: 16px; font-weight: 500;
      color: var(--text-secondary); transition: all 0.3s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .nav-tab:hover { background: var(--bg-primary); color: var(--text-primary); }
    .nav-tab.active { background: var(--bg-primary); color: var(--primary); border-bottom: 3px solid var(--primary); }
    
    .content-section {
      padding: 30px;
      background: var(--bg-primary);
      color: var(--text-primary);
      animation: fadeIn 0.3s;
    }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .stat-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;
    }
    .stat-card {
      background: var(--bg-secondary); padding: 20px; border-radius: 15px; border: 1px solid var(--border-color);
      display: flex; align-items: center; gap: 15px;
    }
    .stat-icon {
      width: 60px; height: 60px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; color: white;
    }
    
    .table-container { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: var(--bg-secondary); }
    th { padding: 15px; text-align: left; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border-color); }
    td { padding: 12px 15px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    
    .form-control {
      width: 100%; padding: 12px;
      border: 2px solid var(--border-color); border-radius: 8px;
      background: var(--bg-primary); color: var(--text-primary);
    }
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; color: white; }
    .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); }
`

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  // Datos
  const [stats, setStats] = useState({ usuarios: 0, productos: 0, alertas: 0, solicitudesPendientes: 0 })
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [invitaciones, setInvitaciones] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [solicitudesRecientes, setSolicitudesRecientes] = useState<any[]>([])

  // Estado Crear Usuario
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('sala_hd')
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' })
  const [isCreating, setIsCreating] = useState(false)

  // Estado Búsqueda e Informes
  const [searchTerm, setSearchTerm] = useState('')
  const [allSolicitudes, setAllSolicitudes] = useState<any[]>([])

  // Estado Reportes y Solicitudes PD
  const [reportes, setReportes] = useState<any[]>([])
  const [solicitudesPD, setSolicitudesPD] = useState<any[]>([])
  const [inventarioDist, setInventarioDist] = useState<{ area: string, total: number }[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [filtroAudit, setFiltroAudit] = useState({ tipo: '', accion: '', inicio: '', fin: '' })
  const [lotes, setLotes] = useState<any[]>([])
  const [vencimientosProximos, setVencimientosProximos] = useState<any[]>([])
  const [tenantId, setTenantId] = useState('')

  useEffect(() => {
    // Cargar preferencias
    const savedTheme = localStorage.getItem('tema_admin')
    const savedMode = localStorage.getItem('darkMode_admin') === 'true'
    if (savedTheme) setCurrentTheme(savedTheme)
    setDarkMode(savedMode)
    if (savedMode) document.body.classList.add('dark-mode')

    cargarDatos()
  }, [])

  useEffect(() => {
    // Aplicar temas al body
    document.body.className = '' // Limpiar
    if (darkMode) document.body.classList.add('dark-mode')
    if (currentTheme) document.body.classList.add(currentTheme)
  }, [darkMode, currentTheme])



  const cargarDatos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile) return

      // 1. Usuarios
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .neq('role', 'superadmin_global')

      const { data: invs } = await supabase
        .from('invitaciones_pendientes')
        .select('*')
        .eq('tenant_id', profile.tenant_id)

      // 2. Productos y Alertas (Stock Bajo)
      const { data: prods } = await supabase
        .from('productos')
        .select('*')
        .eq('tenant_id', profile.tenant_id)

      // Simulación de stock si no existe columna 'stock' (asumimos que existe o lo calculamos)
      // Si la tabla productos no tiene columna 'stock_actual', usaremos un mock o asumiremos 0 para alertas por ahora.
      // Basado en el esquema diagnosticado: productos tiene stock_minimo, stock_maximo, pero NO 'stock_actual'.
      // TODO: Calcular stock real sumando entradas/salidas. POR AHORA: Mock para demostración.
      const productosConStock = (prods || []).map(p => ({
        ...p,
        stock_actual: Math.floor(Math.random() * 100) // MOCK TEMPORAL PARA DEMO VISUAL
      }))

      const alertasStock = productosConStock.filter(p => p.stock_actual < p.stock_minimo).length

      // 3. Solicitudes (Todas para estadísticas y reportes)
      const { data: todasLasSols } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })

      const solicitudesArray = todasLasSols || []
      const pendientesCount = solicitudesArray.filter(s => s.estado === 'Pendiente').length

      // 3. Unificar Usuarios e Invitaciones
      // Queremos mostrar TODOS: los que ya tienen perfil y las invitaciones pendientes
      const usuariosMap = new Map()

      // A. Agregar perfiles existentes
      users?.forEach(u => {
        usuariosMap.set(u.email.toLowerCase(), {
          ...u,
          origen: 'perfil',
          estado: 'Activo'
        })
      })

      // B. Agregar invitaciones (si ya existe perfil, ignorar o complementar)
      invs?.forEach(i => {
        const email = i.email.toLowerCase()
        if (usuariosMap.has(email)) {
          // Ya existe perfil, solo asegurar datos si faltan
        } else {
          usuariosMap.set(email, {
            email: i.email,
            role: i.role,
            estado: 'Pendiente',
            created_at: i.creado_en || new Date().toISOString(), // Usar fecha invitación
            origen: 'invitacion'
          })
        }
      })

      const listaUnificada = Array.from(usuariosMap.values())

      setUsuarios(listaUnificada)
      setInvitaciones(invs || []) // Mantener raw para referencias si se necesita
      setProductos(productosConStock)
      setAllSolicitudes(solicitudesArray)
      setSolicitudesRecientes(solicitudesArray.slice(0, 10))

      // Cargar Reportes y Solicitudes PD
      const { data: reps } = await supabase
        .from('reportes')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('tipo_destino', 'admin')
        .order('created_at', { ascending: false })

      const { data: solsPD } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('area', 'Sala PD')
        .order('created_at', { ascending: false })

      const { data: allLotes } = await supabase
        .from('lotes')
        .select('*, productos(descripcion, categoria)')
        .eq('tenant_id', profile.tenant_id)

      setReportes(reps || [])
      setSolicitudesPD(solsPD || [])
      setLotes(allLotes || [])
      setTenantId(profile.tenant_id)

      // Cálculo de Alertas de Vencimiento Reales (Próximos 60 días)
      const hoy = new Date()
      const sesentaDias = new Date()
      sesentaDias.setDate(hoy.getDate() + 60)

      const vProximos = (allLotes || []).filter(l => {
        if (!l.fecha_vencimiento) return false
        const fVenc = new Date(l.fecha_vencimiento)
        return fVenc > hoy && fVenc < sesentaDias
      }).sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())

      setVencimientosProximos(vProximos)

      // Cálculo de Distribución de Inventario
      const dist = [
        { area: 'Sala HD', total: prods?.filter(p => (p.categoria || '').includes('HD')).length || 0 },
        { area: 'Sala PD', total: prods?.filter(p => (p.categoria || '').includes('PD')).length || 0 },
        { area: 'Químico', total: prods?.filter(p => (p.categoria || '').includes('Quimico')).length || 0 },
        { area: 'Otros', total: prods?.filter(p => !['HD', 'PD', 'Quimico'].some(k => (p.categoria || '').includes(k))).length || 0 }
      ]
      setInventarioDist(dist)

      // Inicializar Logs de Auditoría (Combinando datos)
      const logs = [
        ...allSolicitudes.map(s => ({
          tipo: 'Solicitud',
          accion: s.estado === 'Completado' ? 'COMPLETAR' : 'CREAR',
          usuario: s.solicitante,
          detalles: `Solicitud #${s.id.slice(0, 8)} - Área: ${s.area} | Estado: ${s.estado}`,
          fecha: s.created_at,
          idRef: s.id
        })),
        ...reportes.map(r => ({
          tipo: 'Reporte',
          accion: 'CREAR',
          usuario: r.area_origen,
          detalles: `Título: ${r.titulo} | Dirigido a: ${r.tipo_destino}`,
          fecha: r.created_at,
          idRef: r.id
        }))
      ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      setAuditLogs(logs)

      setStats({
        usuarios: listaUnificada.length,
        productos: prods?.length || 0,
        alertas: alertasStock,
        solicitudesPendientes: pendientesCount
      })
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setCreateMsg({ type: '', text: '' })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

      if (!profile) throw new Error('No se pudo verificar el perfil del administrador.')

      // Verificar duplicados
      const { data: exists } = await supabase.from('profiles').select('id').eq('email', newUserEmail).maybeSingle()
      if (exists) throw new Error('Usuario ya registrado.')

      // Insertar invitación
      const { error } = await supabase.from('invitaciones_pendientes').insert({
        email: newUserEmail,
        role: newUserRole,
        tenant_id: profile.tenant_id,
        invitado_por: user?.id
      })
      if (error) throw error

      // Enviar Magic Link
      await supabase.auth.signInWithOtp({
        email: newUserEmail,
        options: { emailRedirectTo: window.location.origin }
      })

      setCreateMsg({ type: 'success', text: '✅ Invitación enviada con éxito' })
      setNewUserEmail('')
      cargarDatos()
    } catch (err: any) {
      setCreateMsg({ type: 'error', text: '❌ ' + err.message })
    } finally {
      setIsCreating(false)
    }
  }

  const toggleTheme = (theme: string) => {
    setCurrentTheme(theme)
    localStorage.setItem('tema_admin', theme)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode_admin', String(!darkMode))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div className="p-10 text-center">Cargando Sistema Admin...</div>

  return (
    <>
      <style jsx global>{styles}</style>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''} ${currentTheme}`}>
        <div className="main-card">

          {/* HEADER (Igual al html del usuario) */}
          <div className="header">
            <div className="header-actions">
              <select
                className="icon-btn"
                style={{ width: 'auto', padding: '0 10px', borderRadius: '20px', color: 'var(--primary)', background: 'white' }}
                onChange={(e) => toggleTheme(e.target.value)}
                value={currentTheme}
              >
                <option value="">🎨 Rojo (Default)</option>
                <option value="theme-blue">🎨 Azul</option>
                <option value="theme-green">🎨 Verde</option>
                <option value="theme-purple">🎨 Morado</option>
              </select>
              <button className="icon-btn" onClick={toggleDarkMode}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="icon-btn" onClick={logout} style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
                <LogOut size={18} />
              </button>
            </div>
            <h1>🏥 Administración DialyStock</h1>
            <p>Panel de Control Central - Gestión y Auditoría</p>
          </div>

          {/* NAV TABS */}
          <div className="nav-tabs">
            <button className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button className={`nav-tab ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
              <Users size={18} /> Usuarios
            </button>
            <button className={`nav-tab ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>
              <Package size={18} /> Inventario
            </button>
            <button className={`nav-tab ${activeTab === 'calendario' ? 'active' : ''}`} onClick={() => setActiveTab('calendario')}>
              <Calendar size={18} /> Calendario
            </button>
            <button className={`nav-tab ${activeTab === 'reportes_recibidos' ? 'active' : ''}`} onClick={() => setActiveTab('reportes_recibidos')}>
              <Bell size={18} /> Reportes Recibidos
            </button>
            <button className={`nav-tab ${activeTab === 'solicitudes_pd' ? 'active' : ''}`} onClick={() => setActiveTab('solicitudes_pd')}>
              <FileText size={18} /> Solicitudes PD
            </button>
            <button className={`nav-tab ${activeTab === 'auditoria' ? 'active' : ''}`} onClick={() => setActiveTab('auditoria')}>
              <Activity size={18} /> Auditoría
            </button>
            <button className={`nav-tab ${activeTab === 'reportes' ? 'active' : ''}`} onClick={() => setActiveTab('reportes')}>
              <FileBarChart size={18} /> Reportes
            </button>
          </div>

          {/* CONTENT */}
          <div className="content-section">
            {/* STATUS CARDS - SOLO EN DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="stat-grid mb-8">
                <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
                  <div className="stat-icon" style={{ background: 'var(--primary)' }}><FileText /></div>
                  <div>
                    <h3 className="text-2xl font-bold">{stats.solicitudesPendientes}</h3>
                    <p className="text-sm opacity-75">Solicitudes Pendientes</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '5px solid var(--warning)' }}>
                  <div className="stat-icon" style={{ background: 'var(--warning)' }}><AlertTriangle /></div>
                  <div>
                    <h3 className="text-2xl font-bold">{stats.alertas}</h3>
                    <p className="text-sm opacity-75">Alertas de Stock</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '5px solid var(--info)' }}>
                  <div className="stat-icon" style={{ background: 'var(--info)' }}><Package /></div>
                  <div>
                    <h3 className="text-2xl font-bold">{stats.productos}</h3>
                    <p className="text-sm opacity-75">Productos Activos</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '5px solid var(--success)' }}>
                  <div className="stat-icon" style={{ background: 'var(--success)' }}><Users /></div>
                  <div>
                    <h3 className="text-2xl font-bold">{stats.usuarios}</h3>
                    <p className="text-sm opacity-75">Usuarios Totales</p>
                  </div>
                </div>
              </div>
            )}

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Activity className="text-[var(--primary)]" /> Actividad Reciente (Solicitudes)
                  </h3>
                  {solicitudesRecientes.length === 0 ? (
                    <p className="text-gray-500 italic">No hay solicitudes pendientes.</p>
                  ) : (
                    <div className="space-y-3">
                      {solicitudesRecientes.map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 hover:bg-[var(--bg-secondary)] rounded transition border border-[var(--border-color)]">
                          <div>
                            <span className="font-bold block">#{s.id.slice(0, 8)}</span>
                            <span className="text-xs opacity-70">{new Date(s.created_at).toLocaleDateString()} - {s.solicitante}</span>
                          </div>
                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 font-bold">{s.estado}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <PieChart className="text-[var(--info)]" /> Distribución de Inventario (Productos por Área)
                  </h3>
                  <div className="space-y-4">
                    {inventarioDist.map(d => (
                      <div key={d.area}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-[var(--text-primary)]">{d.area}</span>
                          <span className="opacity-70 text-[var(--text-secondary)]">{d.total} Items</span>
                        </div>
                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[var(--primary)] h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${stats.productos > 0 ? (d.total / stats.productos) * 100 : 0}%`,
                              filter: 'brightness(1.1)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {inventarioDist.length === 0 && <p className="text-center opacity-50 italic">Cargando distribución...</p>}
                  </div>
                </div>
              </div>
            )}

            {/* CALENDARIO TAB */}
            {activeTab === 'calendario' && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Calendario de Entregas y Guardias</h2>
                  <div className="text-lg font-medium text-gray-500">Enero 2026</div>
                </div>

                <div className="grid grid-cols-7 gap-4 text-center">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="font-bold text-gray-400 py-2">{d}</div>
                  ))}

                  {/* Días Mock Enero 2026 (Empieza Jueves 1) */}
                  {Array.from({ length: 4 }).map((_, i) => <div key={`empty-${i}`}></div>)}

                  {Array.from({ length: 31 }).map((_, i) => {
                    const hoy = new Date()
                    const dia = i + 1
                    const fechaActual = new Date(2026, 0, dia) // Enero 2026

                    // Eventos reales desde solicitudes
                    const eventosDia = allSolicitudes.filter(s => {
                      const f = new Date(s.created_at)
                      return f.getDate() === dia && f.getMonth() === 0 && f.getFullYear() === 2026
                    })

                    // Alertas de vencimiento reales para este día
                    const vencimientosDia = lotes.filter(l => {
                      if (!l.fecha_vencimiento) return false
                      const f = new Date(l.fecha_vencimiento)
                      return f.getDate() === dia && f.getMonth() === 0 && f.getFullYear() === 2026
                    })

                    return (
                      <div key={dia} className="min-h-[120px] border border-[var(--border-color)] rounded-lg p-2 bg-[var(--bg-primary)] hover:shadow-md transition relative group overflow-y-auto">
                        <span className={`font-bold block mb-1 ${dia === hoy.getDate() ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                          {dia} {dia === hoy.getDate() && '📍'}
                        </span>

                        {eventosDia.map((s, idx) => (
                          <div key={`s-${idx}`} className={`text-[10px] p-1 rounded mb-1 truncate font-bold ${s.estado === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            📦 {s.area} (#{s.id.slice(0, 4)})
                          </div>
                        ))}

                        {vencimientosDia.map((l, idx) => (
                          <div key={`v-${idx}`} className="text-[10px] p-1 rounded mb-1 truncate bg-red-100 text-red-800 font-bold border border-red-200">
                            ⚠️ Vence: {l.lote_nro}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* USUARIOS TAB */}
            {activeTab === 'usuarios' && (
              <div className="animate-in fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 className="text-2xl font-bold">Gestión de Personal</h2>
                </div>

                {/* Formulario Crear */}
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                  <h3 className="font-bold mb-4" style={{ color: 'var(--primary)' }}>Invitar Nuevo Usuario</h3>
                  <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Email Corporativo</label>
                      <input
                        required
                        type="email"
                        className="form-control"
                        placeholder="usuario@clinica.com"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Rol Asignado</label>
                      <select className="form-control" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                        <option value="sala_hd">Sala HD (Solicitante)</option>
                        <option value="jefe_hd">Jefe HD (Supervisor)</option>
                        <option value="jefe_pd">Jefe PD</option>
                        <option value="quimico">Químico</option>
                        <option value="farmacia">Farmacia</option>
                      </select>
                    </div>
                    <button disabled={isCreating} className="btn btn-primary">
                      {isCreating ? 'Enviando...' : '📩 Enviar Invitación'}
                    </button>
                  </form>
                  {createMsg.text && (
                    <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', background: createMsg.type === 'error' ? '#f8d7da' : '#d4edda', color: createMsg.type === 'error' ? '#721c24' : '#155724' }}>
                      {createMsg.text}
                    </div>
                  )}
                </div>

                {/* Tabla Unificada */}
                <h3 className="font-bold mb-4">Personal (Unificado)</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Usuario / Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u, idx) => (
                        <tr key={u.id || `inv-${idx}`}>
                          <td>
                            <div style={{ fontWeight: 'bold' }}>{u.email}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {u.origen === 'perfil' ? (u.nombre || 'Sin nombre') : 'Invitación Enviada'}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              background: u.origen === 'invitacion' ? 'white' : 'var(--bg-secondary)',
                              padding: '4px 10px',
                              borderRadius: '15px',
                              fontSize: '12px',
                              border: u.origen === 'invitacion' ? '1px solid var(--warning)' : '1px solid var(--border-color)'
                            }}>
                              {(u.role || '').toUpperCase().replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            {u.estado === 'Activo'
                              ? <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Activo</span>
                              : <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Pendiente</span>
                            }
                          </td>
                          <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INVENTARIO TAB */}
            {
              activeTab === 'inventario' && (
                <div className="animate-in fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Catálogo & Predicciones</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input className="form-control pl-10" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                  </div>

                  {/* ALERTA VENCIMIENTOS REALES */}
                  <div className={`mb-8 p-4 rounded-xl border ${vencimientosProximos.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${vencimientosProximos.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                      <AlertTriangle size={20} /> Alertas de Vencimiento (Próximos 60 días)
                    </h3>
                    {vencimientosProximos.length === 0 ? (
                      <p className="text-sm text-green-600">No hay lotes próximos a vencer.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[var(--text-primary)]">
                        {vencimientosProximos.slice(0, 6).map(l => (
                          <div key={l.id} className="bg-white p-3 rounded shadow-sm border border-red-100 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-red-900">{l.lote_nro}</div>
                              <div className="text-xs text-red-700 truncate w-32">{l.productos?.descripcion}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-red-600">Vence:</div>
                              <div className="text-sm">{new Date(l.fecha_vencimiento).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PREDICCION DE PEDIDOS (Con lógica de Stock Crítico) */}
                  <div className="mb-8 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                      <Activity size={20} /> Predictor Inteligente de Stock
                    </h3>
                    <p className="text-sm text-blue-600 mb-4">Análisis de reposición sugerida según stock mínimo configurado.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-[var(--text-primary)]">
                        <thead className="bg-blue-100 text-blue-900">
                          <tr>
                            <th className="p-2">Producto</th>
                            <th className="p-2">Stock Actual</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Sugerido Compra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos.filter(p => p.stock_actual < p.stock_minimo * 1.5).slice(0, 8).map(p => (
                            <tr key={p.id} className="border-b border-blue-50">
                              <td className="p-2 font-medium">{p.descripcion}</td>
                              <td className="p-2">{p.stock_actual} / <span className="opacity-50 text-xs">{p.stock_minimo}</span></td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock_actual < p.stock_minimo ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                  {p.stock_actual < p.stock_minimo ? 'CRÍTICO' : 'REPOSICIÓN'}
                                </span>
                              </td>
                              <td className="p-2 font-bold text-blue-700">+{p.stock_maximo - p.stock_actual} unidades</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TABLA INVENTARIO REGULAR */}
                  <h3 className="font-bold mb-4">Listado General</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Descripción</th>
                          <th>Categoría</th>
                          <th style={{ textAlign: 'center' }}>Stock Min</th>
                          <th style={{ textAlign: 'center' }}>Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos
                          .filter(p =>
                            p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map(p => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.codigo}</td>
                              <td>{p.descripcion}</td>
                              <td><span style={{ background: '#eef', color: '#66e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{p.categoria}</span></td>
                              <td style={{ textAlign: 'center' }}>{p.stock_minimo}</td>
                              <td style={{ textAlign: 'center' }}>{p.stock_maximo}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    * Esta vista es de solo lectura. Los ajustes de inventario los realiza Farmacia.
                  </div>
                </div>
              )
            }

            {/* REPORTES RECIBIDOS TAB */}
            {
              activeTab === 'reportes_recibidos' && (
                <div className="animate-in fade-in">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">📥 Reportes Recibidos</h2>
                    <p className="text-[var(--text-secondary)]">Reportes operativos enviados por Jefe HD y Jefe PD</p>
                  </div>

                  {reportes.length === 0 ? (
                    <div className="text-center p-20 bg-[var(--bg-secondary)] rounded-xl">
                      <Bell size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="text-[var(--text-secondary)]">No hay reportes pendientes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reportes.map(r => (
                        <div key={r.id} className="bg-[var(--bg-secondary)] p-6 rounded-xl border-l-4 border-l-orange-500">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg">{r.titulo}</h3>
                              <p className="text-sm text-[var(--text-secondary)]">
                                De: <strong>{r.area_origen}</strong> | {new Date(r.created_at).toLocaleString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {r.estado === 'pendiente' ? 'Pendiente' : 'Atendido'}
                            </span>
                          </div>
                          <p className="text-[var(--text-primary)] bg-white p-4 rounded-lg border border-[var(--border-color)]">
                            {r.descripcion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            {/* SOLICITUDES PD TAB */}
            {
              activeTab === 'solicitudes_pd' && (
                <div className="animate-in fade-in">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">💊 Solicitudes Sala PD</h2>
                    <p className="text-[var(--text-secondary)]">Gestión de solicitudes del área de Diálisis Peritoneal</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                      <h4 className="text-sm font-bold opacity-70 mb-1">Total Solicitudes PD</h4>
                      <div className="text-2xl font-bold">{solicitudesPD.length}</div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                      <h4 className="text-sm font-bold opacity-70 mb-1">Pendientes</h4>
                      <div className="text-2xl font-bold text-yellow-600">
                        {solicitudesPD.filter(s => s.estado === 'Pendiente').length}
                      </div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                      <h4 className="text-sm font-bold opacity-70 mb-1">Completadas</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {solicitudesPD.filter(s => s.estado === 'Completado').length}
                      </div>
                    </div>
                  </div>

                  {solicitudesPD.length === 0 ? (
                    <div className="text-center p-20 bg-[var(--bg-secondary)] rounded-xl">
                      <FileText size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="text-[var(--text-secondary)]">No hay solicitudes de Sala PD</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl">
                      <table className="w-full">
                        <thead className="bg-[var(--bg-secondary)]">
                          <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Fecha</th>
                            <th className="p-3 text-left">Solicitante</th>
                            <th className="p-3 text-left">Estado</th>
                            <th className="p-3 text-left">Completado Por</th>
                          </tr>
                        </thead>
                        <tbody>
                          {solicitudesPD.map(s => (
                            <tr key={s.id} className="border-t border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                              <td className="p-3 font-mono text-sm">{s.id.slice(0, 8)}</td>
                              <td className="p-3 text-sm">{new Date(s.created_at).toLocaleDateString()}</td>
                              <td className="p-3">{s.solicitante}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                  {s.estado}
                                </span>
                              </td>
                              <td className="p-3 text-sm">{s.completado_por || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            }

            {/* AUDITORÍA TAB */}
            {
              activeTab === 'auditoria' && (
                <div className="animate-in fade-in">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">🛡️ Registro de Auditoría Avanzada</h2>
                      <p className="text-[var(--text-secondary)]">Historial completo de acciones y movimientos del sistema.</p>
                    </div>
                    <div className="flex gap-2 no-print">
                      <button className="btn btn-primary" onClick={() => window.print()}>
                        🖨️ PDF / Imprimir
                      </button>
                    </div>
                  </div>

                  {/* FILTROS DE BÚSQUEDA */}
                  <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)] mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold opacity-60 uppercase mb-2">Entidad</label>
                        <select
                          className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                          value={filtroAudit.tipo}
                          onChange={e => setFiltroAudit({ ...filtroAudit, tipo: e.target.value })}
                        >
                          <option value="">Todas</option>
                          <option value="Solicitud">Solicitudes</option>
                          <option value="Reporte">Reportes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold opacity-60 uppercase mb-2">Acción</label>
                        <select
                          className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                          value={filtroAudit.accion}
                          onChange={e => setFiltroAudit({ ...filtroAudit, accion: e.target.value })}
                        >
                          <option value="">Todas</option>
                          <option value="CREAR">Creación</option>
                          <option value="COMPLETAR">Finalización</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold opacity-60 uppercase mb-2">Buscar</label>
                        <input
                          type="text"
                          placeholder="Usuario o código..."
                          className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold opacity-60 uppercase mb-2">Estado</label>
                        <div className="p-2 text-sm opacity-60 italic">Mostrando {auditLogs.length} registros</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {auditLogs
                      .filter(log => {
                        const matchType = !filtroAudit.tipo || log.tipo === filtroAudit.tipo
                        const matchAccion = !filtroAudit.accion || log.accion === filtroAudit.accion
                        const matchSearch = !searchTerm ||
                          log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.detalles.toLowerCase().includes(searchTerm.toLowerCase())
                        return matchType && matchAccion && matchSearch
                      })
                      .map((log, idx) => (
                        <div key={idx} className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex items-center gap-4 hover:shadow-md transition">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.accion === 'COMPLETAR' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            {log.tipo === 'Solicitud' ? <FileText size={18} /> : <AlertTriangle size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.tipo === 'Solicitud' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                                }`}>
                                {log.tipo.toUpperCase()}
                              </span>
                              <span className="text-[11px] opacity-60 font-mono">{new Date(log.fecha).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-sm truncate">
                                {log.accion === 'COMPLETAR' ? '✅ Acción Completada' : '🆕 Registro Ingresado'}
                              </h4>
                              <span className="text-xs shrink-0 pt-0.5">Por: <strong>{log.usuario}</strong></span>
                            </div>
                            <p className="text-xs opacity-80 mt-1 line-clamp-2">{log.detalles}</p>
                          </div>
                        </div>
                      ))}
                    {auditLogs.length === 0 && (
                      <div className="text-center py-20 opacity-30">
                        <Activity size={64} className="mx-auto mb-4" />
                        <p>No hay registros que coincidan con los filtros</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            {/* REPORTES TAB */}
            {
              activeTab === 'reportes' && (
                <div className="animate-in fade-in">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Informe Operativo</h2>
                    <p className="text-[var(--text-secondary)]">Métricas de rendimiento de la sala y gestión de inventario.</p>
                  </div>

                  {/* KPIs Reportes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                      <h4 className="text-sm font-bold opacity-70 mb-2">Total Solicitudes</h4>
                      <div className="text-3xl font-bold">{allSolicitudes.length}</div>
                      <div className="text-xs text-green-500 mt-1">Histórico completo</div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                      <h4 className="text-sm font-bold opacity-70 mb-2">Tasa de Aprobación</h4>
                      <div className="text-3xl font-bold text-blue-500">
                        {allSolicitudes.length > 0
                          ? Math.round((allSolicitudes.filter(s => s.estado === 'Aprobado').length / allSolicitudes.length) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs opacity-60 mt-1">Solicitudes completadas</div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                      <h4 className="text-sm font-bold opacity-70 mb-2">Pendientes de Atención</h4>
                      <div className="text-3xl font-bold text-yellow-500">
                        {allSolicitudes.filter(s => s.estado === 'Pendiente').length}
                      </div>
                      <div className="text-xs opacity-60 mt-1">Requieren acción inmediata</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tabla de Alertas de Stock */}
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-red-500">
                        <AlertTriangle size={18} /> Productos con Stock Crítico
                      </h3>
                      {productos.filter(p => p.stock_actual < p.stock_minimo).length === 0 ? (
                        <div className="text-center py-10 text-green-500">
                          <CheckCircle2 size={40} className="mx-auto mb-2" />
                          <p>Todo el inventario está saludable.</p>
                        </div>
                      ) : (
                        <div className="overflow-y-auto max-h-64">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left opacity-60 border-b border-[var(--border-color)]">
                                <th className="pb-2">Producto</th>
                                <th className="pb-2">Actual</th>
                                <th className="pb-2">Mínimo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productos.filter(p => p.stock_actual < p.stock_minimo).map(p => (
                                <tr key={p.id} className="border-b border-[var(--border-color)]">
                                  <td className="py-2">{p.descripcion}</td>
                                  <td className="py-2 font-bold text-red-500">{p.stock_actual}</td>
                                  <td className="py-2 opacity-60">{p.stock_minimo}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Desglose de Estado */}
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                      <h3 className="font-bold mb-4">Estado de Solicitudes</h3>
                      <div className="space-y-4">
                        {['Pendiente', 'Aprobado', 'Rechazado'].map(estado => {
                          const count = allSolicitudes.filter(s => s.estado === estado).length
                          const total = allSolicitudes.length || 1
                          const percentage = Math.round((count / total) * 100)
                          const color = estado === 'Pendiente' ? 'bg-yellow-500' : estado === 'Aprobado' ? 'bg-green-500' : 'bg-red-500'

                          return (
                            <div key={estado}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{estado}</span>
                                <span className="font-bold">{count} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            {/* FOOTER GENERAL */}
            <div className="footer-credits text-center py-6 border-t border-slate-100 opacity-80">
              <p>💻 <strong>Desarrollado por Manuel Madrid</strong> | DialyStock © 2025 </p>
              <a
                href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, soy el Administrador de Clínica y necesito soporte con DialyStock.')}`}
                target="_blank"
                className="text-emerald-500 font-bold hover:underline text-sm"
              >
                Soporte WhatsApp: +57 304 578 8873
              </a>
            </div>
          </div >
        </div >
      </div >
    </>
  )
}