'use client'

import { useState, useEffect } from 'react'
import { Activity, ArrowLeft, Play, Info, CheckCircle2, Box, Waves, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'

export default function DemoPD() {
    const [step, setStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const steps = [
        {
            t: "Asignación de Tratamiento",
            d: "El equipo clínico configura los parámetros de diálisis peritoneal.",
            icon: ClipboardCheck,
            visual: "Orden de Tratamiento - PD No. 23"
        },
        {
            t: "Selección de Concentrados",
            d: "Se eligen las bolsas de solución (Extraneal, Physioneal, etc.).",
            icon: Waves,
            visual: "Soluciones PD 2.27% / 1.5%"
        },
        {
            t: "Sincronización de Insumos",
            d: "Se añaden cassettes, líneas y sets de drenaje al pedido.",
            icon: Box,
            visual: "Inventory Sync: 12 Ítems PD"
        },
        {
            t: "Generación de Orden",
            d: "Se crea el registro digital para facturación y reposición.",
            icon: CheckCircle2,
            visual: "Orden PD-2025-001 Generada"
        }
    ]

    const playSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
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
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Activity className="text-white" size={18} />
                        </div>
                        <span className="font-black text-white uppercase tracking-widest text-sm">Demo PD</span>
                    </Link>
                    <Link href="/" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeft size={14} /> Salir
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-16 px-6">
                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Info size={12} /> Proceso Especializado PD
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 leading-tight">Módulo de Diálisis Peritoneal</h1>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Control total sobre los kits de PD y el flujo de insumos en sala o uso ambulatorio.
                        </p>

                        <div className="space-y-4 mb-12">
                            {steps.map((s, idx) => (
                                <div key={idx} className={`flex gap-4 p-4 rounded-2xl border transition-all ${step === idx ? 'bg-emerald-600/10 border-emerald-500/30 ring-1 ring-emerald-500/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step === idx ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
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
                                className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20"
                            >
                                <Play fill="white" /> Iniciar Demo
                            </button>
                        )}

                        {!isPlaying && step === steps.length - 1 && (
                            <div className="space-y-4">
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-500">
                                    <CheckCircle2 className="text-emerald-500" size={32} />
                                    <div>
                                        <p className="font-bold text-emerald-400">¡PD Sincronizado!</p>
                                        <p className="text-xs text-emerald-300">Trazabilidad completa para diálisis peritoneal.</p>
                                    </div>
                                </div>
                                <Link href="/" className="block text-center text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest pt-4">Reiniciar Demo</Link>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-600/20 blur-[100px] rounded-full"></div>
                        <div className="relative bg-slate-900 border border-emerald-900/30 rounded-[2.5rem] aspect-video shadow-2xl overflow-hidden group">
                            <div className="h-full w-full flex flex-col">
                                <div className="p-4 border-b border-white/5 bg-slate-800/50 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-black/30 rounded-full text-[8px] font-bold uppercase tracking-tighter text-slate-500">pd_operation_v1.2</div>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-12 text-center">
                                    <div key={step} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="w-24 h-24 bg-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                                            {(() => {
                                                const Icon = steps[step].icon
                                                return <Icon className="text-emerald-500 animate-pulse" size={48} />
                                            })()}
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{steps[step].visual}</h2>
                                        <div className="flex items-center justify-center gap-2 mt-6">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-150"></span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-300"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-black/40 text-[10px] font-mono text-slate-600 flex justify-between">
                                    <span>PD_LOG: ACTIVE</span>
                                    <span>STEP: 0{step + 1} / 04</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
