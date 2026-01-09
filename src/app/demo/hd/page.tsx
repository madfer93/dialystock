'use client'

import { useState, useEffect } from 'react'
import { Droplet, ArrowLeft, Play, Info, CheckCircle2, Package, Clock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function DemoHD() {
    const [step, setStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const steps = [
        {
            t: "Selección de Sala",
            d: "El personal de enfermería selecciona su turno y sala de hemodiálisis.",
            icon: Droplet,
            visual: "Dashboard HD - Sala 04"
        },
        {
            t: "Escaneo de Suministros",
            d: "Se cargan automáticamente los filtros, líneas y agujas necesarios.",
            icon: Package,
            visual: "Cargando Kit HD Premium..."
        },
        {
            t: "Validación de Lotes",
            d: "El sistema verifica fechas de vencimiento en tiempo real.",
            icon: ShieldCheck,
            visual: "Lote L2024-HD Verificado ✓"
        },
        {
            t: "Despacho Automático",
            d: "Farmacia recibe la alerta sonora y prepara el pedido al instante.",
            icon: Clock,
            visual: "Solicitud enviada a Farmacia Central"
        }
    ]

    const playSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Notification sound
        audio.play().catch(() => { })
    }

    useEffect(() => {
        if (isPlaying) {
            const timer = setInterval(() => {
                setStep((prev) => {
                    if (prev < steps.length - 1) {
                        playSound()
                        return prev + 1
                    }
                    setIsPlaying(false)
                    return prev
                })
            }, 3000)
            return () => clearInterval(timer)
        }
    }, [isPlaying])

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300">
            <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Droplet className="text-white" size={18} />
                        </div>
                        <span className="font-black text-white uppercase tracking-widest text-sm">Demo HD</span>
                    </Link>
                    <Link href="/" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeft size={14} /> Salir de Demo
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-16 px-6">
                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Info size={12} /> Simulación de Proceso Real
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 leading-tight">Módulo de Hemodiálisis</h1>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Experimenta cómo DialyStock reduce el tiempo de solicitud de 15 minutos a menos de 30 segundos.
                        </p>

                        <div className="space-y-4 mb-12">
                            {steps.map((s, idx) => (
                                <div key={idx} className={`flex gap-4 p-4 rounded-2xl border transition-all ${step === idx ? 'bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step === idx ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        <s.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold transition-colors ${step === idx ? 'text-white' : 'text-slate-500'}`}>{s.t}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{s.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!isPlaying && step === 0 && (
                            <button
                                onClick={() => { setIsPlaying(true); playSound(); }}
                                className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                            >
                                <Play fill="white" /> Iniciar Recorrido
                            </button>
                        )}

                        {!isPlaying && step === steps.length - 1 && (
                            <div className="space-y-4">
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-500">
                                    <CheckCircle2 className="text-emerald-500" size={32} />
                                    <div>
                                        <p className="font-bold text-emerald-400">¡Simulación Completada!</p>
                                        <p className="text-xs text-emerald-300">Así de fácil es gestionar una clínica con DialyStock.</p>
                                    </div>
                                </div>
                                <Link href="/" className="block text-center text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest pt-4">Reiniciar Demo</Link>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full"></div>
                        <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] aspect-video shadow-2xl overflow-hidden group">
                            {/* Simulated UI Content */}
                            <div className="h-full w-full flex flex-col">
                                <div className="p-4 border-b border-white/5 bg-slate-800/50 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-black/30 rounded-full text-[8px] font-bold uppercase tracking-tighter text-slate-500">dialystock_v3.5_mockup</div>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-12 text-center">
                                    <div key={step} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
                                            {(() => {
                                                const Icon = steps[step].icon
                                                return <Icon className="text-blue-500 animate-pulse" size={48} />
                                            })()}
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{steps[step].visual}</h2>
                                        <div className="flex items-center justify-center gap-2 mt-6">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150"></span>
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-300"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-black/40 text-[10px] font-mono text-slate-600 flex justify-between">
                                    <span>STATUS: RUNNING_SIMULATION</span>
                                    <span>STEP: 0{step + 1} / 04</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                    Experiencia de Usuario DialyStock | © 2025
                </p>
            </footer>
        </div>
    )
}
