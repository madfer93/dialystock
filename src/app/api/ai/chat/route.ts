import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
    try {
        const { messages } = await response_json(req)

        // 1. Obtener la configuración de IA de Supabase
        const { data: config } = await supabase
            .from('app_settings')
            .select('data')
            .eq('category', 'ai_config')
            .single()

        if (!config || !config.data.keys || config.data.keys.length === 0) {
            return NextResponse.json({ error: 'IA no configurada' }, { status: 500 })
        }

        // 2. Lógica de rotación de llaves (Selección aleatoria para balancear carga)
        const keys = config.data.keys
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        const model = config.data.model || 'llama-3.1-70b-versatile'
        const systemPrompt = config.data.system_prompt || 'Eres el asistente de DialyStock.'

        // 3. Llamada a Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${randomKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
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
