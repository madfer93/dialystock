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
                <div className="fixed inset-x-4 bottom-24 sm:relative sm:inset-auto sm:mb-4 bg-slate-950 border border-white/10 w-auto sm:w-[380px] h-[70vh] sm:h-[550px] rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-[10000]">
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <Bot size={22} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight">Asistente DialyStock</h4>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                                    <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider">En línea</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/50">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "max-w-[88%] p-3.5 text-sm leading-relaxed shadow-md transition-all animate-in slide-in-from-bottom-2",
                                m.role === 'assistant'
                                    ? "bg-slate-900 text-slate-200 self-start rounded-2xl rounded-tl-sm border border-slate-800"
                                    : "bg-blue-600 text-white self-end ml-auto rounded-2xl rounded-tr-sm shadow-blue-900/20"
                            )}>
                                {m.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="bg-slate-900 text-slate-400 p-3 rounded-2xl rounded-tl-sm text-xs flex items-center gap-2 w-fit border border-slate-800 animate-pulse">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {showSuggestions && messages.length <= 1 && !loading && (
                            <div className="pt-2">
                                <p className="text-[10px] text-slate-500 mb-3 ml-1 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={11} className="text-blue-400" /> Atajos sugeridos
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED_QUESTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(q)}
                                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] text-slate-300 transition-all hover:border-blue-500/50 active:scale-95"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex gap-2">
                        <input
                            type="text"
                            placeholder="¿En qué puedo ayudarte?"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={loading || !input.trim()}
                            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-all shadow-lg active:scale-90"
                        >
                            <Send size={18} />
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
