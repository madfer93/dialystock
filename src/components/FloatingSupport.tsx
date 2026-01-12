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
                <div className="fixed inset-x-4 bottom-24 sm:relative sm:inset-auto sm:mb-4 bg-slate-900/80 backdrop-blur-2xl border border-white/20 w-auto sm:w-[400px] h-[75vh] sm:h-[600px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-[10000]">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-between text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Bot size={24} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tighter">DialyStock AI</h4>
                                <p className="text-[10px] text-blue-100 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Soporte Inteligente Activo
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-all relative z-10">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all animate-in slide-in-from-bottom-2",
                                m.role === 'assistant'
                                    ? "bg-slate-800/90 text-slate-100 self-start border border-white/5 rounded-tl-none"
                                    : "bg-indigo-600 text-white self-end ml-auto rounded-tr-none"
                            )}>
                                {m.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="bg-slate-800/80 backdrop-blur-sm text-slate-300 p-4 rounded-3xl text-xs flex items-center gap-3 w-fit animate-pulse">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="font-medium">Pensando...</span>
                            </div>
                        )}

                        {/* Suggestions */}
                        {showSuggestions && messages.length <= 1 && !loading && (
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] text-slate-500 mb-3 px-2 flex items-center gap-2 font-bold uppercase tracking-widest">
                                    <Sparkles size={12} className="text-amber-400" /> Consultas rápidas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED_QUESTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(q)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] text-slate-300 transition-all hover:scale-105 active:scale-95"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900/50 backdrop-blur-md border-t border-white/10 flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Escribe tu mensaje..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                            />
                        </div>
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={loading || !input.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                        >
                            <Send size={20} />
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
