'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    LucideLayoutDashboard,
    LucideLogOut,
    LucideShoppingCart,
    LucideClipboardList,
    LucideHistory,
    LucideSearch,
    LucidePlus,
    LucideTrash,
    LucideSave,
    LucideEye,
    LucideCheckCircle2,
    LucideAlertTriangle,
    LucideCopy,
    LucideMoon,
    LucideSun,
    LucideBell
} from 'lucide-react'

// --- ESTILOS ORIGINALES INYECTADOS ---
const styles = `
    :root {
      --primary: #f093fb; --secondary: #f5576c; --bg-primary: #ffffff; --bg-secondary: #f8f9fa;
      --text-primary: #495057; --text-secondary: #6c757d; --border-color: #dee2e6;
      --success: #28a745; --warning: #ffc107; --danger: #dc3545; --info: #17a2b8;
    }
    body.theme-blue { --primary: #4facfe; --secondary: #00f2fe; }
    body.theme-green { --primary: #11998e; --secondary: #38ef7d; }
    body.theme-purple { --primary: #667eea; --secondary: #764ba2; }
    body.dark-mode { --bg-primary: #1a1a2e; --bg-secondary: #16213e; --text-primary: #eaeaea; --text-secondary: #a0a0a0; --border-color: #2d3748; }

    .app-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      min-height: 100vh; padding: 20px; padding-bottom: 80px; transition: all 0.3s;
    }
    .main-card {
      max-width: 1600px; margin: 0 auto; background: var(--bg-primary); border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; min-height: 85vh;
    }
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white; padding: 30px; text-align: center; position: relative;
    }
    .header-actions { position: absolute; top: 20px; right: 20px; display: flex; gap: 10px; }
    .icon-btn {
      width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2);
      border: 2px solid white; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;
    }
    .icon-btn:hover { background: white; color: var(--primary); transform: scale(1.1); }
    
    .nav-tabs { display: flex; background: var(--bg-secondary); overflow-x: auto; border-bottom: 2px solid var(--border-color); }
    .nav-tab {
      flex: 1; padding: 20px; text-align: center; cursor: pointer; background: transparent;
      font-weight: 500; color: var(--text-secondary); border: none; min-width: 150px;
    }
    .nav-tab.active { background: var(--bg-primary); color: var(--primary); border-bottom: 3px solid var(--primary); }

    .content-area { padding: 30px; }
    
    .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; color: white; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); }
    .btn-success { background: var(--success); }
    .btn-danger { background: var(--danger); }
    .btn-secondary { background: #6c757d; }
    .btn-info { background: var(--info); }
    
    .form-control { width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
    
    .producto-item { background: var(--bg-secondary); padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex;  justify-content: space-between; align-items: center; }
    .filter-btn { padding: 6px 12px; border: 1px solid var(--border-color); border-radius: 20px; background: var(--bg-primary); cursor: pointer; margin-right: 5px; margin-bottom: 5px; }
    .filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
`

// Constantes (Confirmadas por el usuario)
const LINEAS = ['D009937', 'D009936']
const FILTROS = ['D009888', 'D009889', 'D009890']

export default function SalaHDPage() {
    const router = useRouter()
    // Estados Globales
    const [darkMode, setDarkMode] = useState(false)
    const [theme, setTheme] = useState('')
    const [activeTab, setActiveTab] = useState('nueva')
    const [loading, setLoading] = useState(true)
    const [tenantId, setTenantId] = useState('')
    const [userId, setUserId] = useState('')

    // Data
    const [productos, setProductos] = useState<any[]>([])
    const [misSolicitudes, setMisSolicitudes] = useState<any[]>([])

    // Estado Nueva Solicitud
    const [carrito, setCarrito] = useState<any[]>([])
    const [busqueda, setBusqueda] = useState('')
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
    const [solicitanteNombre, setSolicitanteNombre] = useState('')
    const [productoSeleccionado, setProductoSeleccionado] = useState('')
    const [cantidad, setCantidad] = useState(1)

    // Estados Templates
    const [templates, setTemplates] = useState<any[]>([])
    const [showTemplates, setShowTemplates] = useState(false)

    // Estados Nuevos (Favorites & Drafts)
    const [favoritos, setFavoritos] = useState<string[]>([])
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Sonido Notificación
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3') // Placeholder, usaremos oscilador si falla
            audio.play().catch(() => {
                // Fallback Oscillator
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.frequency.value = 1000
                osc.type = 'sine'
                gain.gain.setValueAtTime(0.1, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5)
                osc.start()
                osc.stop(ctx.currentTime + 0.5)
            })
        } catch (e) { console.error('Audio error', e) }
    }

    useEffect(() => {
        // Cargar config y datos
        const savedTheme = localStorage.getItem('tema_hd')
        const savedMode = localStorage.getItem('darkMode_hd') === 'true'
        if (savedTheme) setTheme(savedTheme)
        setDarkMode(savedMode)

        // Cargar Favoritos
        const savedFavs = localStorage.getItem('favoritos_hd')
        if (savedFavs) setFavoritos(JSON.parse(savedFavs))

        // Cargar Draft Carrito
        const savedDraft = localStorage.getItem('draft_carrito_hd')
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft)
                // Sanear datos corruptos (NaN)
                const saneado = parsed.map((i: any) => ({
                    ...i,
                    cantidad: Number(i.cantidad) || 1
                }))
                setCarrito(saneado)
                console.log('Borrador restaurado (saneado)')
            } catch (e) {
                console.error('Error cargando draft', e)
                localStorage.removeItem('draft_carrito_hd')
            }
        }

        inicializar()

        // REALTIME SUBSCRIPTION (Notificaciones)
        const channel = supabase
            .channel('sala-hd-channel')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'solicitudes',
                filter: `tenant_id=eq.${tenantId || ''}`
            }, (payload: any) => {
                if (payload.new.usuario_id === userId && payload.new.estado === 'Completado' && payload.old.estado !== 'Completado') {
                    // Pedido completado por Farmacia
                    playNotificationSound()
                    alert(`✅ TU PEDIDO #${payload.new.id.slice(0, 6)} ESTÁ LISTO Y COMPLETADO`)
                    cargarHistorial(tenantId, userId)
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [tenantId, userId]) // Re-run if tenantId/userId changes

    // ... (rest of code) ...

    const inicializar = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/'); return }
            setUserId(user.id)

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (!profile) return
            setTenantId(profile.tenant_id)
            setSolicitanteNombre(profile.nombre || profile.email)

            // Cargar productos
            const { data: prods } = await supabase
                .from('productos')
                .select('*')
                .eq('tenant_id', profile.tenant_id)

            setProductos(prods || [])

            // Cargar historial
            cargarHistorial(profile.tenant_id, user.id)

            // Cargar Templates (DEMO: ignoramos tenant_id para ver los insertados por SQL)
            console.log('Cargando templates...')
            const { data: tpls } = await supabase
                .from('templates')
                .select('*')
                // .eq('tenant_id', profile.tenant_id) 
                .eq('tipo', 'HD')

            if (tpls && tpls.length > 0) {
                setTemplates(tpls)
            } else {
                console.log('Cargando templates fallback (User Data)...')
                // FALLBACK REAL (User provided SQL data)
                setTemplates([
                    { id: 'HD-TPL-1', nombre: 'EXTRAMURAL 2 CATETER', fecha_creacion: '2025-12-13T07:51:00', productos_json: [{ "codigo": "D009937", "cantidad": 2, "descripcion": "AV-Set-E" }, { "codigo": "D009888", "cantidad": 2, "descripcion": "DIALIZADOR FX 50" }, { "codigo": "COK2859011", "cantidad": 2, "descripcion": "FREKAFLEX 1000 ML EXPO" }, { "codigo": "D009780", "cantidad": 2, "descripcion": "Bibag 5008 650g" }, { "codigo": "D000637", "cantidad": 2, "descripcion": "BATA MANGA LARGA" }, { "codigo": "DI00060", "cantidad": 2, "descripcion": "GORRO CON ELASTICO" }, { "codigo": "M000065", "cantidad": 2, "descripcion": "HEPARINA SODICA" }] },
                    { id: 'HD-TPL-2', nombre: 'PEDIDO LUNES', fecha_creacion: '2025-12-13T09:24:00', productos_json: [{ "codigo": "D009936", "cantidad": 24, "descripcion": "AV-Set 5008 CorDiax" }, { "codigo": "M008791", "cantidad": 86, "descripcion": "FREKAFLEX 1000 ML" }, { "codigo": "D009904", "cantidad": 31, "descripcion": "Bibag 5008 900g" }, { "codigo": "D009780", "cantidad": 47, "descripcion": "Bibag 5008 650g" }, { "codigo": "D009889", "cantidad": 85, "descripcion": "DIALIZADOR FX 60" }, { "codigo": "D009937", "cantidad": 85, "descripcion": "AV-Set-E" }] },
                    { id: 'HD-TPL-3', nombre: 'PEDIDO JUEVES', fecha_creacion: '2025-12-15T08:06:00', productos_json: [{ "codigo": "D009936", "cantidad": 22 }, { "codigo": "M008791", "cantidad": 83 }, { "codigo": "D009889", "cantidad": 81, "descripcion": "DIALIZADOR FX 60" }, { "codigo": "D009937", "cantidad": 83, "descripcion": "AV-Set-E" }, { "codigo": "D009904", "cantidad": 29 }, { "codigo": "D009780", "cantidad": 47 }] },
                    { id: 'HD-TPL-4', nombre: 'HEPA 3TURNO + PRESTAMO', fecha_creacion: '2025-12-15T11:32:00', productos_json: [{ "codigo": "M000065", "cantidad": 8, "observacion": "hepa 3 turno + 8 prestamo" }, { "codigo": "M008876", "cantidad": 10, "observacion": "EPO 2 TURNO" }] }
                ])
            }
            setLoading(false)
        } catch (e) { console.error(e); setLoading(false) }
    }

    // ... 

    const cargarHistorial = async (tid: string, uid: string) => {
        const { data } = await supabase
            .from('solicitudes')
            .select('*')
            .eq('tenant_id', tid)
            .eq('usuario_id', uid)
            .order('created_at', { ascending: false })
            .limit(50)
        setMisSolicitudes(data || [])
    }

    const avisarSubirPedido = async (solId: string) => {
        if (!confirm('¿Enviar alerta sonora a Farmacia para subir pedido?')) return
        try {
            const channel = supabase.channel('sala-hd-broadcast')
            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'alerta_subir',
                        payload: { id: solId, area: 'Sala HD', solicitante: solicitanteNombre }
                    })
                    alert('🔔 Alerta enviada a Farmacia')
                    supabase.removeChannel(channel)
                }
            })
        } catch (e) { console.error(e); alert('Error enviando alerta') }
    }

    // --- LOGICA DE CARRITO Y FILTROS ---

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase())
        if (!matchBusqueda) return false

        if (categoriaFiltro === 'Todos') return true
        if (categoriaFiltro === 'Lineas') return LINEAS.includes(p.codigo)
        if (categoriaFiltro === 'Filtros') return FILTROS.includes(p.codigo)
        if (categoriaFiltro === 'Suministros') return p.categoria === 'HD' && !LINEAS.includes(p.codigo) && !FILTROS.includes(p.codigo)
        if (categoriaFiltro === 'Dispositivos') return p.categoria === 'Dispositivos'
        if (categoriaFiltro === 'Quimico') return p.categoria === 'Quimico'
        if (categoriaFiltro === 'Favoritos') return favoritos.includes(p.codigo)
        return true
    })

    const toggleFavorito = (codigo: string) => {
        const nuevos = favoritos.includes(codigo)
            ? favoritos.filter(f => f !== codigo)
            : [...favoritos, codigo]
        setFavoritos(nuevos)
        localStorage.setItem('favoritos_hd', JSON.stringify(nuevos))
    }

    const agregarAlCarrito = () => {
        if (!productoSeleccionado) return alert('Selecciona un producto')
        if (cantidad < 1) return alert('Cantidad inválida')

        const prod = productos.find(p => p.codigo === productoSeleccionado)
        if (!prod) return

        // Verificar duplicado
        if (carrito.find(c => c.codigo === prod.codigo)) return alert('Ya está en la lista')

        setCarrito([...carrito, { ...prod, cantidad, observacion: '' }])
        setProductoSeleccionado('')
        setCantidad(1)

        // Auto-scroll al final
        setTimeout(() => {
            const el = document.getElementById('listaProductos')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 100)
    }

    const eliminarDelCarrito = (idx: number) => {
        const nuevo = [...carrito]
        nuevo.splice(idx, 1)
        setCarrito(nuevo)
    }

    const actualizarCarrito = (idx: number, field: string, value: any) => {
        const nuevo = [...carrito]
        if (field === 'cantidad') {
            const val = parseInt(value)
            nuevo[idx][field] = isNaN(val) ? 0 : val
        } else {
            nuevo[idx][field] = value
        }
        setCarrito(nuevo)
    }

    const enviarSolicitud = async () => {
        if (carrito.length === 0) return alert('Carro vacío')
        if (!solicitanteNombre.trim()) return alert('El nombre del solicitante es obligatorio.')

        // Validación cantidades
        const invalidos = carrito.filter(c => !c.cantidad || c.cantidad < 1)
        if (invalidos.length > 0) return alert('Error: Hay productos con cantidad 0 o inválida. Revísalos.')

        if (!confirm('¿Confirmar envío?')) return

        try {
            const newId = crypto.randomUUID()

            // 1. Crear Solicitud
            const { data: sol, error: solError } = await supabase
                .from('solicitudes')
                .insert({
                    id: newId, // Generamos ID manual para evitar error DB
                    tenant_id: tenantId,
                    usuario_id: userId,
                    estado: 'Pendiente',
                    solicitante: solicitanteNombre,
                    area: 'Sala HD',
                    tipo: 'HD',
                    paciente: '-',
                    fecha: new Date().toISOString()
                })
                .select()
                .single()

            if (solError) throw solError

            // 2. Insertar Items
            const items = carrito.map(item => ({
                solicitud_id: sol.id,
                producto_codigo: item.codigo,
                // Asegurar que NO vaya NaN
                cantidad_solicitada: Number(item.cantidad) || 1,
                descripcion: item.descripcion,
                observacion: item.observacion,
                tenant_id: tenantId
            }))

            const { error: itemsError } = await supabase
                .from('solicitudes_items')
                .insert(items)

            if (itemsError) throw itemsError

            alert('✅ Solicitud enviada correctamente #' + sol.id)
            setCarrito([])
            localStorage.removeItem('draft_carrito_hd') // Limpiar draft
            cargarHistorial(tenantId, userId)
            setActiveTab('solicitudes')

        } catch (e: any) {
            console.error('Error detallado:', e)
            alert('Error al enviar solicitud: ' + (e.message || 'Error desconocido'))
            alert('Detalles técnicos (FOTO): ' + JSON.stringify(e, null, 2))
        }
    }

    const duplicarSolicitud = async (solicitudId: string) => {
        // ... (código existente duplicarSolicitud)
        if (!confirm('¿Cargar productos de esta solicitud anterior al carrito actual?')) return

        try {
            const { data: items } = await supabase
                .from('solicitudes_items')
                .select('*')
                .eq('solicitud_id', solicitudId)

            if (items) {
                const nuevosItems = items.map(i => {
                    const original = productos.find(p => p.codigo === i.producto_codigo)
                    return {
                        ...original,
                        codigo: i.producto_codigo,
                        descripcion: i.descripcion,
                        cantidad: i.cantidad_solicitada,
                        observacion: i.observacion || ''
                    }
                })
                setCarrito([...carrito, ...nuevosItems])
                setActiveTab('nueva')
            }
        } catch (e) { console.error(e) }
    }

    const cargarTemplate = (tpl: any) => {
        if (!confirm(`¿Cargar plantilla "${tpl.nombre}"? Esto reemplazará tu carrito actual.`)) return

        // Parsear el JSON del template que viene de la DB
        let items = []
        try {
            if (typeof tpl.productos_json === 'string') {
                items = JSON.parse(tpl.productos_json)
            } else {
                items = tpl.productos_json
            }
        } catch (e) {
            console.error('Error parseando JSON de template', e)
            return alert('Error al cargar la plantilla: Formato inválido')
        }

        // Mapear y validar contra productos activos
        // En template DB structure: {codigo, cantidad, descripcion, observacion}
        const nuevosItems = items.map((i: any) => {
            // Buscamos el producto en el catálogo actual para tener precio, desc, etc actualizados
            const prodOriginal = productos.find(p => p.codigo === i.codigo)
            if (!prodOriginal) return null // Producto no existe o inactivo
            return {
                ...prodOriginal, // Traer data del catálogo (categoria, etc)
                codigo: i.codigo,
                descripcion: i.descripcion || prodOriginal.descripcion,
                cantidad: i.cantidad || 1,
                observacion: i.observacion || ''
            }
        }).filter(Boolean) // Eliminar nulos

        setCarrito(nuevosItems)
        setShowTemplates(false)
    }

    if (loading) return <div className="text-center p-10 font-bold text-gray-500">Cargando Sistema Sala HD...</div>

    return (
        <>
            <style jsx global>{styles}</style>
            <div className={`app-container ${darkMode ? 'dark-mode' : ''} ${theme}`}>
                <div className="main-card">

                    {/* HEADER */}
                    <div className="header">
                        <div className="header-actions">
                            <select className="icon-btn" style={{ width: 'auto', color: 'var(--primary)', background: 'white', padding: '0 10px' }}
                                value={theme} onChange={e => { setTheme(e.target.value); localStorage.setItem('tema_hd', e.target.value) }}>
                                <option value="">Rojo</option>
                                <option value="theme-blue">Azul</option>
                                <option value="theme-green">Verde</option>
                                <option value="theme-purple">Morado</option>
                            </select>
                            <button className="icon-btn" onClick={() => { setDarkMode(!darkMode); localStorage.setItem('darkMode_hd', String(!darkMode)) }}>
                                {darkMode ? <LucideSun size={20} /> : <LucideMoon size={20} />}
                            </button>
                            <button className="icon-btn" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => supabase.auth.signOut().then(() => router.push('/'))}>
                                <LucideLogOut size={20} />
                            </button>
                        </div>
                        <h1>💉 DialyStock HD - Premium</h1>
                        <p>Hemodiálisis - Gestión de Pedidos</p>
                    </div>

                    {/* TABS */}
                    <div className="nav-tabs">
                        <button className={`nav-tab ${activeTab === 'nueva' ? 'active' : ''}`} onClick={() => setActiveTab('nueva')}>
                            <LucidePlus size={18} className="inline mr-2" /> Nueva Solicitud
                        </button>
                        <button className={`nav-tab ${activeTab === 'solicitudes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitudes')}>
                            <LucideHistory size={18} className="inline mr-2" /> Mis Pedidos
                        </button>
                        <button className={`nav-tab ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>
                            <LucideClipboardList size={18} className="inline mr-2" /> Catálogo
                        </button>
                    </div>

                    <div className="content-area">

                        {/* --- SECCION NUEVA SOLICITUD --- */}
                        {activeTab === 'nueva' && (
                            <div className="animate-in fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 className="text-xl font-bold">Crear Pedido</h2>

                                    {/* Botón ver plantillas */}
                                    <div className="flex gap-4 items-center">
                                        <button className="btn btn-info text-sm" onClick={() => setShowTemplates(!showTemplates)}>
                                            <LucideCopy size={16} className="mr-2" /> Cargar Plantilla
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-[var(--text-secondary)]">Solicitante:</span>
                                            <input
                                                className="form-control"
                                                style={{ padding: '5px 10px', width: '200px' }}
                                                value={solicitanteNombre}
                                                onChange={e => setSolicitanteNombre(e.target.value)}
                                                placeholder="Nombre del solicitante"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal/Panel de Plantillas */}
                                {showTemplates && (
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {templates.length === 0 ? <p>No hay plantillas disponibles.</p> :
                                            templates.map(t => (
                                                <div key={t.id} onClick={() => cargarTemplate(t)}
                                                    className="bg-white p-3 rounded shadow-sm cursor-pointer hover:bg-blue-100 transition border border-blue-100">
                                                    <div className="font-bold text-blue-800">{t.nombre}</div>
                                                    <div className="text-xs text-gray-500">{new Date(t.fecha_creacion).toLocaleDateString()}</div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Izquierda: Buscador y Agregar */}
                                    <div className="lg:col-span-1">
                                        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '15px', position: 'sticky', top: '20px' }}>
                                            <h3 className="font-bold mb-4">Agregar Producto</h3>

                                            {/* Filtros Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {['Todos', 'Lineas', 'Filtros', 'Suministros', 'Favoritos'].map(cat => (
                                                    <button key={cat}
                                                        className={`filter-btn ${categoriaFiltro === cat ? 'active' : ''}`}
                                                        onClick={() => setCategoriaFiltro(cat)}
                                                    >
                                                        {cat === 'Favoritos' ? '⭐ Favoritos' : cat}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mb-4">
                                                <input ref={searchInputRef} className="form-control" placeholder="🔍 Buscar... (Ctrl+K)"
                                                    value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                            </div>

                                            <div className="mb-4">
                                                <select className="form-control" size={8} style={{ height: '200px' }}
                                                    value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
                                                    {productosFiltrados.map(p => (
                                                        <option key={p.id} value={p.codigo}>
                                                            {favoritos.includes(p.codigo) ? '⭐' : ''} {p.codigo} - {p.descripcion}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex gap-2 mb-4">
                                                <input type="number" className="form-control" min="1" value={cantidad}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value)
                                                        setCantidad(isNaN(val) ? 0 : val)
                                                    }} style={{ width: '80px', textAlign: 'center' }} />
                                                <button className="btn btn-primary flex-grow justify-center" onClick={agregarAlCarrito}>
                                                    <LucideShoppingCart size={18} /> Agregar
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Derecha: Lista Carrito */}
                                    <div className="lg:col-span-2" id="listaProductos">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <h3 className="font-bold">Productos en la lista ({carrito.length})</h3>
                                            <button onClick={() => setCarrito([])} className="text-red-500 text-sm hover:underline">Limpiar Todo</button>
                                        </div>

                                        {carrito.length === 0 ? (
                                            <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
                                                <LucideShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>Tu lista está vacía. Agrega productos desde el panel izquierdo.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {carrito.map((item, idx) => (
                                                    <div key={idx} className="producto-item">
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-[var(--primary)]">{item.codigo}</span>
                                                                <span className="text-sm text-[var(--text-primary)]">{item.descripcion}</span>
                                                            </div>
                                                            <input type="text" placeholder="Observación (opcional)..."
                                                                className="form-control"
                                                                style={{ fontSize: '12px', padding: '5px', width: '80%' }}
                                                                value={item.observacion || ''}
                                                                onChange={e => actualizarCarrito(idx, 'observacion', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="text-center">
                                                                <label className="text-xs block text-gray-500">Cant.</label>
                                                                <input type="number" className="form-control" style={{ width: '60px', padding: '5px', textAlign: 'center' }}
                                                                    value={item.cantidad}
                                                                    onChange={e => actualizarCarrito(idx, 'cantidad', parseInt(e.target.value))}
                                                                />
                                                            </div>
                                                            <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => eliminarDelCarrito(idx)}>
                                                                <LucideTrash size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {carrito.length > 0 && (
                                            <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end gap-4">
                                                <button className="btn btn-secondary" onClick={() => setCarrito([])}>Cancelar</button>
                                                <button className="btn btn-success" onClick={enviarSolicitud}>
                                                    ✅ Confirmar y Enviar Pedido
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SECCION MIS PEDIDOS --- */}
                        {activeTab === 'solicitudes' && (
                            <div className="animate-in fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Historial de Solicitudes</h2>
                                    <button className="btn btn-primary" onClick={() => cargarHistorial(tenantId, userId)}>🔄 Actualizar</button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
                                    <table className="w-full text-left">
                                        <thead style={{ background: 'var(--bg-secondary)' }}>
                                            <tr>
                                                <th className="p-4 border-b border-[var(--border-color)]">ID</th>
                                                <th className="p-4 border-b border-[var(--border-color)]">Fecha</th>
                                                <th className="p-4 border-b border-[var(--border-color)]">Estado</th>
                                                <th className="p-4 border-b border-[var(--border-color)] text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {misSolicitudes.map(s => (
                                                <tr key={s.id} className="hover:bg-[var(--bg-secondary)] transition">
                                                    <td className="p-4 border-b border-[var(--border-color)] font-mono font-bold text-[var(--primary)]">#{s.id.slice(0, 8)}</td>
                                                    <td className="p-4 border-b border-[var(--border-color)]">{new Date(s.created_at).toLocaleString()}</td>
                                                    <td className="p-4 border-b border-[var(--border-color)]">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                            s.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {s.estado}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 border-b border-[var(--border-color)] text-center">
                                                        <button className="btn btn-info" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => duplicarSolicitud(s.id)}>
                                                            <LucideCopy size={14} className="mr-1 inline" /> Repetir
                                                        </button>
                                                        {s.estado === 'Completado' && (
                                                            <button className="btn btn-primary ml-2" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => avisarSubirPedido(s.id)}>
                                                                <LucideBell size={14} className="mr-1 inline" /> Avisar Subir
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {misSolicitudes.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-gray-500">No hay solicitudes recientes.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- SECCION INVENTARIO --- */}
                        {activeTab === 'inventario' && (
                            <div className="animate-in fade-in">
                                <h2 className="text-xl font-bold mb-6">Catálogo de Insumos HD</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {productos.map(p => (
                                        <div key={p.id} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] hover:shadow-lg transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-[var(--primary)]">{p.codigo}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => toggleFavorito(p.codigo)} className="text-yellow-500 hover:scale-110">
                                                        {favoritos.includes(p.codigo) ? '⭐' : '☆'}
                                                    </button>
                                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{p.categoria}</span>
                                                </div>
                                            </div>
                                            <p className="font-medium text-[var(--text-primary)]">{p.descripcion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FOOTER GENERAL */}
                        <div className="footer-credits text-center py-6 border-t border-slate-100 opacity-80">
                            <div className="footer-credits">
                                💻 <strong>Sistema desarrollado por Manuel Madrid</strong> |
                                DialyStock © 2025 |
                                <a
                                    href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, soy de la sala HD y necesito soporte con DialyStock.')}`}
                                    target="_blank"
                                    className="ml-2 text-emerald-400 font-bold hover:underline"
                                >
                                    Soporte WhatsApp: +57 304 578 8873
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
