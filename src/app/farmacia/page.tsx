'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    LucideLogOut, LucideBell, LucideCheckCircle2, LucidePackage, LucideClock, LucidePrinter,
    LucideEye, LucideTrash, LucidePlus, LucideSearch, LucideAlertTriangle, LucideEdit, LucideX,
    LucideBox, LucideBarChart, LucideCalendar, LucideFileText, LucideActivity, LucideRefreshCw
} from 'lucide-react'

// --- ESTILOS EXACTOS DEL USUARIO + Ajustes React ---
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
    
    .pharmacy-container {
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
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 30px;
      text-align: center;
      position: relative;
    }
    
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    
    .header-actions {
      position: absolute; top: 20px; right: 20px;
      display: flex; gap: 10px;
    }
    
    .icon-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 2px solid white; color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 18px; transition: all 0.3s; position: relative;
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
    
    .content-area { padding: 30px; background: var(--bg-primary); color: var(--text-primary); min-height: 400px; }
    
    .table-container { overflow-x: auto; margin-top: 20px; border: 1px solid var(--border-color); border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: var(--bg-secondary); }
    th { padding: 15px; text-align: left; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border-color); }
    td { padding: 12px 15px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    tbody tr:hover { background: var(--bg-secondary); }
    
    .btn {
      padding: 10px 20px; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-warning { background: #ffc107; color: #000; }
    
    .badge { padding: 5px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge-pendiente { background: #ffc107; color: #000; }
    .badge-completado { background: #28a745; color: white; }
    
    .form-control { width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
    
    /* Autocomplete Styles */
    .lote-input-container { position: relative; }
    .lote-suggestions {
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--bg-primary); border: 2px solid var(--primary);
      border-top: none; border-radius: 0 0 8px 8px; max-height: 200px;
      overflow-y: auto; z-index: 1000; display: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    .lote-suggestions.show { display: block; }
    .lote-suggestion-item { padding: 10px 12px; cursor: pointer; border-bottom: 1px solid var(--border-color); }
    .lote-suggestion-item:hover { background: linear-gradient(135deg, rgba(0, 201, 255, 0.15), rgba(146, 254, 157, 0.15)); }
    .lote-highlight { background: yellow; font-weight: bold; }
    
    /* Modals */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 1000; overflow-y: auto;
    }
    .modal-content {
      background: var(--bg-primary); margin: 3% auto; padding: 30px;
      border-radius: 15px; width: 95%; max-width: 1400px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 15px; margin-bottom: 20px; }
    
    /* --- IMPRESIÓN (EXACTA) --- */
    @media print {
      @page { size: legal portrait; margin: 8mm; }
      body * { visibility: hidden; }
      #modalDetalle, #modalDetalle * { visibility: visible; }
      #modalDetalle { position: absolute; left: 0; top: 0; width: 100%; }
      
      .no-print, .alert-warning, .lote-datos-sistema, button, .btn, .close, .header, .nav-tabs, .header-actions, .modal-header h3, .footer-credits, .container-card, .toast-container {
        display: none !important; visibility: hidden !important;
      }
      
      body { background: white !important; padding: 0 !important; }
      .pharmacy-container { padding: 0; background: white; }
      
      .modal-content {
        margin: 0 !important; padding: 1mm !important; box-shadow: none !important;
        width: 100% !important; max-width: 100% !important; border-radius: 0 !important;
        background: white !important;
      }
      
      .modal-header { border: none !important; padding: 0 !important; margin-bottom: 1mm !important; }
      
      .print-logo { margin-bottom: 1mm !important; }
      .print-logo img { max-width: 45px !important; }
      .print-title { font-size: 10px !important; font-weight: bold; text-align: center; margin-bottom: 10px; }
      
      .detalle-linea-unica {
        padding: 1mm 2mm !important; margin-bottom: 1.5mm !important; font-size: 9px !important;
        line-height: 1.3 !important; page-break-inside: avoid; border: 1px solid #ccc;
        display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start;
      }
      .detalle-linea-unica div { margin-right: 2px !important; white-space: nowrap; }
      
      .tabla-completa { margin-top: 5mm !important; }
      .tabla-completa table { width: 100% !important; border-collapse: collapse; }
      .tabla-completa th {
        padding: 1.5mm !important; font-size: 10px !important; border: 1px solid #000 !important;
        background: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      .tabla-completa td {
        padding: 1.5mm !important; font-size: 9px !important; border: 1px solid #000 !important;
        min-height: 8mm;
      }
      
      .seccion-observaciones {
        margin-top: 3mm !important; padding: 2mm !important; background: #fff3cd !important;
        border: 1px solid #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
    }

    /* Fixed Footer */
    .footer-credits {
        position: fixed; bottom: 0; left: 0; right: 0;
        background: rgba(0,0,0,0.9); color: white;
        padding: 5px; text-align: center; font-size: 11px;
        z-index: 9999; backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
`

export default function FarmaciaPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [tenantId, setTenantId] = useState('')
    const [activeTab, setActiveTab] = useState('pendientes')

    // Data
    const [solicitudes, setSolicitudes] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [lotes, setLotes] = useState<any[]>([])
    const [reportes, setReportes] = useState<any[]>([])

    // States for CRUD
    const [busquedaProd, setBusquedaProd] = useState('')
    const [busquedaLote, setBusquedaLote] = useState('')
    const [prodModalOpen, setProdModalOpen] = useState(false)
    const [loteModalOpen, setLoteModalOpen] = useState(false)

    const [prodForm, setProdForm] = useState({
        codigo: '', descripcion: '', categoria: 'PD', stock_min: 10, stock_max: 100
    })
    const [loteForm, setLoteForm] = useState({
        producto_codigo: '', numero_lote: '', fecha_vencimiento: '', cantidad_disponible: 0
    })

    // Modals
    const [modalCompletar, setModalCompletar] = useState<any>(null)
    const [modalDetalle, setModalDetalle] = useState<any>(null)

    // Autocomplete State per row
    type LoteSearchState = { [key: string]: { show: boolean } }
    const [loteSearchState, setLoteSearchState] = useState<LoteSearchState>({})

    // Form State fo current Completar
    const [completadoPor, setCompletadoPor] = useState('')
    const [despachoItems, setDespachoItems] = useState<any[]>([])

    // Audio Context Ref
    const audioCtxRef = useRef<AudioContext | null>(null)

    // INITIALIZATION
    useEffect(() => {
        const styleSheet = document.createElement("style")
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/'); return }
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (profile) {
                setTenantId(profile.tenant_id)
                setCompletadoPor(profile.nombre || '')
                loadData(profile.tenant_id)
            }
            setLoading(false)
        }
        init()
        return () => { document.head.removeChild(styleSheet) }
    }, [])

    // REALTIME
    // REALTIME
    useEffect(() => {
        if (!tenantId) return
        const ch = supabase.channel('farmacia-realtime-listener')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitudes', filter: `tenant_id=eq.${tenantId}` }, (payload) => {
                if (payload.new.estado === 'Pendiente') {
                    playAlarmSound('NUEVA_SOLICITUD')
                    alert(`🔔 NUEVA SOLICITUD #${payload.new.id.slice(0, 6)}`)
                    loadData(tenantId)
                }
            })
        // LISTEN TO 'sala-hd-broadcast' CHANNEL for explicit audio alerts
        const audioCh = supabase.channel('sala-hd-broadcast')
            .on('broadcast', { event: 'alerta_subir' }, (payload) => {
                console.log('🔊 Recibida alerta de subir pedido', payload)
                playAlarmSound('SUBIR_PEDIDO')
                alert(`⚠️ HD SOLICITA QUE SUBAS ESTE PEDIDO AHORA: #${payload.payload.id.slice(0, 6)}`)
            })
            .subscribe((status) => console.log('Farmacia Audio Channel:', status))

        const repsCh = supabase.channel('farmacia-reportes-listener')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reportes', filter: `tenant_id=eq.${tenantId}` }, (payload) => {
                if (payload.new.tipo_destino === 'farmacia') {
                    playAlarmSound('NUEVA_SOLICITUD')
                    alert(`📥 NUEVO REPORTE: ${payload.new.titulo}`)
                    loadData(tenantId)
                }
            })
            .subscribe()

        ch.subscribe()

        return () => {
            supabase.removeChannel(ch)
            supabase.removeChannel(audioCh)
            supabase.removeChannel(repsCh)
        }
    }, [tenantId])

    const loadData = async (tid: string) => {
        const [sols, prods, lts, reps] = await Promise.all([
            supabase.from('solicitudes').select('*').eq('tenant_id', tid).order('created_at', { ascending: false }),
            supabase.from('productos').select('*').eq('tenant_id', tid).order('descripcion'),
            supabase.from('lotes').select('*').eq('tenant_id', tid).order('fecha_vencimiento'),
            supabase.from('reportes').select('*').eq('tenant_id', tid).eq('tipo_destino', 'farmacia').order('created_at', { ascending: false })
        ])
        if (sols.data) setSolicitudes(sols.data)
        if (prods.data) setProductos(prods.data)
        if (lts.data) setLotes(lts.data)
        if (reps.data) setReportes(reps.data)
    }

    // --- AUDIO LOGIC ---
    const playAlarmSound = (tipo: 'SUBIR_PEDIDO' | 'NUEVA_SOLICITUD') => {
        try {
            const Ctx = (window.AudioContext || (window as any).webkitAudioContext)
            const ctx = new Ctx()
            audioCtxRef.current = ctx

            if (tipo === 'SUBIR_PEDIDO') {
                [0, 0.8, 1.6].forEach((delay) => {
                    const osc = ctx.createOscillator()
                    const gain = ctx.createGain()
                    osc.connect(gain); gain.connect(ctx.destination)
                    osc.frequency.value = 1200; osc.type = 'square'
                    gain.gain.setValueAtTime(0.8, ctx.currentTime + delay)
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.6)
                    osc.start(ctx.currentTime + delay)
                    osc.stop(ctx.currentTime + delay + 0.6)
                })
            } else {
                [0, 0.3, 0.6].forEach((delay) => {
                    const osc = ctx.createOscillator()
                    const gain = ctx.createGain()
                    osc.connect(gain); gain.connect(ctx.destination)
                    osc.frequency.value = 1500; osc.type = 'sine'
                    gain.gain.setValueAtTime(0.7, ctx.currentTime + delay)
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.4)
                    osc.start(ctx.currentTime + delay)
                    osc.stop(ctx.currentTime + delay + 0.4)
                })
            }
        } catch (e) { console.error('Audio error', e) }
    }

    // --- CRUD ACTIONS (Productos / Lotes) ---
    const guardarProducto = async () => {
        if (!prodForm.codigo || !prodForm.descripcion) return alert('Datos incompletos')
        const { error } = await supabase.from('productos').upsert({
            tenant_id: tenantId,
            codigo: prodForm.codigo,
            descripcion: prodForm.descripcion,
            categoria: prodForm.categoria,
            stock_min: prodForm.stock_min,
            stock_max: prodForm.stock_max
        })
        if (error) alert(error.message)
        else { setProdModalOpen(false); loadData(tenantId); alert('Producto guardado') }
    }

    const eliminarProducto = async (codigo: string) => {
        if (!confirm('¿Eliminar producto?')) return
        await supabase.from('productos').delete().eq('codigo', codigo)
        loadData(tenantId)
    }

    const guardarLote = async () => {
        if (!loteForm.producto_codigo || !loteForm.numero_lote) return alert('Datos incompletos')
        const { error } = await supabase.from('lotes').insert({
            tenant_id: tenantId,
            producto_codigo: loteForm.producto_codigo,
            numero_lote: loteForm.numero_lote,
            fecha_vencimiento: loteForm.fecha_vencimiento,
            cantidad_disponible: loteForm.cantidad_disponible
        })
        if (error) alert(error.message)
        else { setLoteModalOpen(false); loadData(tenantId); alert('Lote agregado') }
    }

    const eliminarLote = async (id: string) => {
        if (!confirm('¿Eliminar lote?')) return
        await supabase.from('lotes').delete().eq('id', id)
        loadData(tenantId)
    }

    // --- ORDER ACTIONS ---
    const abrirCompletar = async (sol: any) => {
        const { data: items } = await supabase.from('solicitudes_items').select('*').eq('solicitud_id', sol.id)
        const initialRows = items?.map((item, idx) => ({
            id: crypto.randomUUID(),
            producto_codigo: item.producto_codigo,
            descripcion: item.descripcion,
            cantidad_solicitada: item.cantidad_solicitada,
            numero_lote: '',
            fecha_venc: '',
            cantidad: 0
        })) || []

        setDespachoItems(initialRows)
        setModalCompletar({ solicitud: sol, items: items || [] })
    }

    const agregarFilaLote = (itemReference: any) => {
        setDespachoItems(prev => [...prev, {
            id: crypto.randomUUID(),
            producto_codigo: itemReference.producto_codigo,
            descripcion: itemReference.descripcion,
            cantidad_solicitada: 0,
            numero_lote: '',
            fecha_venc: '',
            cantidad: 0,
            isExtra: true
        }])
    }

    const eliminarFila = (id: string) => {
        setDespachoItems(prev => prev.filter(r => r.id !== id))
    }

    const guardarCompletado = async () => {
        if (!completadoPor.trim()) return alert('❌ Debes ingresar tu nombre')
        const validItems = despachoItems.filter(i => i.numero_lote && i.cantidad > 0)
        if (validItems.length === 0) return alert('❌ Debes agregar al menos un lote válido')
        if (!confirm(`¿Confirmar despacho de ${validItems.length} lotes?`)) return

        try {
            await supabase.from('solicitudes').update({
                estado: 'Completado',
                completado_por: completadoPor,
                fecha_completado: new Date().toISOString()
            }).eq('id', modalCompletar.solicitud.id)

            // Reduce stock logic would go here ideally
            alert('✅ Solicitud completada')
            setModalCompletar(null)
            loadData(tenantId)
        } catch (e: any) { alert('Error: ' + e.message) }
    }

    // --- AUTOCOMPLETE ---
    const handleLoteSearch = (rowId: string, val: string, prodCode: string) => {
        setDespachoItems((prev: any[]) => prev.map(r => r.id === rowId ? { ...r, numero_lote: val } : r))
        const matches = lotes.filter(l => l.producto_codigo === prodCode && l.numero_lote.toLowerCase().includes(val.toLowerCase()))
        setLoteSearchState((prev: LoteSearchState) => ({ ...prev, [rowId]: { show: matches.length > 0 && val.length > 0 } }))
    }

    const selectLote = (rowId: string, lote: any) => {
        setDespachoItems((prev: any[]) => prev.map(r => r.id === rowId ? {
            ...r, numero_lote: lote.numero_lote, fecha_venc: lote.fecha_vencimiento,
            cantidad: lote.cantidad || lote.cantidad_disponible
        } : r))
        setLoteSearchState((prev: LoteSearchState) => ({ ...prev, [rowId]: { show: false } }))
    }

    const verDetalle = async (sol: any) => {
        const { data: items } = await supabase.from('solicitudes_items').select('*').eq('solicitud_id', sol.id)
        setModalDetalle({ solicitud: sol, items: items || [] })
    }

    // --- RENDERS ---
    const renderPendientes = () => (
        <div className="table-container">
            <table>
                <thead><tr><th>ID</th><th>Tipo</th><th>Fecha</th><th>Solicitante</th><th>Paciente</th><th className="text-center">Acciones</th></tr></thead>
                <tbody>
                    {solicitudes.filter(s => s.estado === 'Pendiente').map(s => (
                        <tr key={s.id}>
                            <td><strong>{s.id.slice(0, 8)}</strong></td>
                            <td><span className="badge badge-pendiente">{s.tipo}</span></td>
                            <td>{new Date(s.created_at).toLocaleString()}</td>
                            <td>{s.solicitante}</td>
                            <td>{s.paciente}</td>
                            <td className="text-center">
                                <button className="btn btn-success" onClick={() => abrirCompletar(s)}>✅ Completar</button>
                            </td>
                        </tr>
                    ))}
                    {solicitudes.filter(s => s.estado === 'Pendiente').length === 0 && (
                        <tr><td colSpan={6} className="text-center p-8">✅ No hay solicitudes pendientes</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )

    const renderCompletadas = () => (
        <div className="table-container">
            <table>
                <thead><tr><th>ID</th><th>Tipo</th><th>Fecha Solicitud</th><th>Solicitante</th><th>Completado Por</th><th>Fecha Cierre</th><th className="text-center">Acciones</th></tr></thead>
                <tbody>
                    {solicitudes.filter(s => s.estado === 'Completado').map(s => (
                        <tr key={s.id} style={{ background: '#d4edda' }}>
                            <td><strong>{s.id.slice(0, 8)}</strong></td>
                            <td><span className="badge badge-completado">{s.tipo}</span></td>
                            <td>{new Date(s.created_at).toLocaleString()}</td>
                            <td>{s.solicitante}</td>
                            <td><strong>{s.completado_por}</strong></td>
                            <td>{s.fecha_completado ? new Date(s.fecha_completado).toLocaleString() : '-'}</td>
                            <td className="text-center">
                                <button className="btn btn-secondary" onClick={() => verDetalle(s)}>👁️ Ver / Imprimir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    // CRUD RENDERS
    const renderProductos = () => {
        const filtrados = productos.filter(p => p.descripcion.toLowerCase().includes(busquedaProd.toLowerCase()) || p.codigo.includes(busquedaProd))
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">📦 Gestión Productos</h2>
                    <button onClick={() => { setProdForm({ codigo: '', descripcion: '', categoria: 'PD', stock_min: 10, stock_max: 100 }); setProdModalOpen(true) }} className="btn btn-primary"><LucidePlus size={16} /> Nuevo</button>
                </div>
                <input className="form-control mb-4" placeholder="Buscar..." value={busquedaProd} onChange={e => setBusquedaProd(e.target.value)} />
                <div className="table-container">
                    <table>
                        <thead><tr><th>Código</th><th>Descripción</th><th>Categoría</th><th>Stock</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {filtrados.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.codigo}</strong></td><td>{p.descripcion}</td>
                                    <td><span className="badge badge-pendiente">{p.categoria}</span></td>
                                    <td>{p.stock || 0}</td>
                                    <td>
                                        <button onClick={() => eliminarProducto(p.codigo)} className="btn btn-danger px-2 py-1"><LucideTrash size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderLotes = () => {
        const filtrados = lotes.filter(l => l.numero_lote.toLowerCase().includes(busquedaLote.toLowerCase()))
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">📋 Gestión Lotes</h2>
                    <button onClick={() => { setLoteForm({ producto_codigo: '', numero_lote: '', fecha_vencimiento: '', cantidad_disponible: 0 }); setLoteModalOpen(true) }} className="btn btn-primary"><LucidePlus size={16} /> Agregar Lote</button>
                </div>
                <input className="form-control mb-4" placeholder="Buscar lote..." value={busquedaLote} onChange={e => setBusquedaLote(e.target.value)} />
                <div className="table-container">
                    <table>
                        <thead><tr><th>Producto</th><th>Lote</th><th>Vencimiento</th><th>Cantidad</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {filtrados.map(l => (
                                <tr key={l.id}>
                                    <td>{l.producto_codigo}</td>
                                    <td className="font-bold">{l.numero_lote}</td>
                                    <td>{l.fecha_vencimiento}</td>
                                    <td>{l.cantidad_disponible}</td>
                                    <td><button onClick={() => eliminarLote(l.id)} className="btn btn-danger px-2"><LucideTrash size={14} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderReportes = () => {
        return (
            <div>
                <h2 className="text-xl font-bold mb-4">📥 Reportes Recibidos</h2>
                {reportes.length === 0 ? (
                    <div className="text-center p-10 bg-[var(--bg-secondary)] rounded-xl">
                        <LucideBell size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-[var(--text-secondary)]">No hay reportes para farmacia</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reportes.map(r => (
                            <div key={r.id} className="bg-[var(--bg-secondary)] p-5 rounded-xl border-l-4 border-l-yellow-500 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{r.titulo}</h3>
                                        <p className="text-sm opacity-70">Enviado por: <strong>{r.area_origen}</strong> | {new Date(r.created_at).toLocaleString()}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold uppercase">{r.estado}</span>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-[var(--border-color)] mt-2">
                                    {r.descripcion}
                                </div>
                                {r.estado === 'pendiente' && (
                                    <button
                                        onClick={async () => {
                                            await supabase.from('reportes').update({ estado: 'leído' }).eq('id', r.id)
                                            loadData(tenantId)
                                        }}
                                        className="mt-3 text-sm text-blue-500 font-bold hover:underline"
                                    >
                                        Marcar como leído
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }


    if (loading) return <div className="p-10 text-center font-bold">Cargando Sistema Farmacia...</div>

    return (
        <div className="pharmacy-container" style={{ background: darkMode ? '#1a1a2e' : undefined }}>
            <div className={`container-card ${darkMode ? 'dark-mode' : ''}`}>
                <div className="header">
                    <div className="header-actions">
                        <button className="icon-btn" onClick={() => router.push('/')} title="Salir"><LucideLogOut /></button>
                        <button className="icon-btn" onClick={() => loadData(tenantId)} title="Actualizar"><LucideRefreshCw /></button>
                    </div>
                    <h1>📦 DialyStock Farmacia</h1>
                    <p>Gestión y Despacho de Solicitudes</p>
                </div>

                <div className="nav-tabs">
                    <button className={`nav-tab ${activeTab === 'pendientes' ? 'active' : ''}`} onClick={() => setActiveTab('pendientes')}>⏳ Pendientes</button>
                    <button className={`nav-tab ${activeTab === 'completadas' ? 'active' : ''}`} onClick={() => setActiveTab('completadas')}>✅ Completadas</button>
                    <button className={`nav-tab ${activeTab === 'reportes' ? 'active' : ''}`} onClick={() => setActiveTab('reportes')}>📥 Reportes</button>
                    <button className={`nav-tab ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>📦 Productos</button>
                    <button className={`nav-tab ${activeTab === 'lotes' ? 'active' : ''}`} onClick={() => setActiveTab('lotes')}>📋 Lotes</button>
                </div>

                <div className="content-area">
                    {activeTab === 'pendientes' && renderPendientes()}
                    {activeTab === 'completadas' && renderCompletadas()}
                    {activeTab === 'reportes' && renderReportes()}
                    {activeTab === 'productos' && renderProductos()}
                    {activeTab === 'lotes' && renderLotes()}
                </div>
            </div>

            {/* MODAL PRODUCTO */}
            {prodModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header"><h3>Nuevo Producto</h3> <span className="close text-2xl cursor-pointer" onClick={() => setProdModalOpen(false)}>&times;</span></div>
                        <div className="grid gap-4">
                            <input className="form-control" placeholder="Código" value={prodForm.codigo} onChange={e => setProdForm({ ...prodForm, codigo: e.target.value })} />
                            <input className="form-control" placeholder="Descripción" value={prodForm.descripcion} onChange={e => setProdForm({ ...prodForm, descripcion: e.target.value })} />
                            <select className="form-control" value={prodForm.categoria} onChange={e => setProdForm({ ...prodForm, categoria: e.target.value })}>
                                <option value="PD">Peritoneal (PD)</option>
                                <option value="HD">Hemodiálisis (HD)</option>
                            </select>
                            <input className="form-control" type="number" placeholder="Stock Min" value={prodForm.stock_min} onChange={e => setProdForm({ ...prodForm, stock_min: Number(e.target.value) })} />
                            <button className="btn btn-primary" onClick={guardarProducto}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL LOTE */}
            {loteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header"><h3>Nuevo Lote</h3> <span className="close text-2xl cursor-pointer" onClick={() => setLoteModalOpen(false)}>&times;</span></div>
                        <div className="grid gap-4">
                            <input className="form-control" placeholder="Código Producto" value={loteForm.producto_codigo} onChange={e => setLoteForm({ ...loteForm, producto_codigo: e.target.value })} />
                            <input className="form-control" placeholder="Número Lote" value={loteForm.numero_lote} onChange={e => setLoteForm({ ...loteForm, numero_lote: e.target.value })} />
                            <input className="form-control" type="date" placeholder="Vencimiento" value={loteForm.fecha_vencimiento} onChange={e => setLoteForm({ ...loteForm, fecha_vencimiento: e.target.value })} />
                            <input className="form-control" type="number" placeholder="Cantidad" value={loteForm.cantidad_disponible} onChange={e => setLoteForm({ ...loteForm, cantidad_disponible: Number(e.target.value) })} />
                            <button className="btn btn-primary" onClick={guardarLote}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL COMPLETAR */}
            {modalCompletar && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>📦 Completar Solicitud #{modalCompletar.solicitud.id.slice(0, 6)}</h3>
                            <span className="close text-2xl cursor-pointer" onClick={() => setModalCompletar(null)}>&times;</span>
                        </div>
                        <div className="p-4 bg-yellow-50 mb-4 rounded border border-yellow-200">
                            <strong>Tip:</strong> Escribe el número de lote para autocompletar.
                        </div>
                        <div className="mb-4">
                            <label className="font-bold">Completado Por:</label>
                            <input className="form-control" value={completadoPor} onChange={e => setCompletadoPor(e.target.value)} />
                        </div>
                        {modalCompletar.items.map((item: any) => {
                            const rows = despachoItems.filter(r => r.producto_codigo === item.producto_codigo)
                            return (
                                <div key={item.id} className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
                                    <h4 className="font-bold text-blue-600">{item.producto_codigo} - {item.descripcion}</h4>
                                    <p>Cant Solic: {item.cantidad_solicitada}</p>
                                    {rows.map((row) => (
                                        <div key={row.id} className="flex gap-2 mt-2">
                                            <div className="lote-input-container flex-1">
                                                <input className="form-control" placeholder="Lote" value={row.numero_lote} onChange={e => handleLoteSearch(row.id, e.target.value, row.producto_codigo)} />
                                                {loteSearchState[row.id]?.show && (
                                                    <div className="lote-suggestions show">
                                                        {lotes.filter(l => l.producto_codigo === row.producto_codigo && l.numero_lote.toLowerCase().includes(row.numero_lote.toLowerCase())).map(l => (
                                                            <div key={l.id} className="lote-suggestion-item" onClick={() => selectLote(row.id, l)}>{l.numero_lote} (Disp: {l.cantidad_disponible})</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <input className="form-control w-32" type="date" value={row.fecha_venc} onChange={e => setDespachoItems(all => all.map(r => r.id === row.id ? { ...r, fecha_venc: e.target.value } : r))} />
                                            <input className="form-control w-24" type="number" value={row.cantidad} onChange={e => setDespachoItems(all => all.map(r => r.id === row.id ? { ...r, cantidad: Number(e.target.value) } : r))} />
                                            <button className="btn btn-danger" onClick={() => eliminarFila(row.id)}>X</button>
                                        </div>
                                    ))}
                                    <button className="btn btn-primary btn-sm mt-2" onClick={() => agregarFilaLote(item)}>+ Lote</button>
                                </div>
                            )
                        })}
                        <div className="flex justify-end gap-2 mt-4">
                            <button className="btn btn-secondary" onClick={() => setModalCompletar(null)}>Cancelar</button>
                            <button className="btn btn-success" onClick={guardarCompletado}>Completar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE (PRINT) */}
            {modalDetalle && (
                <div id="modalDetalle">
                    <div className="modal-content">
                        <div className="modal-header no-print">
                            <h3>📋 Detalle Solicitud</h3>
                            <span className="close text-2xl cursor-pointer" onClick={() => setModalDetalle(null)}>&times;</span>
                        </div>

                        {/* PRINT LAYOUT */}
                        <div className="print-logo">
                            <h1 className="text-3xl font-bold text-blue-600">DaVita</h1>
                        </div>
                        <div className="print-title">Solicitud diaria y/o reposición de productos médicos - DaVita PRO</div>

                        <div className="detalle-linea-unica">
                            <div><strong>ID:</strong> {modalDetalle.solicitud.id ? (modalDetalle.solicitud.tipo + '-' + modalDetalle.solicitud.id.replace(/-/g, '').slice(0, 10)) : modalDetalle.solicitud.id}</div>
                            <div><strong>Tipo:</strong> {modalDetalle.solicitud.tipo}</div>
                            <div><strong>Fecha Solicitud:</strong> {new Date(modalDetalle.solicitud.created_at).toLocaleString()}</div>
                            <div><strong>Fecha Despacho:</strong> {modalDetalle.solicitud.fecha_completado ? new Date(modalDetalle.solicitud.fecha_completado).toLocaleString() : 'Pendiente'}</div>
                            <div><strong>Estado:</strong> {modalDetalle.solicitud.estado}</div>
                            <div><strong>Solicitante:</strong> {modalDetalle.solicitud.solicitante}</div>
                            <div><strong>Paciente:</strong> {modalDetalle.solicitud.paciente}</div>
                            <div><strong>Completado:</strong> {modalDetalle.solicitud.completado_por}</div>
                        </div>

                        <div className="tabla-completa">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}>Código</th>
                                        <th style={{ width: '45%' }}>Descripción</th>
                                        <th style={{ width: '10%' }}>Solicitado</th>
                                        <th style={{ width: '10%' }}>Entregado</th>
                                        <th style={{ width: '20%' }}>Lotes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalDetalle.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>{item.producto_codigo}</td>
                                            <td>{item.descripcion}</td>
                                            <td>{item.cantidad_solicitada}</td>
                                            <td><strong>{item.cantidad_solicitada}</strong></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 text-center no-print">
                            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Imprimir</button>
                            <button className="btn btn-secondary ml-2" onClick={() => setModalDetalle(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="footer-credits">
                💻 <strong>Sistema desarrollado por Manuel Madrid</strong> |
                DialyStock © 2025 |
                <a
                    href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, soy de la farmacia y necesito soporte con DialyStock.')}`}
                    target="_blank"
                    className="ml-2 text-emerald-400 font-bold hover:underline"
                >
                    Soporte WhatsApp: +57 304 578 8873
                </a>
            </div>
        </div>
    )
}

const darkMode = false
