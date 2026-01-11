'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface AdminAIChatProps {
    tenantId: string
    clinicaNombre: string
    darkMode?: boolean
    estadisticas?: {
        totalSolicitudes?: number
        productosTop?: string[]
        tasaAprobacion?: number
    }
}

const SUGERENCIAS = [
    "Cual es mi producto mas usado?",
    "Como va el consumo esta semana?",
    "Que productos deberia reabastecer?",
    "Dame un resumen de la actividad de hoy",
    "Cuales solicitudes fueron auto-aprobadas?",
    "Quien es el empleado mas activo?"
]

export function AdminAIChat({ tenantId, clinicaNombre, darkMode, estadisticas }: AdminAIChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Mensaje inicial de bienvenida
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: `Hola! Soy tu asistente de IA para ${clinicaNombre}. Puedo ayudarte a analizar el consumo, identificar patrones y optimizar tu gestion. Que te gustaria saber?`,
                timestamp: new Date()
            }])
        }
    }, [clinicaNombre])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/admin-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    tenantId,
                    clinicaNombre,
                    estadisticas,
                    historial: messages.slice(-6).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            })

            if (!response.ok) {
                throw new Error('Error al comunicarse con la IA')
            }

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || 'No pude procesar tu solicitud. Intenta de nuevo.',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (err: any) {
            setError(err.message || 'Error de conexion')
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleSuggestion = (suggestion: string) => {
        setInput(suggestion)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const clearChat = () => {
        setMessages([{
            id: 'welcome-new',
            role: 'assistant',
            content: `Chat reiniciado. Como puedo ayudarte con la gestion de ${clinicaNombre}?`,
            timestamp: new Date()
        }])
    }

    const bgColor = darkMode ? 'bg-gray-800' : 'bg-white'
    const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200'
    const textColor = darkMode ? 'text-white' : 'text-gray-900'
    const mutedColor = darkMode ? 'text-gray-400' : 'text-gray-500'

    return (
        <div className={`${bgColor} rounded-xl shadow-lg border ${borderColor} overflow-hidden flex flex-col h-[500px]`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">Asistente IA</h3>
                        <p className="text-xs opacity-80">Analisis inteligente para tu clinica</p>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                    title="Reiniciar chat"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === 'assistant'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                            {message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                            message.role === 'assistant'
                                ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                                : 'bg-blue-600 text-white'
                        }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                                message.role === 'assistant' ? mutedColor : 'text-blue-200'
                            }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <p className={`text-xs ${mutedColor} mb-2`}>Sugerencias:</p>
                    <div className="flex flex-wrap gap-2">
                        {SUGERENCIAS.slice(0, 3).map((sug, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestion(sug)}
                                className={`text-xs px-3 py-1.5 rounded-full border ${borderColor} hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition`}
                            >
                                {sug}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className={`p-4 border-t ${borderColor}`}>
                {error && (
                    <p className="text-xs text-red-500 mb-2">{error}</p>
                )}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Pregunta algo sobre tu clinica..."
                        className={`flex-1 px-4 py-2 rounded-xl border ${borderColor} ${bgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminAIChat
