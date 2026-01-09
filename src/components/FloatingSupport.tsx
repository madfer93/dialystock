'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, Bot, Sparkles } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'

const SUGGESTED_QUESTIONS = [
    '¿Cuáles son los precios?',
    '¿Qué incluye el plan Pro?',
    '¿Cómo funciona la prueba gratis?',
    '¿Tienen soporte 24/7?'
]

export default function FloatingSupport() {
    const [showOptions, setShowOptions] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: '¡Hola! Soy el asistente IA de DialyStock. ¿En qué puedo ayudarte hoy con la gestión de tu clínica?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [whatsapp, setWhatsapp] = useState('573045788873')
    const [showSuggestions, setShowSuggestions] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchSocial = async () => {
            const { data } = await supabase.from('app_settings').select('data').eq('category', 'social').single()
            if (data?.data?.whatsapp) setWhatsapp(data.data.whatsapp)
        }
        fetchSocial()
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async (customMessage?: string) => {
        const messageText = customMessage || input
        if (!messageText.trim() || loading) return

        const userMessage = { role: 'user' as const, content: messageText }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)
        setShowSuggestions(false)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] })
            })
            const data = await response.json()

            if (data.error) {
                console.error('API Error:', data.error)
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}. Por favor contacta por WhatsApp.` }])
            } else if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            } else {
                console.error('Respuesta inesperada:', data)
                setMessages(prev => [...prev, { role: 'assistant', content: 'No pude procesar tu mensaje. Intenta de nuevo o contacta por WhatsApp.' }])
            }
        } catch (error) {
            console.error('Fetch error:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error de conexión. Por favor intenta de nuevo.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[9999] flex flex-col items-end gap-3 md:gap-4">
            {/* Chat Window */}
            {isChatOpen && (
                <div className="bg-slate-900 border border-white/10 w-[calc(100vw-2rem)] sm:w-[350px] md:w-[400px] h-[70vh] sm:h-[500px] max-h-[600px] rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="p-4 md:p-6 bg-blue-600 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-white/20 rounded-lg md:rounded-xl">
                                <Bot size={18} className="md:w-5 md:h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-xs md:text-sm uppercase tracking-widest">Asistente IA</h4>
                                <p className="text-[9px] md:text-[10px] text-blue-100 font-bold">Respuesta inmediata</p>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm leading-relaxed",
                                m.role === 'assistant'
                                    ? "bg-slate-800 text-slate-200 self-start border border-white/5"
                                    : "bg-blue-600 text-white self-end ml-auto"
                            )}>
                                {m.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="bg-slate-800 text-slate-400 p-3 md:p-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs flex items-center gap-2 w-fit">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <span className="ml-1 md:ml-2">Escribiendo...</span>
                            </div>
                        )}

                        {/* Preguntas Sugeridas */}
                        {showSuggestions && messages.length <= 1 && !loading && (
                            <div className="mt-3 md:mt-4">
                                <p className="text-[10px] md:text-xs text-slate-500 mb-2 flex items-center gap-1">
                                    <Sparkles size={10} className="md:w-3 md:h-3" /> Preguntas sugeridas:
                                </p>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {SUGGESTED_QUESTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(q)}
                                            className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-full text-[10px] md:text-xs text-blue-300 transition-all hover:scale-105"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 md:p-4 bg-slate-800/50 border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            placeholder="Escribe tu duda aquí..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            className="flex-1 bg-slate-900 border border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={loading || !input.trim()}
                            className="p-2 bg-blue-600 text-white rounded-lg md:rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all"
                        >
                            <Send size={16} className="md:w-[18px] md:h-[18px]" />
                        </button>
                    </div>
                </div>
            )}

            {/* Buttons Group */}
            <div className="flex flex-col gap-2 md:gap-3 items-end">
                {showOptions && (
                    <>
                        <a
                            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, me interesa conocer más sobre DialyStock.')}`}
                            target="_blank"
                            className="flex items-center gap-2 md:gap-3 bg-emerald-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-xl hover:bg-emerald-500 transition-all animate-in slide-in-from-right-8"
                        >
                            <span className="text-xs md:text-sm">WhatsApp</span>
                            <FaWhatsapp size={18} className="md:w-5 md:h-5" />
                        </a>
                        <button
                            onClick={() => { setIsChatOpen(true); setShowOptions(false); }}
                            className="flex items-center gap-2 md:gap-3 bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-xl hover:bg-blue-500 transition-all animate-in slide-in-from-right-8 delay-75"
                        >
                            <span className="text-xs md:text-sm">Asistente IA</span>
                            <Bot size={18} className="md:w-5 md:h-5" />
                        </button>
                    </>
                )}

                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className={cn(
                        "p-4 md:p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 group",
                        showOptions ? "bg-slate-800 text-white rotate-90" : "bg-blue-600 text-white hover:bg-blue-500"
                    )}
                >
                    {showOptions ? <X size={24} className="md:w-7 md:h-7" /> : <MessageCircle size={24} className="md:w-7 md:h-7 group-hover:scale-110 transition-transform" />}
                </button>
            </div>
        </div>
    )
}
