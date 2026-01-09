import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
    try {
        const { messages } = await response_json(req)

        // 1. Obtener configuraciones de Supabase
        const [aiConfig, socialConfig] = await Promise.all([
            supabase.from('app_settings').select('data').eq('category', 'ai_config').single(),
            supabase.from('app_settings').select('data').eq('category', 'social').single()
        ])

        const config = aiConfig.data
        const social = socialConfig.data?.data || {}

        if (!config || !config.data.keys || config.data.keys.length === 0) {
            return NextResponse.json({ error: 'IA no configurada' }, { status: 500 })
        }

        // 2. Lógica de rotación de llaves
        const keys = config.data.keys
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        const model = config.data.model || 'llama-3.1-70b-versatile'

        // 3. Construir prompt con contexto completo del negocio
        const businessContext = `
Eres el asistente virtual de DialyStock, una plataforma líder en gestión de inventarios para clínicas de diálisis.

## INFORMACIÓN DE CONTACTO
- WhatsApp: ${social.whatsapp || '573045788873'}
- Email: ${social.email || 'soporte@dialystock.com'}

## PLANES Y PRECIOS
1. **Plan Starter (Gratis por 30 días)**: Ideal para probar. Incluye 1 sede, módulos HD/PD básicos, trazabilidad de insumos.
2. **Plan Professional ($500.000 COP/mes)**: Para clínicas en crecimiento. Hasta 5 sedes, auditoría pro, módulo farmacia premium, soporte 24/7.
3. **Plan Enterprise ($1.000.000+ COP/mes)**: Para redes hospitalarias. Sedes ilimitadas, analítica con IA, roles personalizados, gestor dedicado.

## TU ROL
- Responde preguntas sobre la plataforma DialyStock
- Ayuda a entender los beneficios de la gestión digital de inventarios
- Cuando pregunten por precios, da la información de los planes
- Si quieren comprar, indica que pueden hacerlo desde la sección de Planes en la web o contactar por WhatsApp
- Sé profesional, amable y conciso
- Enfatiza el ahorro de papel (10,000 hojas/año) y la eficiencia (+85%)
- NO inventes información. Si no sabes algo, sugiere contactar por WhatsApp.

${config.data.system_prompt || ''}
`

        // 4. Llamada a Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${randomKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: businessContext },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        })

        const data = await response.json()

        if (data.choices && data.choices[0]) {
            return NextResponse.json({ reply: data.choices[0].message.content })
        } else {
            console.error('Error Groq Response:', data)
            throw new Error('Respuesta de Groq inválida')
        }

    } catch (error) {
        console.error('Error AI Chat:', error)
        return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 })
    }
}

// Helper para parsear JSON de forma segura
async function response_json(req: Request) {
    const text = await req.text()
    return JSON.parse(text)
}
