'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    LucideLogOut, LucideCheckCircle2,
    LucideSearch, LucideTrash, LucideMoon, LucideSun, LucideLayoutTemplate
} from 'lucide-react'
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics'

interface Producto {
    id: string
    codigo: string
    descripcion: string
    categoria: string
}

interface Solicitud {
    id: string
    created_at: string
    estado: string
    solicitante: string
    paciente: string
    completado_por?: string
}

interface Template {
    id: string
    nombre: string
    contenido: any[]
}

// --- ESTILOS DEL USUARIO (Sistema PD V3.1) ---
const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --primary: #00c9ff;
      --secondary: #92fe9d;
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --text-primary: #495057;
      --text-secondary: #6c757d;
      --border-color: #dee2e6;
    }
    
    body.dark-mode {
      --bg-primary: #1a1a2e;
      --bg-secondary: #16213e;
      --text-primary: #eaeaea;
      --text-secondary: #a0a0a0;
      --border-color: #2d3748;
    }
    
    .pd-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      min-height: 100vh;
      padding: 20px;
      padding-bottom: 60px;
      transition: all 0.3s;
    }
    
    .container-card {
      max-width: 1800px;
      margin: 0 auto;
      background: var(--bg-primary);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 30px;
      text-align: center;
      position: relative;
    }
    
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    
    .header-actions {
      position: absolute; top: 20px; right: 20px; display: flex; gap: 10px;
    }
    
    .icon-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.2); border: 2px solid white; color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 18px; transition: all 0.3s;
    }
    
    .icon-btn:hover { background: white; color: var(--primary); transform: scale(1.1); }
    
    .nav-tabs { display: flex; background: var(--bg-secondary); border-bottom: 2px solid var(--border-color); }
    
    .nav-tab {
      flex: 1; padding: 20px; text-align: center; cursor: pointer;
      border: none; background: transparent; font-size: 16px; font-weight: 500;
      color: var(--text-secondary); transition: all 0.3s;
    }
    
    .nav-tab:hover { background: var(--bg-primary); color: var(--text-primary); }
    
    .nav-tab.active {
      background: var(--bg-primary); color: var(--primary);
      border-bottom: 3px solid var(--primary);
    }
    
    .content-area { padding: 30px; background: var(--bg-primary); color: var(--text-primary); min-height: 500px; }
    
    .form-section {
      background: var(--bg-secondary); padding: 25px; border-radius: 15px; margin-bottom: 30px;
    }
    
    .filter-buttons { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    
    .filter-btn {
      padding: 10px 20px; border: 2px solid var(--border-color); border-radius: 20px;
      background: var(--bg-primary); color: var(--text-primary); cursor: pointer;
      font-size: 14px; font-weight: 500; transition: all 0.3s;
    }
    
    .filter-btn:hover { border-color: var(--primary); background: rgba(0, 201, 255, 0.1); }
    
    .filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
    
    .btn {
      padding: 12px 24px; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-warning { background: #ffc107; color: #000; }
    .btn-danger { background: #dc3545; color: white; }
    
    .productos-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-top: 20px;
    }
    
    .producto-card {
      background: var(--bg-primary); border: 2px solid var(--border-color);
      border-radius: 10px; padding: 15px; transition: all 0.3s; cursor: pointer;
    }
    
    .producto-card:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    
    .producto-card.selected {
      border-color: var(--primary);
      background: linear-gradient(135deg, rgba(0, 201, 255, 0.1) 0%, rgba(146, 254, 157, 0.1) 100%);
    }
    
    .cantidad-control { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
    
    .cantidad-btn {
      width: 32px; height: 32px; border-radius: 50%;
      border: 2px solid var(--primary); background: var(--bg-primary); color: var(--primary);
      font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .cantidad-btn:hover { background: var(--primary); color: white; }
    
    .cantidad-input {
      width: 60px; text-align: center; padding: 6px;
      border: 2px solid var(--border-color); border-radius: 6px; font-weight: bold;
      background: var(--bg-primary); color: var(--text-primary);
    }
    
    .form-control { width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
    
    /* Modals */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 1000; overflow-y: auto; display: flex; align-items: center; justify-content: center;
    }
    .modal-content {
      background: var(--bg-primary); padding: 30px;
      border-radius: 15px; width: 90%; max-width: 600px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    
    /* Footer */
    .footer-credits {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: rgba(0,0,0,0.9); color: white;
      padding: 5px; text-align: center; font-size: 11px;
      z-index: 9999; backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
`

export default function SalaPDPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('nueva')
    const [darkMode, setDarkMode] = useState(false)

    // User Data
    const [tenantId, setTenantId] = useState('')
    const [userId, setUserId] = useState('')
    const [userName, setUserName] = useState('')

    // Data
    const [productos, setProductos] = useState<Producto[]>([])
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [templates, setTemplates] = useState<Template[]>([])

    // NEW Order State
    const [solicitante, setSolicitante] = useState('')
    const [paciente, setPaciente] = useState('')
    const [categoriaActual, setCategoriaActual] = useState('Todos')
    const [busqueda, setBusqueda] = useState('')
    const [carrito, setCarrito] = useState<{ [key: string]: any }>({}) // { codigo: { codigo, descripcion, cantidad, observacion } }

    // Modals
    const [modalTemplatesOpen, setModalTemplatesOpen] = useState(false)
    const [modalGuardarTemplateOpen, setModalGuardarTemplateOpen] = useState(false)
    const [nombreTemplate, setNombreTemplate] = useState('')
    const [modalDetalleOpen, setModalDetalleOpen] = useState<any>(null)

    // Analytics - Aprendizaje automático
    const analyticsContext = useMemo(() => ({
        tenantId,
        userId,
        userName,
        userRole: 'sala_pd'
    }), [tenantId, userId, userName])
    const { eventos: analytics } = useLearningAnalytics(analyticsContext.tenantId ? analyticsContext : null)

    // INIT
    useEffect(() => {
        // Inject styles
        const styleSheet = document.createElement("style")
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

        // DarkMode Persist
        const savedMode = localStorage.getItem('pd_darkMode') === 'true'
        setDarkMode(savedMode)

        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/'); return }
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (!profile || profile.role !== 'sala_pd') {
                router.push('/')
                return
            }
            setTenantId(profile.tenant_id)
            setUserId(user.id)
            setUserName(profile.nombre || '')
            setSolicitante(profile.nombre || '') // Default solicitante
            await loadInitialData(profile.tenant_id, user.id)
            setLoading(false)
        }

        init()
        return () => { document.head.removeChild(styleSheet) }
    }, [router])

    const toggleDarkMode = () => {
        const newMode = !darkMode
        setDarkMode(newMode)
        localStorage.setItem('pd_darkMode', String(newMode))
    }

    const loadInitialData = async (tid: string, uid: string) => {
        try {
            const [prodsRes, solsRes, tempsRes] = await Promise.all([
                supabase.from('productos').select('*').eq('tenant_id', tid).in('categoria', ['PD', 'Dispositivos', 'Quimico', 'Todos']),
                supabase.from('solicitudes').select('*').eq('tenant_id', tid).eq('usuario_id', uid).eq('area', 'Sala PD').order('created_at', { ascending: false }),
                supabase.from('templates').select('*').eq('tenant_id', tid).eq('tipo', 'PD')
            ])

            if (prodsRes.data) setProductos(prodsRes.data)
            if (solsRes.data) setSolicitudes(solsRes.data)
            if (tempsRes.data) setTemplates(tempsRes.data)
        } catch (err) {
            console.error('Error cargando datos iniciales:', err)
        }
    }

    // --- LOGIC ---

    const actualizarCantidad = (prod: Producto, delta: number) => {
        setCarrito(prev => {
            const current = prev[prod.codigo]
            const newQty = (current?.cantidad || 0) + delta

            if (newQty <= 0) {
                const copy = { ...prev }
                delete copy[prod.codigo]
                return copy
            }

            return {
                ...prev,
                [prod.codigo]: {
                    ...current,
                    codigo: prod.codigo,
                    descripcion: prod.descripcion,
                    cantidad: newQty,
                    observacion: current?.observacion || ''
                }
            }
        })
    }

    const setCantidadDirecta = (prod: Producto, val: string | number) => {
        const qty = Number(val) || 0
        setCarrito(prev => {
            if (qty <= 0) {
                const copy = { ...prev }
                delete copy[prod.codigo]
                return copy
            }
            return {
                ...prev,
                [prod.codigo]: {
                    codigo: prod.codigo, descripcion: prod.descripcion,
                    cantidad: qty, observacion: prev[prod.codigo]?.observacion || ''
                }
            }
        })
    }

    const setObservacion = (code: string, text: string) => {
        setCarrito(prev => ({
            ...prev,
            [code]: { ...prev[code], observacion: text }
        }))
    }

    const limpiarFormulario = () => {
        setCarrito({})
        setPaciente('')
        setSolicitante(userName)
    }

    const enviarSolicitud = async () => {
        if (!solicitante.trim()) return alert('Nombre Solicitante requerido')
        const items = Object.values(carrito)
        if (items.length === 0) return alert('No hay productos seleccionados')

        if (!confirm(`¿Enviar solicitud con ${items.length} productos?`)) return

        try {
            const id = crypto.randomUUID()
            // 1. Create Solicitud
            const { error: solError } = await supabase.from('solicitudes').insert({
                id,
                tenant_id: tenantId,
                usuario_id: userId,
                estado: 'Pendiente',
                tipo: 'PD',
                area: 'Sala PD',
                solicitante,
                paciente: paciente || '',
                fecha: new Date().toISOString()
            })
            if (solError) throw solError

            // 2. Create Items
            const itemsData = items.map((i: any) => ({
                solicitud_id: id,
                tenant_id: tenantId,
                producto_codigo: i.codigo,
                descripcion: i.descripcion,
                cantidad_solicitada: i.cantidad,
                observacion: i.observacion
            }))

            const { error: itemsError } = await supabase.from('solicitudes_items').insert(itemsData)
            if (itemsError) throw itemsError

            // 📊 Registrar evento de aprendizaje
            analytics?.solicitudCreada({
                solicitudId: id,
                productos: items.length,
                tipo: 'PD'
            })

            alert('✅ Solicitud PD enviada')
            limpiarFormulario()
            // Reload requests
            const { data } = await supabase.from('solicitudes').select('*').eq('tenant_id', tenantId).eq('usuario_id', userId).eq('area', 'Sala PD').order('created_at', { ascending: false })
            if (data) setSolicitudes(data)
            setActiveTab('solicitudes')

        } catch (e: any) {
            alert('Error: ' + e.message)
        }
    }

    // --- TEMPLATES LOGIC ---
    const guardarTemplate = async () => {
        if (!nombreTemplate.trim()) return alert('Nombre requerido')
        const items = Object.values(carrito)
        if (items.length === 0) return alert('Carrito vacío')

        try {
            await supabase.from('templates').insert({
                tenant_id: tenantId,
                usuario_id: userId,
                nombre: nombreTemplate,
                tipo: 'PD',
                contenido: items
            })
            alert('Template guardado')
            setModalGuardarTemplateOpen(false)
            // Reload templates
            const { data } = await supabase.from('templates').select('*').eq('tenant_id', tenantId).eq('tipo', 'PD')
            if (data) setTemplates(data)
        } catch (e: any) { alert(e.message) }
    }

    const cargarTemplate = (t: any) => {
        const newCart: any = {}
        t.contenido.forEach((i: any) => {
            newCart[i.codigo] = i
        })
        setCarrito(newCart)
        alert(`Template "${t.nombre}" cargado`)
        setModalTemplatesOpen(false)
    }

    // --- RENDER HELPERS ---
    const getFilteredProducts = () => {
        return productos.filter(p => {
            const matchCat = categoriaActual === 'Todos' || p.categoria === categoriaActual
            const matchSearch = p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase())
            return matchCat && matchSearch
        })
    }

    const renderProductos = () => {
        const filtered = getFilteredProducts()
        return (
            <div className="productos-grid">
                {filtered.map(p => {
                    const inCart = carrito[p.codigo]
                    const qty = inCart?.cantidad || 0
                    return (
                        <div key={p.id} className={`producto-card ${qty > 0 ? 'selected' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-blue-500">{p.codigo}</span>
                                {qty > 0 && <span className="bg-blue-500 text-white rounded-full px-2 text-xs">{qty}</span>}
                            </div>
                            <div className="text-sm text-gray-500 mb-2 h-10 overflow-hidden">{p.descripcion}</div>

                            <div className="cantidad-control">
                                <button className="cantidad-btn" onClick={() => actualizarCantidad(p, -1)}>-</button>
                                <input className="cantidad-input" type="number" value={qty} onChange={(e) => setCantidadDirecta(p, Number(e.target.value))} />
                                <button className="cantidad-btn" onClick={() => actualizarCantidad(p, 1)}>+</button>
                            </div>

                            {qty > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <input
                                        className="form-control text-xs"
                                        placeholder="Observación..."
                                        value={inCart?.observacion || ''}
                                        onChange={(e) => setObservacion(p.codigo, e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
                {filtered.length === 0 && <div className="col-span-full text-center p-10 text-gray-400">No se encontraron productos</div>}
            </div>
        )
    }

    if (loading) return <div className="flex justify-center items-center h-screen font-bold">Cargando Sistema PD...</div>

    return (
        <div className="pd-container" style={darkMode ? { background: '#1a1a2e' } : {}}>
            <div className={`container-card ${darkMode ? 'dark-mode' : ''}`}>
                <div className="header">
                    <div className="header-actions">
                        <button className="icon-btn" onClick={() => setModalTemplatesOpen(true)} title="Templates"><LucideLayoutTemplate /></button>
                        <button className="icon-btn" onClick={toggleDarkMode} title="Modo Oscuro/Claro">{darkMode ? <LucideSun /> : <LucideMoon />}</button>
                        <button className="icon-btn" onClick={() => router.push('/')} title="Salir"><LucideLogOut /></button>
                    </div>
                    <h1>💧 DialyStock PD - Peritoneal</h1>
                    <p>Gestión de Solicitudes y Pedidos</p>
                </div>

                <div className="nav-tabs">
                    <button className={`nav-tab ${activeTab === 'nueva' ? 'active' : ''}`} onClick={() => setActiveTab('nueva')}>📝 Nueva Solicitud</button>
                    <button className={`nav-tab ${activeTab === 'solicitudes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitudes')}>📋 Mis Solicitudes</button>
                    <button className={`nav-tab ${activeTab === 'completadas' ? 'active' : ''}`} onClick={() => setActiveTab('completadas')}>✅ Completadas</button>
                </div>

                <div className="content-area">
                    {activeTab === 'nueva' && (
                        <div>
                            <div className="form-section">
                                <h3 className="text-xl font-bold mb-4">📝 Información</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="font-bold block mb-1">Solicitante</label>
                                        <input className="form-control" value={solicitante} onChange={e => setSolicitante(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="font-bold block mb-1">Paciente</label>
                                        <input className="form-control" value={paciente} onChange={e => setPaciente(e.target.value)} placeholder="Opcional" />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button className="btn btn-warning" onClick={() => setModalTemplatesOpen(true)}>📋 Cargar Template</button>
                                    <button className="btn btn-secondary" onClick={() => setModalGuardarTemplateOpen(true)}>💾 Guardar Template Actual</button>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="text-xl font-bold mb-4">📦 Selección Productos</h3>
                                <div className="filter-buttons">
                                    {['Todos', 'PD', 'Dispositivos', 'Quimico'].map(cat => (
                                        <button key={cat} className={`filter-btn ${categoriaActual === cat ? 'active' : ''}`} onClick={() => setCategoriaActual(cat)}>
                                            {cat === 'Todos' ? '🔍' : cat === 'PD' ? '💧' : cat === 'Dispositivos' ? '🔧' : '⚗️'} {cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative mb-4">
                                    <LucideSearch className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input className="form-control pl-10" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                </div>

                                {renderProductos()}
                            </div>

                            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 sticky bottom-4 shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">📋 Resumen: {Object.keys(carrito).length} productos</h3>
                                    <div className="flex gap-2">
                                        <button className="btn btn-secondary" onClick={limpiarFormulario}><LucideTrash size={16} /> Limpiar</button>
                                        <button className="btn btn-primary" onClick={enviarSolicitud} disabled={Object.keys(carrito).length === 0}><LucideCheckCircle2 size={16} /> Enviar Solicitud</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'solicitudes' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Mis Solicitudes Pendientes</h2>
                            {solicitudes.filter(s => s.estado === 'Pendiente').length === 0 ? <div className="text-center p-10 text-gray-400">No hay solicitudes pendientes</div> :
                                solicitudes.filter(s => s.estado === 'Pendiente').map(s => (
                                    <div key={s.id} className="bg-white p-4 rounded-lg shadow mb-2 border border-l-4 border-l-yellow-400">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="font-bold">Solicitud #{s.id.slice(0, 6)}</div>
                                                <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleString()}</div>
                                                {s.paciente && <div className="text-sm font-semibold text-blue-600">Paciente: {s.paciente}</div>}
                                            </div>
                                            <span className="badge bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pendiente</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {activeTab === 'completadas' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Historial Completadas</h2>
                            {solicitudes.filter(s => s.estado === 'Completado').length === 0 ? <div className="text-center p-10 text-gray-400">No hay historial</div> :
                                solicitudes.filter(s => s.estado === 'Completado').map(s => (
                                    <div key={s.id} className="bg-white p-4 rounded-lg shadow mb-2 border border-l-4 border-l-green-400">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="font-bold">Solicitud #{s.id.slice(0, 6)}</div>
                                                <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleString()}</div>
                                                <div className="text-sm text-green-600 font-bold">Completado por: {s.completado_por}</div>
                                            </div>
                                            <span className="badge bg-green-100 text-green-800 px-2 py-1 rounded">Completado</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TEMPLATES */}
            {modalTemplatesOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="flex justify-between mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg">📋 Cargar Template</h3>
                            <button onClick={() => setModalTemplatesOpen(false)}>&times;</button>
                        </div>
                        {templates.length === 0 ? <p>No hay templates guardados.</p> :
                            templates.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                    <span>{t.nombre}</span>
                                    <button className="btn btn-success btn-sm" onClick={() => cargarTemplate(t)}>Cargar</button>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR TEMPLATE */}
            {modalGuardarTemplateOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="font-bold text-lg mb-4">💾 Guardar Template</h3>
                        <input className="form-control mb-4" placeholder="Nombre del Template" value={nombreTemplate} onChange={e => setNombreTemplate(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <button className="btn btn-secondary" onClick={() => setModalGuardarTemplateOpen(false)}>Cancelar</button>
                            <button className="btn btn-success" onClick={guardarTemplate}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="footer-credits text-center py-6 border-t border-slate-100 opacity-80">
                💻 <strong>Sistema desarrollado por Manuel Madrid</strong> |
                DialyStock © 2025 |
                <a
                    href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, soy de la sala PD y necesito soporte con DialyStock.')}`}
                    target="_blank"
                    className="ml-2 text-emerald-400 font-bold hover:underline"
                >
                    Soporte WhatsApp: +57 304 578 8873
                </a>
            </div>
        </div>
    )
}
