'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    LucideLogOut, LucideBell, LucideTrash, LucidePlus, LucideEdit, LucideX, LucideRefreshCw
} from 'lucide-react'
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics'

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
    .lote-input-container {
      position: relative;
      min-width: 200px;
      flex: 2 !important;
    }
    .lote-input-container input {
      width: 100%;
      min-width: 180px;
      font-size: 14px;
    }
    .lote-suggestions {
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--bg-primary); border: 2px solid var(--primary);
      border-top: none; border-radius: 0 0 8px 8px; max-height: 250px;
      overflow-y: auto; z-index: 1000; display: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      min-width: 280px;
    }
    .lote-suggestions.show { display: block; }
    .lote-suggestion-item {
      padding: 12px 15px;
      cursor: pointer;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .lote-suggestion-item:hover {
      background: linear-gradient(135deg, rgba(0, 201, 255, 0.15), rgba(146, 254, 157, 0.15));
    }
    .lote-suggestion-item .lote-code {
      font-weight: bold;
      color: var(--primary);
    }
    .lote-suggestion-item .lote-info {
      font-size: 11px;
      color: var(--text-secondary);
    }
    .lote-highlight { background: yellow; font-weight: bold; }
    .lote-dropdown-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 4px;
    }
    .lote-dropdown-btn:hover { color: var(--primary); }
    
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

    /* AI Alerts Redesign */
    .ai-alerts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    .ai-alert-card {
        background: var(--bg-primary);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        border-left: 6px solid #ccc;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .ai-alert-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
    .ai-alert-card.critica { border-left-color: #ef4444; background: linear-gradient(to right, #fef2f2, transparent); }
    .ai-alert-card.advertencia { border-left-color: #f59e0b; background: linear-gradient(to right, #fffbeb, transparent); }
    .ai-alert-card.informativa { border-left-color: #3b82f6; background: linear-gradient(to right, #eff6ff, transparent); }
    
    .ai-alert-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
    .ai-alert-code { font-family: monospace; font-weight: 800; font-size: 14px; color: var(--primary); background: rgba(0,201,255,0.1); padding: 2px 8px; border-radius: 4px; }
    .ai-alert-days { font-size: 24px; font-weight: 900; line-height: 1; }
    .ai-alert-days span { font-size: 10px; text-transform: uppercase; display: block; opacity: 0.7; }
    
    .ai-alert-body { flex-grow: 1; }
    .ai-alert-desc { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    .ai-alert-stats { display: flex; gap: 15px; font-size: 12px; color: var(--text-secondary); border-top: 1px dashed var(--border-color); pt: 10px; mt: 10px; }
    .ai-stat-pill { background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; font-weight: 500; }
`

export default function FarmaciaPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [tenantId, setTenantId] = useState('')
    const [userId, setUserId] = useState('')
    const [activeTab, setActiveTab] = useState('pendientes')

    // Data
    const [solicitudes, setSolicitudes] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [lotes, setLotes] = useState<any[]>([])
    const [reportes, setReportes] = useState<any[]>([])
    const [alertasIA, setAlertasIA] = useState<any[]>([])

    // States for CRUD
    const [busquedaProd, setBusquedaProd] = useState('')
    const [busquedaLote, setBusquedaLote] = useState('')
    const [prodModalOpen, setProdModalOpen] = useState(false)
    const [loteModalOpen, setLoteModalOpen] = useState(false)
    const [editingProd, setEditingProd] = useState<any>(null)
    const [editingLote, setEditingLote] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    const [prodForm, setProdForm] = useState({
        codigo: '', descripcion: '', categoria: 'PD', stock_min: 10, stock_max: 100
    })
    const [loteForm, setLoteForm] = useState({
        producto_codigo: '', numero_lote: '', fecha_vencimiento: '', cantidad_disponible: 0
    })

    // Stats
    const pendientesCount = solicitudes.filter(s => s.estado === 'Pendiente').length
    const completadasHoy = solicitudes.filter(s => {
        if (s.estado !== 'Completado' || !s.fecha_completado) return false
        const hoy = new Date().toDateString()
        return new Date(s.fecha_completado).toDateString() === hoy
    }).length
    const lotesProximosVencer = lotes.filter(l => {
        if (!l.fecha_vencimiento) return false
        const diasParaVencer = Math.ceil((new Date(l.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return diasParaVencer <= 30 && diasParaVencer > 0
    }).length
    const lotesVencidos = lotes.filter(l => {
        if (!l.fecha_vencimiento) return false
        return new Date(l.fecha_vencimiento) < new Date()
    }).length

    // IA Predictive Stats
    const alertasCriticas = alertasIA.filter(a => a.dias_restantes <= 7).length
    const alertasAdvertencia = alertasIA.filter(a => a.dias_restantes > 7 && a.dias_restantes <= 14).length

    // Modals
    const [modalCompletar, setModalCompletar] = useState<any>(null)
    const [modalDetalle, setModalDetalle] = useState<any>(null)

    // Autocomplete State per row
    type LoteSearchState = { [key: string]: { show: boolean } }
    const [loteSearchState, setLoteSearchState] = useState<LoteSearchState>({})

    // Form State fo current Completar
    const [completadoPor, setCompletadoPor] = useState('')
    const [despachoItems, setDespachoItems] = useState<any[]>([])

    // Analytics - Aprendizaje automático (después de completadoPor)
    const analyticsContext = useMemo(() => ({
        tenantId,
        userId,
        userName: completadoPor,
        userRole: 'farmacia'
    }), [tenantId, userId, completadoPor])
    const { eventos: analytics } = useLearningAnalytics(analyticsContext.tenantId ? analyticsContext : null)

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
            if (!profile || profile.role !== 'farmacia') {
                router.push('/')
                return
            }
            setTenantId(profile.tenant_id)
            setUserId(user.id)
            setCompletadoPor(profile.nombre || '')
            loadData(profile.tenant_id)
        }
        init()

        // Cargar borrador de despacho si existe
        const savedDraft = localStorage.getItem('draft_despacho_farmacia')
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft)
                if (parsed.items && parsed.solicitudId) {
                    console.log('📋 Borrador de despacho encontrado para solicitud:', parsed.solicitudId)
                }
            } catch (e) {
                localStorage.removeItem('draft_despacho_farmacia')
            }
        }

        return () => { document.head.removeChild(styleSheet) }
    }, [])

    // Guardar borrador del despacho automáticamente
    useEffect(() => {
        if (modalCompletar && despachoItems.some(i => i.numero_lote)) {
            const draft = {
                solicitudId: modalCompletar.solicitud.id,
                items: despachoItems,
                completadoPor,
                timestamp: new Date().toISOString()
            }
            localStorage.setItem('draft_despacho_farmacia', JSON.stringify(draft))
            console.log('💾 Borrador de despacho guardado')
        }
    }, [despachoItems, completadoPor, modalCompletar])

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
        if (!tid) return;

        try {
            const [sols, prods, lts, reps, aiRes] = await Promise.all([
                supabase.from('solicitudes').select('*').eq('tenant_id', tid).order('created_at', { ascending: false }),
                supabase.from('productos').select('*').eq('tenant_id', tid).order('descripcion'),
                supabase.from('lotes').select('*').eq('tenant_id', tid).order('fecha_vencimiento'),
                supabase.from('reportes').select('*').eq('tenant_id', tid).eq('tipo_destino', 'farmacia').order('created_at', { ascending: false }),
                supabase.rpc('farmacia_alertas_predictivas', { p_tenant_id: tid })
            ])

            if (sols.data) setSolicitudes(sols.data)
            if (prods.data) setProductos(prods.data)
            if (lts.data) setLotes(lts.data)
            if (reps.data) setReportes(reps.data)

            if (aiRes.error) {
                console.error('❌ Error Alertas IA:', aiRes.error)
            } else if (aiRes.data) {
                setAlertasIA(aiRes.data)
            }
        } catch (err) {
            console.error('❌ Error crítico cargando datos:', err)
        }
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
    const abrirEditarProducto = (producto: any) => {
        setEditingProd(producto)
        setProdForm({
            codigo: producto.codigo,
            descripcion: producto.descripcion,
            categoria: producto.categoria || 'PD',
            stock_min: producto.stock_min || 10,
            stock_max: producto.stock_max || 100
        })
        setProdModalOpen(true)
    }

    const guardarProducto = async () => {
        if (!prodForm.codigo || !prodForm.descripcion) return alert('❌ Código y descripción son obligatorios')
        if (prodForm.stock_min < 0 || prodForm.stock_max < 0) return alert('❌ Stock no puede ser negativo')
        if (prodForm.stock_min > prodForm.stock_max) return alert('❌ Stock mínimo no puede ser mayor al máximo')

        setSaving(true)
        try {
            if (editingProd) {
                // Actualizar producto existente
                const { error } = await supabase.from('productos')
                    .update({
                        descripcion: prodForm.descripcion,
                        categoria: prodForm.categoria,
                        stock_min: prodForm.stock_min,
                        stock_max: prodForm.stock_max
                    })
                    .eq('id', editingProd.id)
                if (error) throw error
                alert('✅ Producto actualizado correctamente')
            } else {
                // Crear nuevo producto
                const { error } = await supabase.from('productos').insert({
                    tenant_id: tenantId,
                    codigo: prodForm.codigo,
                    descripcion: prodForm.descripcion,
                    categoria: prodForm.categoria,
                    stock_min: prodForm.stock_min,
                    stock_max: prodForm.stock_max
                })
                if (error) throw error
                alert('✅ Producto creado correctamente')
            }
            setProdModalOpen(false)
            setEditingProd(null)
            loadData(tenantId)
        } catch (e: any) {
            alert('❌ Error: ' + e.message)
        }
        setSaving(false)
    }

    const eliminarProducto = async (producto: any) => {
        if (!confirm(`¿Eliminar producto "${producto.descripcion}"?\n\nEsto también eliminará los lotes asociados.`)) return
        setSaving(true)
        try {
            await supabase.from('lotes').delete().eq('producto_codigo', producto.codigo)
            await supabase.from('productos').delete().eq('id', producto.id)
            alert('✅ Producto eliminado')
            loadData(tenantId)
        } catch (e: any) {
            alert('❌ Error: ' + e.message)
        }
        setSaving(false)
    }

    const abrirEditarLote = (lote: any) => {
        setEditingLote(lote)
        setLoteForm({
            producto_codigo: lote.producto_codigo,
            numero_lote: lote.numero_lote,
            fecha_vencimiento: lote.fecha_vencimiento || '',
            cantidad_disponible: lote.cantidad_disponible || 0
        })
        setLoteModalOpen(true)
    }

    const guardarLote = async () => {
        if (!loteForm.producto_codigo || !loteForm.numero_lote) return alert('❌ Producto y número de lote son obligatorios')
        if (loteForm.cantidad_disponible < 0) return alert('❌ Cantidad no puede ser negativa')

        setSaving(true)
        try {
            if (editingLote) {
                const { error } = await supabase.from('lotes')
                    .update({
                        numero_lote: loteForm.numero_lote,
                        fecha_vencimiento: loteForm.fecha_vencimiento,
                        cantidad_disponible: loteForm.cantidad_disponible
                    })
                    .eq('id', editingLote.id)
                if (error) throw error
                alert('✅ Lote actualizado correctamente')
            } else {
                const { error } = await supabase.from('lotes').insert({
                    tenant_id: tenantId,
                    producto_codigo: loteForm.producto_codigo,
                    numero_lote: loteForm.numero_lote,
                    fecha_vencimiento: loteForm.fecha_vencimiento,
                    cantidad_disponible: loteForm.cantidad_disponible
                })
                if (error) throw error
                alert('✅ Lote creado correctamente')
            }
            setLoteModalOpen(false)
            setEditingLote(null)
            loadData(tenantId)
        } catch (e: any) {
            alert('❌ Error: ' + e.message)
        }
        setSaving(false)
    }

    const eliminarLote = async (lote: any) => {
        if (!confirm(`¿Eliminar lote "${lote.numero_lote}"?`)) return
        setSaving(true)
        try {
            await supabase.from('lotes').delete().eq('id', lote.id)
            alert('✅ Lote eliminado')
            loadData(tenantId)
        } catch (e: any) {
            alert('❌ Error: ' + e.message)
        }
        setSaving(false)
    }

    // Helper para obtener estado de vencimiento
    const getEstadoVencimiento = (fechaVenc: string) => {
        if (!fechaVenc) return { estado: 'sin-fecha', texto: 'Sin fecha', color: '#6c757d' }
        const dias = Math.ceil((new Date(fechaVenc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        if (dias < 0) return { estado: 'vencido', texto: `Vencido hace ${Math.abs(dias)} días`, color: '#dc3545' }
        if (dias <= 30) return { estado: 'proximo', texto: `Vence en ${dias} días`, color: '#ffc107' }
        if (dias <= 90) return { estado: 'ok', texto: `Vence en ${dias} días`, color: '#17a2b8' }
        return { estado: 'ok', texto: new Date(fechaVenc).toLocaleDateString(), color: '#28a745' }
    }

    // --- ORDER ACTIONS ---
    const abrirCompletar = async (sol: any) => {
        const { data: items } = await supabase.from('solicitudes_items').select('*').eq('solicitud_id', sol.id)

        // Verificar si hay un borrador guardado para esta solicitud
        const savedDraft = localStorage.getItem('draft_despacho_farmacia')
        let useDraft = false

        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft)
                if (parsed.solicitudId === sol.id && parsed.items?.some((i: any) => i.numero_lote)) {
                    useDraft = confirm(
                        `📋 Se encontró un borrador guardado para esta solicitud.\n\n` +
                        `Guardado: ${new Date(parsed.timestamp).toLocaleString()}\n\n` +
                        `¿Deseas restaurar el borrador?`
                    )
                    if (useDraft) {
                        setDespachoItems(parsed.items)
                        if (parsed.completadoPor) setCompletadoPor(parsed.completadoPor)
                    }
                }
            } catch (e) {
                localStorage.removeItem('draft_despacho_farmacia')
            }
        }

        if (!useDraft) {
            const initialRows = items?.map((item) => ({
                id: crypto.randomUUID(),
                producto_codigo: item.producto_codigo,
                descripcion: item.descripcion,
                cantidad_solicitada: item.cantidad_solicitada,
                numero_lote: '',
                fecha_venc: '',
                cantidad: 0
            })) || []
            setDespachoItems(initialRows)
        }

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

            // Limpiar borrador después de completar exitosamente
            localStorage.removeItem('draft_despacho_farmacia')

            // Registrar evento de aprendizaje
            analytics?.solicitudCompletada({
                solicitudId: modalCompletar.solicitud.id,
                tiempoCompletado: Date.now() - new Date(modalCompletar.solicitud.created_at).getTime()
            })

            alert('✅ Solicitud completada')
            setModalCompletar(null)
            loadData(tenantId)
        } catch (e: any) { alert('Error: ' + e.message) }
    }

    // --- AUTOCOMPLETE ---
    const handleLoteSearch = (rowId: string, val: string, prodCode: string) => {
        setDespachoItems((prev: any[]) => prev.map(r => r.id === rowId ? { ...r, numero_lote: val } : r))
        const matches = lotes.filter(l => l.producto_codigo === prodCode && l.numero_lote.toLowerCase().includes(val.toLowerCase()))
        setLoteSearchState((prev: LoteSearchState) => ({ ...prev, [rowId]: { show: matches.length > 0 } }))
    }

    const toggleLoteDropdown = (rowId: string, prodCode: string) => {
        const currentState = loteSearchState[rowId]?.show || false
        if (!currentState) {
            // Mostrar todos los lotes del producto
            const matches = lotes.filter(l => l.producto_codigo === prodCode)
            setLoteSearchState((prev: LoteSearchState) => ({ ...prev, [rowId]: { show: matches.length > 0 } }))
        } else {
            setLoteSearchState((prev: LoteSearchState) => ({ ...prev, [rowId]: { show: false } }))
        }
    }

    const handleLoteFocus = (rowId: string, prodCode: string, currentVal: string) => {
        const matches = lotes.filter(l => l.producto_codigo === prodCode &&
            (currentVal === '' || l.numero_lote.toLowerCase().includes(currentVal.toLowerCase())))
        setLoteSearchState((prev: LoteSearchState) => ({ ...prev, [rowId]: { show: matches.length > 0 } }))
    }

    const handleLoteBlur = (rowId: string) => {
        // Delay para permitir click en sugerencia
        setTimeout(() => {
            setLoteSearchState((prev: LoteSearchState) => ({ ...prev, [rowId]: { show: false } }))
        }, 200)
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
                    <h2 className="text-xl font-bold">📦 Gestión Productos ({productos.length})</h2>
                    <button
                        onClick={() => {
                            setEditingProd(null)
                            setProdForm({ codigo: '', descripcion: '', categoria: 'PD', stock_min: 10, stock_max: 100 })
                            setProdModalOpen(true)
                        }}
                        className="btn btn-primary"
                    >
                        <LucidePlus size={16} /> Nuevo Producto
                    </button>
                </div>
                <div className="flex gap-2 mb-4">
                    <input
                        className="form-control"
                        placeholder="🔍 Buscar por código o descripción..."
                        value={busquedaProd}
                        onChange={e => setBusquedaProd(e.target.value)}
                    />
                    {busquedaProd && (
                        <button className="btn btn-secondary" onClick={() => setBusquedaProd('')}>
                            <LucideX size={16} />
                        </button>
                    )}
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th>Stock Min</th>
                                <th>Stock Max</th>
                                <th>Lotes</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-8">
                                        {busquedaProd ? '🔍 No se encontraron productos' : '📦 No hay productos registrados'}
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map(p => {
                                    const lotesProducto = lotes.filter(l => l.producto_codigo === p.codigo)
                                    return (
                                        <tr key={p.id}>
                                            <td><strong className="font-mono">{p.codigo}</strong></td>
                                            <td>{p.descripcion}</td>
                                            <td>
                                                <span className={`badge ${p.categoria === 'HD' ? 'badge-completado' : 'badge-pendiente'}`}>
                                                    {p.categoria}
                                                </span>
                                            </td>
                                            <td>{p.stock_min || 0}</td>
                                            <td>{p.stock_max || 0}</td>
                                            <td>
                                                <span className="badge" style={{ background: lotesProducto.length > 0 ? '#17a2b8' : '#6c757d', color: 'white' }}>
                                                    {lotesProducto.length} lotes
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="flex gap-1 justify-center">
                                                    <button
                                                        onClick={() => abrirEditarProducto(p)}
                                                        className="btn btn-warning px-2 py-1"
                                                        title="Editar"
                                                        disabled={saving}
                                                    >
                                                        <LucideEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarProducto(p)}
                                                        className="btn btn-danger px-2 py-1"
                                                        title="Eliminar"
                                                        disabled={saving}
                                                    >
                                                        <LucideTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderLotes = () => {
        const filtrados = lotes.filter(l =>
            l.numero_lote.toLowerCase().includes(busquedaLote.toLowerCase()) ||
            l.producto_codigo.toLowerCase().includes(busquedaLote.toLowerCase())
        )

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">📋 Gestión Lotes ({lotes.length})</h2>
                        <div className="flex gap-4 mt-2 text-sm">
                            {lotesVencidos > 0 && (
                                <span className="px-2 py-1 rounded" style={{ background: '#dc3545', color: 'white' }}>
                                    ⚠️ {lotesVencidos} vencidos
                                </span>
                            )}
                            {lotesProximosVencer > 0 && (
                                <span className="px-2 py-1 rounded" style={{ background: '#ffc107', color: '#000' }}>
                                    ⏰ {lotesProximosVencer} próximos a vencer
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingLote(null)
                            setLoteForm({ producto_codigo: '', numero_lote: '', fecha_vencimiento: '', cantidad_disponible: 0 })
                            setLoteModalOpen(true)
                        }}
                        className="btn btn-primary"
                    >
                        <LucidePlus size={16} /> Nuevo Lote
                    </button>
                </div>

                <div className="flex gap-2 mb-4">
                    <input
                        className="form-control"
                        placeholder="🔍 Buscar por código de producto o número de lote..."
                        value={busquedaLote}
                        onChange={e => setBusquedaLote(e.target.value)}
                    />
                    {busquedaLote && (
                        <button className="btn btn-secondary" onClick={() => setBusquedaLote('')}>
                            <LucideX size={16} />
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Descripción</th>
                                <th>Lote</th>
                                <th>Vencimiento</th>
                                <th>Cantidad</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8">
                                        {busquedaLote ? '🔍 No se encontraron lotes' : '📋 No hay lotes registrados'}
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map(l => {
                                    const producto = productos.find(p => p.codigo === l.producto_codigo)
                                    const vencimiento = getEstadoVencimiento(l.fecha_vencimiento)
                                    return (
                                        <tr
                                            key={l.id}
                                            style={{
                                                background: vencimiento.estado === 'vencido' ? '#ffe6e6' :
                                                    vencimiento.estado === 'proximo' ? '#fff9e6' : undefined
                                            }}
                                        >
                                            <td><strong className="font-mono">{l.producto_codigo}</strong></td>
                                            <td className="text-sm text-gray-600">{producto?.descripcion || '-'}</td>
                                            <td className="font-bold">{l.numero_lote}</td>
                                            <td>
                                                <span
                                                    className="px-2 py-1 rounded text-sm font-medium"
                                                    style={{ background: vencimiento.color + '20', color: vencimiento.color, border: `1px solid ${vencimiento.color}` }}
                                                >
                                                    {vencimiento.texto}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`font-bold ${l.cantidad_disponible <= 5 ? 'text-red-600' : ''}`}>
                                                    {l.cantidad_disponible}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="flex gap-1 justify-center">
                                                    <button
                                                        onClick={() => abrirEditarLote(l)}
                                                        className="btn btn-warning px-2 py-1"
                                                        title="Editar"
                                                        disabled={saving}
                                                    >
                                                        <LucideEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarLote(l)}
                                                        className="btn btn-danger px-2 py-1"
                                                        title="Eliminar"
                                                        disabled={saving}
                                                    >
                                                        <LucideTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderAlertasIA = () => {
        const criticas = alertasIA.filter(a => a.dias_restantes <= 7)
        const advertencias = alertasIA.filter(a => a.dias_restantes > 7 && a.dias_restantes <= 14)
        const informativas = alertasIA.filter(a => a.dias_restantes > 14)

        const renderCard = (a: any, type: 'critica' | 'advertencia' | 'informativa') => (
            <div key={a.producto_codigo} className={`ai-alert-card ${type}`}>
                <div className="ai-alert-header">
                    <span className="ai-alert-code">{a.producto_codigo}</span>
                    <div className={`ai-alert-days font-bold ${type === 'critica' ? 'text-red-600' : type === 'advertencia' ? 'text-amber-600' : 'text-blue-600'}`}>
                        {Math.max(0, a.dias_restantes)}
                        <span className="text-gray-500">días restantes</span>
                    </div>
                </div>
                <div className="ai-alert-body">
                    <p className="ai-alert-desc">{a.descripcion}</p>
                </div>
                <div className="ai-alert-stats">
                    <div className="ai-stat-pill">📦 Stock: <strong>{a.stock_actual}</strong></div>
                    <div className="ai-stat-pill">📉 Consumo: <strong>{a.consumo_diario}/día</strong></div>
                </div>
            </div>
        )

        return (
            <div>
                <div className="mb-8 border-b pb-4 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-100 rounded-xl">🤖</span>
                            Alertas Predictivas IA
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Análisis en tiempo real basado en el historial de consumo de los últimos 30 días.
                        </p>
                    </div>
                </div>

                {alertasIA.length === 0 ? (
                    <div className="text-center p-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="text-4xl mb-4">✨</div>
                        <p className="text-gray-400 font-medium italic">Todo bajo control. No hay alertas predictivas pendientes.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Críticas */}
                        {criticas.length > 0 && (
                            <section>
                                <h3 className="text-red-600 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                                    Crítico - Ordenar Ahora (≤7 días)
                                </h3>
                                <div className="ai-alerts-grid">
                                    {criticas.map(a => renderCard(a, 'critica'))}
                                </div>
                            </section>
                        )}

                        {/* Advertencias */}
                        {advertencias.length > 0 && (
                            <section>
                                <h3 className="text-amber-600 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                    Advertencia - Planificar Pedido (8-14 días)
                                </h3>
                                <div className="ai-alerts-grid">
                                    {advertencias.map(a => renderCard(a, 'advertencia'))}
                                </div>
                            </section>
                        )}

                        {/* Informativas */}
                        {informativas.length > 0 && (
                            <section>
                                <h3 className="text-blue-600 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Stock Adecuado (15-30 días)
                                </h3>
                                <div className="ai-alerts-grid">
                                    {informativas.map(a => renderCard(a, 'informativa'))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
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
                        <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Modo oscuro">
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button className="icon-btn" onClick={() => loadData(tenantId)} title="Actualizar"><LucideRefreshCw /></button>
                        <button className="icon-btn" onClick={() => router.push('/')} title="Salir"><LucideLogOut /></button>
                    </div>
                    <h1>📦 DialyStock Farmacia</h1>
                    <p>Gestión y Despacho de Solicitudes</p>

                    {/* Stats Bar */}
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
                            <div className="text-2xl font-bold">{pendientesCount}</div>
                            <div className="text-xs opacity-80">Pendientes</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
                            <div className="text-2xl font-bold">{completadasHoy}</div>
                            <div className="text-xs opacity-80">Completadas hoy</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
                            <div className="text-2xl font-bold">{productos.length}</div>
                            <div className="text-xs opacity-80">Productos</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
                            <div className="text-2xl font-bold" style={{ color: lotesVencidos > 0 ? '#ffcccc' : 'inherit' }}>
                                {lotesVencidos > 0 ? `⚠️ ${lotesVencidos}` : lotes.length}
                            </div>
                            <div className="text-xs opacity-80">{lotesVencidos > 0 ? 'Lotes vencidos' : 'Lotes'}</div>
                        </div>
                    </div>
                </div>

                <div className="nav-tabs">
                    <button className={`nav-tab ${activeTab === 'pendientes' ? 'active' : ''}`} onClick={() => setActiveTab('pendientes')}>⏳ Pendientes</button>
                    <button className={`nav-tab ${activeTab === 'completadas' ? 'active' : ''}`} onClick={() => setActiveTab('completadas')}>✅ Completadas</button>
                    <button className={`nav-tab ${activeTab === 'reportes' ? 'active' : ''}`} onClick={() => setActiveTab('reportes')}>📥 Reportes</button>
                    <button className={`nav-tab ${activeTab === 'alertas_ia' ? 'active' : ''}`} onClick={() => setActiveTab('alertas_ia')}>🤖 Alertas IA</button>
                    <button className={`nav-tab ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>📦 Productos</button>
                    <button className={`nav-tab ${activeTab === 'lotes' ? 'active' : ''}`} onClick={() => setActiveTab('lotes')}>📋 Lotes</button>
                </div>

                <div className="content-area">
                    {activeTab === 'pendientes' && renderPendientes()}
                    {activeTab === 'completadas' && renderCompletadas()}
                    {activeTab === 'reportes' && renderReportes()}
                    {activeTab === 'alertas_ia' && renderAlertasIA()}
                    {activeTab === 'productos' && renderProductos()}
                    {activeTab === 'lotes' && renderLotes()}
                </div>
            </div>

            {/* MODAL PRODUCTO */}
            {prodModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>{editingProd ? '✏️ Editar Producto' : '📦 Nuevo Producto'}</h3>
                            <span className="close text-2xl cursor-pointer" onClick={() => { setProdModalOpen(false); setEditingProd(null) }}>&times;</span>
                        </div>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Código *</label>
                                <input
                                    className="form-control"
                                    placeholder="Ej: D009937"
                                    value={prodForm.codigo}
                                    onChange={e => setProdForm({ ...prodForm, codigo: e.target.value.toUpperCase() })}
                                    disabled={!!editingProd}
                                    style={{ background: editingProd ? '#f0f0f0' : undefined }}
                                />
                                {editingProd && <p className="text-xs text-gray-500 mt-1">El código no se puede modificar</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Descripción *</label>
                                <input
                                    className="form-control"
                                    placeholder="Nombre del producto"
                                    value={prodForm.descripcion}
                                    onChange={e => setProdForm({ ...prodForm, descripcion: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Categoría</label>
                                <select className="form-control" value={prodForm.categoria} onChange={e => setProdForm({ ...prodForm, categoria: e.target.value })}>
                                    <option value="PD">Peritoneal (PD)</option>
                                    <option value="HD">Hemodiálisis (HD)</option>
                                    <option value="GENERAL">General</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Stock Mínimo</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="0"
                                        value={prodForm.stock_min}
                                        onChange={e => setProdForm({ ...prodForm, stock_min: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Stock Máximo</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="0"
                                        value={prodForm.stock_max}
                                        onChange={e => setProdForm({ ...prodForm, stock_max: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => { setProdModalOpen(false); setEditingProd(null) }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={guardarProducto}
                                    disabled={saving}
                                >
                                    {saving ? '⏳ Guardando...' : (editingProd ? '💾 Actualizar' : '💾 Crear Producto')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL LOTE */}
            {loteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>{editingLote ? '✏️ Editar Lote' : '📋 Nuevo Lote'}</h3>
                            <span className="close text-2xl cursor-pointer" onClick={() => { setLoteModalOpen(false); setEditingLote(null) }}>&times;</span>
                        </div>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Producto *</label>
                                {editingLote ? (
                                    <input
                                        className="form-control"
                                        value={loteForm.producto_codigo}
                                        disabled
                                        style={{ background: '#f0f0f0' }}
                                    />
                                ) : (
                                    <select
                                        className="form-control"
                                        value={loteForm.producto_codigo}
                                        onChange={e => setLoteForm({ ...loteForm, producto_codigo: e.target.value })}
                                    >
                                        <option value="">-- Selecciona un producto --</option>
                                        {productos.map(p => (
                                            <option key={p.id} value={p.codigo}>
                                                {p.codigo} - {p.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Número de Lote *</label>
                                <input
                                    className="form-control"
                                    placeholder="Ej: LOT2024-001"
                                    value={loteForm.numero_lote}
                                    onChange={e => setLoteForm({ ...loteForm, numero_lote: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Fecha de Vencimiento</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={loteForm.fecha_vencimiento}
                                    onChange={e => setLoteForm({ ...loteForm, fecha_vencimiento: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Cantidad Disponible</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={loteForm.cantidad_disponible}
                                    onChange={e => setLoteForm({ ...loteForm, cantidad_disponible: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => { setLoteModalOpen(false); setEditingLote(null) }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={guardarLote}
                                    disabled={saving}
                                >
                                    {saving ? '⏳ Guardando...' : (editingLote ? '💾 Actualizar' : '💾 Crear Lote')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL COMPLETAR - No se cierra al hacer clic afuera */}
            {modalCompletar && (
                <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📦 Completar Solicitud #{modalCompletar.solicitud.id.slice(0, 6)}</h3>
                            <span
                                className="close text-2xl cursor-pointer"
                                onClick={() => {
                                    if (despachoItems.some(i => i.numero_lote)) {
                                        if (confirm('⚠️ Tienes datos sin guardar. ¿Seguro que deseas cerrar?')) {
                                            setModalCompletar(null)
                                        }
                                    } else {
                                        setModalCompletar(null)
                                    }
                                }}
                            >
                                &times;
                            </span>
                        </div>
                        <div className="p-4 bg-blue-50 mb-4 rounded border border-blue-200">
                            <strong>💡 Tip:</strong> Escribe para filtrar o haz clic en ▼ para ver todos los lotes disponibles del producto. Al seleccionar un lote, la fecha y cantidad se llenarán automáticamente.
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
                                        <div key={row.id} className="flex gap-2 mt-2 items-start">
                                            <div className="lote-input-container">
                                                <input
                                                    className="form-control pr-10"
                                                    placeholder="Escribe o selecciona lote..."
                                                    value={row.numero_lote}
                                                    onChange={e => handleLoteSearch(row.id, e.target.value, row.producto_codigo)}
                                                    onFocus={() => handleLoteFocus(row.id, row.producto_codigo, row.numero_lote)}
                                                    onBlur={() => handleLoteBlur(row.id)}
                                                />
                                                <button
                                                    type="button"
                                                    className="lote-dropdown-btn"
                                                    onClick={() => toggleLoteDropdown(row.id, row.producto_codigo)}
                                                    title="Ver lotes disponibles"
                                                >
                                                    ▼
                                                </button>
                                                {loteSearchState[row.id]?.show && (
                                                    <div className="lote-suggestions show">
                                                        {lotes.filter(l => l.producto_codigo === row.producto_codigo &&
                                                            (row.numero_lote === '' || l.numero_lote.toLowerCase().includes(row.numero_lote.toLowerCase()))
                                                        ).length === 0 ? (
                                                            <div className="lote-suggestion-item" style={{ color: '#999', fontStyle: 'italic' }}>
                                                                No hay lotes para este producto
                                                            </div>
                                                        ) : (
                                                            lotes.filter(l => l.producto_codigo === row.producto_codigo &&
                                                                (row.numero_lote === '' || l.numero_lote.toLowerCase().includes(row.numero_lote.toLowerCase()))
                                                            ).map(l => (
                                                                <div
                                                                    key={l.id}
                                                                    className="lote-suggestion-item"
                                                                    onMouseDown={() => selectLote(row.id, l)}
                                                                >
                                                                    <span className="lote-code">{l.numero_lote}</span>
                                                                    <span className="lote-info">
                                                                        Disp: {l.cantidad_disponible} | Venc: {l.fecha_vencimiento ? new Date(l.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <input className="form-control" style={{ width: '130px', minWidth: '130px' }} type="date" value={row.fecha_venc} onChange={e => setDespachoItems(all => all.map(r => r.id === row.id ? { ...r, fecha_venc: e.target.value } : r))} />
                                            <input className="form-control" style={{ width: '90px', minWidth: '90px' }} type="number" placeholder="Cant" value={row.cantidad} onChange={e => setDespachoItems(all => all.map(r => r.id === row.id ? { ...r, cantidad: Number(e.target.value) } : r))} />
                                            <button className="btn btn-danger" onClick={() => eliminarFila(row.id)}>X</button>
                                        </div>
                                    ))}
                                    <button className="btn btn-primary btn-sm mt-2" onClick={() => agregarFilaLote(item)}>+ Lote</button>
                                </div>
                            )
                        })}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    if (despachoItems.some(i => i.numero_lote)) {
                                        if (confirm('⚠️ Tienes datos sin guardar. ¿Seguro que deseas cancelar?')) {
                                            setModalCompletar(null)
                                        }
                                    } else {
                                        setModalCompletar(null)
                                    }
                                }}
                            >
                                Cancelar
                            </button>
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
                        <div className="print-title">Solicitud diaria y/o reposición de dispositivos médicos - Hospitalarte</div>

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

            <div className="footer-credits flex items-center justify-center gap-4">
                <img src="/logo-dialystock.png" alt="Logo" className="h-8 w-8 object-contain" />
                <span>
                    💻 <strong>Sistema desarrollado por Manuel Madrid</strong> |
                    DialyStock © 2025 |
                    <a
                        href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, soy de la farmacia y necesito soporte con DialyStock.')}`}
                        target="_blank"
                        className="ml-2 text-emerald-400 font-bold hover:underline"
                    >
                        Soporte WhatsApp: +57 304 578 8873
                    </a>
                </span>
            </div>
        </div>
    )
}
