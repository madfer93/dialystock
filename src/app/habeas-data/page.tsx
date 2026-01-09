'use client'

import { Fingerprint, Landmark, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

export default function HabeasData() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-300">
            <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo-dialystock.png" alt="Logo" className="h-8 w-8 object-contain" />
                        <span className="text-xl font-black text-white">DialyStock</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Inicio
                    </Link>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto py-16 px-6 leading-relaxed">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <Fingerprint className="text-indigo-500" size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-white">Habeas Data</h1>
                </div>

                <div className="space-y-8 text-slate-400">
                    <p className="text-lg">
                        El **Habeas Data** es un derecho fundamental consagrado en la **Constitución Política de Colombia (Art. 15)** que permite a toda persona conocer, actualizar y rectificar la información que se haya recogido sobre ella en bases de datos.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic text-indigo-400">Nuestra Responsabilidad</h2>
                        <p>
                            En DialyStock, actuamos como custodios de la información cargada por las clínicas. Reconocemos la importancia de este derecho y garantizamos canales de comunicación abiertos para que cualquier usuario pueda solicitar la revisión de sus datos registrados en la plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic text-indigo-400">Principios de Protección</h2>
                        <ul className="grid md:grid-cols-2 gap-4">
                            <li className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="block font-bold text-white mb-1">Veracidad</span>
                                <span className="text-xs">La información debe ser veraz, completa, exacta y actualizada.</span>
                            </li>
                            <li className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="block font-bold text-white mb-1">Seguridad</span>
                                <span className="text-xs">Uso de protocolos técnicos para evitar adulteración o pérdida.</span>
                            </li>
                            <li className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="block font-bold text-white mb-1">Confidencialidad</span>
                                <span className="text-xs">Garantía de reserva de la información incluso después de finalizar la relación.</span>
                            </li>
                            <li className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="block font-bold text-white mb-1">Legalidad</span>
                                <span className="text-xs">Tratamiento sujeto a lo establecido legalmente.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Landmark className="text-indigo-400" />
                            <h2 className="text-xl font-bold text-white italic">Procedimiento de Reclamo</h2>
                        </div>
                        <p className="text-sm italic mb-6">
                            Si siente que sus derechos de Habeas Data han sido vulnerados o si desea simplemente ejercer su derecho de rectificación, siga este procedimiento:
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                                <p className="text-sm">Envíe un correo a **madfer1993@gmail.com** con el asunto "Derecho de Habeas Data".</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                                <p className="text-sm">Adjunte su nombre completo y el dato específico que desea conocer, actualizar o eliminar.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                                <p className="text-sm">Recibirá una respuesta en un plazo máximo de cinco (5) días hábiles.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-12 border-t border-white/5 text-center text-xs text-slate-600 font-bold uppercase tracking-widest leading-loose">
                Derecho Fundamental Art. 15 | Constitución de Colombia <br />
                DialyStock PRO | Manuel Madrid
            </footer>
        </div>
    )
}
