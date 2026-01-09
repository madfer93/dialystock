'use client'

import { Shield, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SharedFooter from '@/components/SharedFooter'

export default function Privacidad() {
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
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Shield className="text-blue-500" size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-white">Política de Privacidad</h1>
                </div>

                <div className="space-y-8 text-slate-400">
                    <p className="text-lg">
                        En **DialyStock**, la privacidad de nuestros usuarios y la seguridad de la información médica son nuestra prioridad absoluta. Esta política describe cómo recolectamos, usamos y protegemos sus datos.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic">1. Recolección de Información</h2>
                        <p>
                            Recopilamos información necesaria para la operación del sistema, incluyendo nombres de usuario, correos electrónicos corporativos, logs de actividad y registros de inventario. No recolectamos información personal sensible fuera de lo estrictamente necesario para la gestión logística de la clínica.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic">2. Uso de los Datos</h2>
                        <p>
                            Los datos recolectados se utilizan exclusivamente para:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li>Gestionar solicitudes de suministros.</li>
                            <li>Generar reportes de trazabilidad y consumo.</li>
                            <li>Enviar notificaciones de estado de pedidos.</li>
                            <li>Mejorar la eficiencia operativa del sistema.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic">3. Seguridad de la Información</h2>
                        <p>
                            Implementamos medidas técnicas y administrativas de alto nivel, incluyendo encriptación de datos en tránsito y reposo, respaldos automáticos y controles de acceso basados en roles (RBAC) para prevenir el acceso no autorizado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic">4. Compartición de Datos</h2>
                        <p>
                            **DialyStock** no vende, alquila ni comparte bases de datos con terceros para fines comerciales. La información solo es accesible por el personal autorizado de la clínica y el administrador del sistema para fines técnicos.
                        </p>
                    </section>

                    <section className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-3xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-blue-500" /> Compromiso Ético
                        </h2>
                        <p className="text-sm">
                            Entendemos que manejamos información crítica para la salud. Nuestro compromiso es mantener la integridad y confidencialidad de cada dato registrado en la plataforma.
                        </p>
                    </section>
                </div>
            </main>

            <SharedFooter />
        </div>
    )
}
