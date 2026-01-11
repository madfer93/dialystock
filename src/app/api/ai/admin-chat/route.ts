import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente se inicializará dentro del handler para evitar errores de build
// si faltan las variables de entorno en tiempo de compilación

export async function POST(req: Request) {
    try {
        // Inicializar cliente aquí para seguridad en build-time
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error('Faltan variables de entorno de Supabase')
            return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

        const body = await req.json()
        const { message, tenantId, clinicaNombre, estadisticas, historial } = body

        if (!message || !tenantId) {
            return NextResponse.json({ error: 'Mensaje y tenant requeridos' }, { status: 400 })
        }

        // 1. Obtener API keys de Groq
        const { data: aiConfig } = await supabaseAdmin
            .from('app_settings')
            .select('data')
            .eq('category', 'ai_config')
            .single()

        if (!aiConfig?.data?.keys || aiConfig.data.keys.length === 0) {
            return NextResponse.json({ error: 'IA no configurada' }, { status: 500 })
        }

        const keys = aiConfig.data.keys
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        const model = aiConfig.data.model === 'llama-3.1-70b-versatile'
            ? 'llama-3.3-70b-versatile'
            : (aiConfig.data.model || 'llama-3.3-70b-versatile')

        // 2. Obtener datos de la clínica para contexto
        const [
            solicitudesResult,
            productosResult,
            eventosResult,
            autoAprobacionesResult,
            productosConfiablesResult
        ] = await Promise.all([
            // Solicitudes últimos 30 días
            supabaseAdmin
                .from('solicitudes')
                .select('id, estado, estado_aprobacion, solicitante, area, created_at')
                .eq('tenant_id', tenantId)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: false }),

            // Top productos solicitados
            supabaseAdmin
                .from('solicitudes_items')
                .select('producto_codigo, descripcion, cantidad_solicitada')
                .eq('tenant_id', tenantId),

            // Eventos de aprendizaje
            supabaseAdmin
                .from('eventos_aprendizaje')
                .select('tipo_evento, categoria, hora_del_dia, dia_semana, created_at')
                .eq('tenant_id', tenantId)
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

            // Auto-aprobaciones
            supabaseAdmin
                .from('auto_aprobaciones_log')
                .select('decision, confianza_promedio, created_at')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })
                .limit(20),

            // Productos confiables
            supabaseAdmin
                .from('productos_confiables')
                .select('producto_codigo, descripcion, nivel_confianza, veces_aprobado')
                .eq('tenant_id', tenantId)
                .gte('nivel_confianza', 70)
                .order('nivel_confianza', { ascending: false })
                .limit(10)
        ])

        // 3. Procesar datos para contexto
        const solicitudes = solicitudesResult.data || []
        const productosItems = productosResult.data || []
        const eventos = eventosResult.data || []
        const autoAprobaciones = autoAprobacionesResult.data || []
        const productosConfiables = productosConfiablesResult.data || []

        // Calcular métricas
        const totalSolicitudes = solicitudes.length
        const solicitudesHoy = solicitudes.filter(s =>
            new Date(s.created_at).toDateString() === new Date().toDateString()
        ).length
        const aprobadas = solicitudes.filter(s => s.estado_aprobacion === 'aprobado').length
        const tasaAprobacion = totalSolicitudes > 0 ? Math.round((aprobadas / totalSolicitudes) * 100) : 0

        // Productos más solicitados
        const productoConteo: Record<string, { codigo: string, descripcion: string, cantidad: number }> = {}
        productosItems.forEach(item => {
            if (!productoConteo[item.producto_codigo]) {
                productoConteo[item.producto_codigo] = {
                    codigo: item.producto_codigo,
                    descripcion: item.descripcion || item.producto_codigo,
                    cantidad: 0
                }
            }
            productoConteo[item.producto_codigo].cantidad += item.cantidad_solicitada || 1
        })
        const topProductos = Object.values(productoConteo)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5)

        // Hora pico
        const horaCounts: Record<number, number> = {}
        eventos.forEach(e => {
            horaCounts[e.hora_del_dia] = (horaCounts[e.hora_del_dia] || 0) + 1
        })
        const horaPico = Object.entries(horaCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

        // Día más activo
        const diaNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const diaCounts: Record<number, number> = {}
        eventos.forEach(e => {
            diaCounts[e.dia_semana] = (diaCounts[e.dia_semana] || 0) + 1
        })
        const diaMasActivo = Object.entries(diaCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0]
        const diaMasActivoNombre = diaMasActivo ? diaNombres[parseInt(diaMasActivo)] : 'N/A'

        // 4. Construir prompt con contexto de datos reales
        const systemPrompt = `
Eres el asistente de análisis inteligente para "${clinicaNombre}".
Tu rol es ayudar al administrador de la clínica a entender sus datos y optimizar la gestión.

## DATOS ACTUALES DE LA CLÍNICA (últimos 30 días)

### Solicitudes
- Total solicitudes: ${totalSolicitudes}
- Solicitudes hoy: ${solicitudesHoy}
- Tasa de aprobación: ${tasaAprobacion}%
- Aprobadas: ${aprobadas}
- Pendientes: ${solicitudes.filter(s => s.estado_aprobacion === 'pendiente_revision').length}

### Productos más solicitados
${topProductos.map((p, i) => `${i + 1}. ${p.descripcion} (${p.codigo}): ${p.cantidad} unidades`).join('\n') || 'Sin datos suficientes'}

### Productos confiables para auto-aprobación
${productosConfiables.map(p => `- ${p.descripcion} (${p.producto_codigo}): ${Math.round(p.nivel_confianza)}% confianza, ${p.veces_aprobado} aprobaciones`).join('\n') || 'Aún no hay productos con suficiente historial'}

### Patrones detectados
- Hora pico de actividad: ${horaPico}:00 hrs
- Día más activo: ${diaMasActivoNombre}

### Auto-aprobaciones IA
- Total auto-aprobaciones: ${autoAprobaciones.filter(a => a.decision === 'auto_aprobado').length}
- Confianza promedio: ${autoAprobaciones.length > 0 ? Math.round(autoAprobaciones.reduce((sum, a) => sum + (a.confianza_promedio || 0), 0) / autoAprobaciones.length) : 0}%

## REGLAS DE NEGOCIO
- La clínica opera de Lunes a Sábado (Domingos cerrado)
- Los sábados la Jefe HD no trabaja, la IA puede auto-aprobar solicitudes confiables
- Un producto es "confiable" si tiene 70%+ de aprobaciones en su historial

## INSTRUCCIONES
- Responde en español, de forma clara y concisa
- Usa los datos reales proporcionados arriba
- Si te preguntan por un dato específico que no tienes, indícalo honestamente
- Ofrece sugerencias de optimización basadas en los patrones
- Cuando menciones números, sé preciso con los datos proporcionados
- Si preguntan por productos a reabastecer, analiza los más solicitados
- Explica el sistema de auto-aprobación si preguntan
`

        // 5. Preparar mensajes para la API
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...(historial || []).slice(-6),
            { role: 'user', content: message }
        ]

        // 6. Llamada a Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${randomKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 800
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Groq API Error:', response.status, data)
            return NextResponse.json({
                error: data.error?.message || 'Error en servicio de IA'
            }, { status: 500 })
        }

        if (data.choices && data.choices[0]) {
            return NextResponse.json({
                response: data.choices[0].message.content,
                metricas: {
                    totalSolicitudes,
                    solicitudesHoy,
                    tasaAprobacion,
                    topProductos: topProductos.slice(0, 3).map(p => p.descripcion)
                }
            })
        }

        return NextResponse.json({ error: 'Respuesta de IA inválida' }, { status: 500 })

    } catch (error) {
        console.error('Error Admin AI Chat:', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Error procesando solicitud'
        }, { status: 500 })
    }
}
