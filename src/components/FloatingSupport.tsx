'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, Bot, Rocket, ShieldCheck, Zap } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'

export default function FloatingSupport() {
    const [isOpen, setIsOpen] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: '¡Hola! Soy el asistente IA de DialyStock. ¿En qué puedo ayudarte hoy con la gestión de tu clínica?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [whatsapp, setWhatsapp] = useState('573045788873')
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

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return

        const userMessage = { role: 'user' as const, content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

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
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4">
            {/* Chat Window */}
            {isChatOpen && (
                <div className="bg-slate-900 border border-white/10 w-[350px] md:w-[400px] h-[500px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="p-6 bg-blue-600 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-widest">Asistente IA</h4>
                                <p className="text-[10px] text-blue-100 font-bold">Respuesta inmediata</p>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                                m.role === 'assistant'
                                    ? "bg-slate-800 text-slate-200 self-start border border-white/5"
                                    : "bg-blue-600 text-white self-end ml-auto"
                            )}>
                                {m.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="bg-slate-800 text-slate-400 p-4 rounded-2xl text-xs flex items-center gap-2 w-fit">
                                <Zap size={14} className="animate-pulse text-yellow-400" /> DialyStock está pensando...
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-800/50 border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            placeholder="Escribe tu duda aquí..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={loading || !input.trim()}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Buttons Group */}
            <div className="flex flex-col gap-3 items-end">
                {showOptions && (
                    <>
                        <a
                            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, me interesa conocer más sobre DialyStock.')}`}
                            target="_blank"
                            className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-emerald-500 transition-all animate-in slide-in-from-right-8"
                        >
                            <span className="text-sm">Hablar por WhatsApp</span>
                            <FaWhatsapp size={20} />
                        </a>
                        <button
                            onClick={() => { setIsChatOpen(true); setShowOptions(false); }}
                            className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-blue-500 transition-all animate-in slide-in-from-right-8 delay-75"
                        >
                            <span className="text-sm">Asistente IA</span>
                            <Bot size={20} />
                        </button>
                    </>
                )}

                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className={cn(
                        "p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 group",
                        showOptions ? "bg-slate-800 text-white rotate-90" : "bg-blue-600 text-white hover:bg-blue-500"
                    )}
                >
                    {showOptions ? <X size={28} /> : <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />}
                </button>
            </div>
        </div>
    )
}
