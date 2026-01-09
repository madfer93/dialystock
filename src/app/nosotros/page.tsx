'use client'

import { Leaf, Target, Eye, ArrowLeft, Clock, Zap, ShieldCheck, Activity } from 'lucide-react'
import Link from 'next/link'
import SharedFooter from '@/components/SharedFooter'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Nosotros() {
    const [nosotros, setNosotros] = useState({
        mision: 'Nuestra misión es transformar la gestión operativa de las unidades renales a través de herramientas digitales de vanguardia. Buscamos eliminar el error humano, garantizar la trazabilidad total de los suministros críticos y permitir que el personal de salud se enfoque en lo que más importa: el cuidado del paciente.',
        vision: 'Para el año 2028, DialyStock será el estándar de oro en la gestión de inventario médico digital para clínicas renales en toda Latinoamérica. Aspiramos a ser una plataforma integral de datos que prediga necesidades, optimice recursos y eleve la eficiencia hospitalaria a niveles de clase mundial.',
        paper_savings: '25 → 0',
        time_saved: '-70%'
    })

    useEffect(() => {
        const fetchNosotros = async () => {
            const { data } = await supabase.from('app_settings').select('data').eq('category', 'nosotros').single()
            if (data) setNosotros(data.data)
        }
        fetchNosotros()
    }, [])

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
            </div>

            <nav className="relative z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo-dialystock.png" alt="Logo" className="h-8 w-8 object-contain" />
                        <span className="text-xl font-black text-white">DialyStock</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Volver
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto py-20 px-6">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6">¿Quiénes Somos?</h1>
                    <p className="text-xl text-slate-400">Innovación tecnológica dedicada a la salud renal.</p>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
                    <div className="bg-slate-800/50 border border-white/10 rounded-[2.5rem] p-10 hover:bg-slate-800 transition-all">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
                            <Target className="text-white" size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-4">Misión</h2>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {nosotros.mision}
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-white/10 rounded-[2.5rem] p-10 hover:bg-slate-800 transition-all">
                        <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-purple-600/20">
                            <Eye className="text-white" size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-4">Visión</h2>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {nosotros.vision}
                        </p>
                    </div>
                </section>

                <section className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] p-12 md:p-16 relative overflow-hidden mb-32">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                            <Leaf className="text-white" size={40} />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6">Compromiso con el Planeta</h2>
                        <div className="grid md:grid-cols-3 gap-8 mt-12">
                            <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                                <p className="text-4xl font-black text-white mb-2">{nosotros.paper_savings}</p>
                                <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Hojas de papel por solicitud</p>
                            </div>
                            <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                                <p className="text-4xl font-black text-white mb-2">100%</p>
                                <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Operación Digital Libres de Tinta</p>
                            </div>
                            <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                                <p className="text-4xl font-black text-white mb-2">{nosotros.time_saved}</p>
                                <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Tiempo Ahorrado en Trámites</p>
                            </div>
                        </div>
                        <p className="mt-12 text-xl text-emerald-50 font-medium max-w-2xl mx-auto">
                            No solo optimizamos tu stock; protegemos el ecosistema. Al eliminar la burocracia documental, devolvemos tiempo valioso a tu equipo y vida a nuestros bosques.
                        </p>
                    </div>
                </section>

                <section className="text-center">
                    <h2 className="text-2xl font-black text-white mb-8">Nuestros Pilares</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { i: Clock, t: 'Tiempo Real', c: 'text-blue-400' },
                            { i: ShieldCheck, t: 'Seguridad', c: 'text-emerald-400' },
                            { i: Zap, t: 'Agilidad', c: 'text-yellow-400' },
                            { i: Activity, t: 'Trazabilidad', c: 'text-purple-400' }
                        ].map((p, i) => {
                            const Icon = p.i
                            return (
                                <div key={i} className="p-6 bg-slate-800/30 border border-white/5 rounded-2xl">
                                    <Icon className={`${p.c} mx-auto mb-3`} size={24} />
                                    <p className="text-xs font-bold uppercase tracking-widest">{p.t}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </main>

            <SharedFooter />
        </div>
    )
}
