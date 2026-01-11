/**
 * Hook de Aprendizaje Automático - DialyStock
 *
 * Este hook captura silenciosamente eventos del usuario para:
 * - Aprender patrones de comportamiento
 * - Detectar anomalías
 * - Generar alertas inteligentes
 * - Mejorar la experiencia del usuario con el tiempo
 */

import { useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Tipos de eventos que capturamos
export type TipoEvento =
    | 'solicitud_creada'
    | 'solicitud_completada'
    | 'solicitud_aprobada'
    | 'solicitud_devuelta'
    | 'producto_agregado_carrito'
    | 'producto_eliminado_carrito'
    | 'busqueda_producto'
    | 'vista_historial'
    | 'alerta_subir_pedido'
    | 'login'
    | 'logout'
    | 'cambio_tema'
    | 'uso_favoritos'
    | 'impresion_documento'
    | 'error_sistema'

export type CategoriaEvento =
    | 'sala_hd'
    | 'sala_pd'
    | 'farmacia'
    | 'jefe_hd'
    | 'jefe_pd'
    | 'admin'
    | 'sistema'

interface EventoData {
    [key: string]: any
}

interface ContextoUsuario {
    tenantId: string
    userId: string
    userName: string
    userRole: string
}

// Cola de eventos para enviar en batch (más eficiente)
let eventQueue: Array<{
    tipo: TipoEvento
    categoria: CategoriaEvento
    datos: EventoData
    timestamp: Date
}> = []

let flushTimeout: NodeJS.Timeout | null = null
const BATCH_DELAY = 5000 // 5 segundos
const MAX_QUEUE_SIZE = 10

export function useLearningAnalytics(contexto: ContextoUsuario | null) {
    const contextoRef = useRef(contexto)

    // Actualizar contexto cuando cambie
    useEffect(() => {
        contextoRef.current = contexto
    }, [contexto])

    /**
     * Registra un evento silenciosamente
     * No bloquea la UI ni muestra errores al usuario
     */
    const registrarEvento = useCallback(async (
        tipo: TipoEvento,
        categoria: CategoriaEvento,
        datos: EventoData = {}
    ) => {
        const ctx = contextoRef.current
        if (!ctx?.tenantId) return // Sin contexto, no registrar

        // Agregar a la cola
        eventQueue.push({
            tipo,
            categoria,
            datos: {
                ...datos,
                // Agregar metadata útil
                url: typeof window !== 'undefined' ? window.location.pathname : '',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            },
            timestamp: new Date()
        })

        // Si la cola está llena, enviar inmediatamente
        if (eventQueue.length >= MAX_QUEUE_SIZE) {
            flushEvents(ctx)
        } else {
            // Programar envío en batch
            if (flushTimeout) clearTimeout(flushTimeout)
            flushTimeout = setTimeout(() => flushEvents(ctx), BATCH_DELAY)
        }
    }, [])

    /**
     * Envía los eventos acumulados a la base de datos
     */
    const flushEvents = async (ctx: ContextoUsuario) => {
        if (eventQueue.length === 0) return

        const eventsToSend = [...eventQueue]
        eventQueue = []

        try {
            // Enviar cada evento (podríamos optimizar con batch insert)
            for (const evento of eventsToSend) {
                await supabase.rpc('registrar_evento_aprendizaje', {
                    p_tenant_id: ctx.tenantId,
                    p_tipo_evento: evento.tipo,
                    p_categoria: evento.categoria,
                    p_usuario_id: ctx.userId,
                    p_usuario_nombre: ctx.userName,
                    p_usuario_rol: ctx.userRole,
                    p_datos: evento.datos
                })
            }
            console.log(`📊 ${eventsToSend.length} eventos de aprendizaje registrados`)
        } catch (error) {
            // Silenciosamente ignorar errores - no queremos afectar la UX
            console.debug('Analytics error (silenciado):', error)
        }
    }

    /**
     * Helpers para eventos comunes
     */
    const eventos = {
        // Solicitudes
        solicitudCreada: (datos: { solicitudId: string; productos: number; tipo: string }) => {
            registrarEvento('solicitud_creada', categoriaDesdeTipo(datos.tipo), datos)
        },

        solicitudCompletada: (datos: { solicitudId: string; tiempoCompletado: number }) => {
            registrarEvento('solicitud_completada', 'farmacia', datos)
        },

        solicitudAprobada: (datos: { solicitudId: string }) => {
            registrarEvento('solicitud_aprobada', 'jefe_hd', datos)
        },

        solicitudDevuelta: (datos: { solicitudId: string; motivo: string }) => {
            registrarEvento('solicitud_devuelta', 'jefe_hd', datos)
        },

        // Carrito
        productoAgregado: (datos: { productoId: string; cantidad: number }) => {
            registrarEvento('producto_agregado_carrito', 'sala_hd', datos)
        },

        productoEliminado: (datos: { productoId: string }) => {
            registrarEvento('producto_eliminado_carrito', 'sala_hd', datos)
        },

        // Búsquedas
        busqueda: (datos: { termino: string; resultados: number }) => {
            registrarEvento('busqueda_producto', 'sistema', datos)
        },

        // Navegación
        vistaHistorial: () => {
            registrarEvento('vista_historial', 'sistema', {})
        },

        // Alertas
        alertaSubir: (datos: { solicitudId: string }) => {
            registrarEvento('alerta_subir_pedido', 'sala_hd', datos)
        },

        // Sesión
        login: (datos: { metodo: string }) => {
            registrarEvento('login', 'sistema', datos)
        },

        logout: () => {
            registrarEvento('logout', 'sistema', {})
        },

        // UI
        cambioTema: (datos: { tema: string; darkMode: boolean }) => {
            registrarEvento('cambio_tema', 'sistema', datos)
        },

        usoFavoritos: (datos: { accion: 'agregar' | 'quitar'; productoId: string }) => {
            registrarEvento('uso_favoritos', 'sala_hd', datos)
        },

        impresion: (datos: { documento: string }) => {
            registrarEvento('impresion_documento', 'sistema', datos)
        },

        // Errores (para detectar problemas)
        error: (datos: { mensaje: string; stack?: string }) => {
            registrarEvento('error_sistema', 'sistema', datos)
        }
    }

    return {
        registrarEvento,
        eventos
    }
}

// Helper para determinar categoría desde tipo de solicitud
function categoriaDesdeTipo(tipo: string): CategoriaEvento {
    if (tipo.toLowerCase().includes('hd')) return 'sala_hd'
    if (tipo.toLowerCase().includes('pd')) return 'sala_pd'
    return 'sistema'
}

/**
 * Hook simplificado para usar en componentes sin contexto completo
 * Útil para componentes que solo necesitan registrar eventos
 */
export function useSimpleLearningAnalytics() {
    const registrarEventoSimple = useCallback(async (
        tenantId: string,
        tipoEvento: TipoEvento,
        categoria: CategoriaEvento,
        datos: EventoData = {}
    ) => {
        if (!tenantId) return

        try {
            await supabase.rpc('registrar_evento_aprendizaje', {
                p_tenant_id: tenantId,
                p_tipo_evento: tipoEvento,
                p_categoria: categoria,
                p_usuario_id: null,
                p_usuario_nombre: 'Sistema',
                p_usuario_rol: 'sistema',
                p_datos: datos
            })
        } catch (error) {
            // Silencioso
            console.debug('Analytics simple error:', error)
        }
    }, [])

    return { registrarEventoSimple }
}

export default useLearningAnalytics
