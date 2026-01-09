'use client'

import { FileText, Database, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SharedFooter from '@/components/SharedFooter'

export default function TratamientoDatos() {
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
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <Database className="text-emerald-500" size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-white">Tratamiento de Datos Personales</h1>
                </div>

                <div className="space-y-8 text-slate-400">
                    <p className="text-lg">
                        De acuerdo con la **Ley 1581 de 2012** y el Decreto 1377 de 2013, DialyStock informa a sus usuarios sobre el tratamiento de sus datos personales.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic">Autorización del Titular</h2>
                        <p>
                            Al utilizar nuestra plataforma, el usuario autoriza de manera previa, expresa e informada el tratamiento de sus datos personales. Esta autorización permite a DialyStock procesar la información para los fines operativos descritos en nuestra política de privacidad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic">Derechos del Titular</h2>
                        <p>
                            Como titular de sus datos personales, usted tiene derecho a:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li>Conocer, actualizar y rectificar sus datos personales.</li>
                            <li>Solicitar prueba de la autorización otorgada.</li>
                            <li>Ser informado sobre el uso que se le ha dado a sus datos.</li>
                            <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
                            <li>Revocar la autorización o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 italic">Responsable del Tratamiento</h2>
                        <p>
                            El responsable del tratamiento de los datos en esta plataforma es **Manuel Fernando Madrid**, quien asegura que la información sea utilizada exclusivamente para la gestión logística hospitalaria y no para fines comerciales externos.
                        </p>
                    </section>

                    <section className="p-8 bg-emerald-600/5 border border-emerald-500/20 rounded-3xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-emerald-500" /> Consultas y Reclamos
                        </h2>
                        <p className="text-sm">
                            Para ejercer sus derechos, puede enviar una solicitud formal al correo **madfer1993@gmail.com**. Su solicitud será atendida en los términos legales establecidos.
                        </p>
                    </section>
                </div>
            </main>

            <SharedFooter />
        </div>
    )
}
