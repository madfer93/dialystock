'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Settings,
    MessageCircle,
    HelpCircle,
    ShieldCheck,
    Globe,
    Save,
    Plus,
    Trash2,
    Leaf,
    Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ConfigPage() {
    const [activeTab, setActiveTab] = useState<'faq' | 'social' | 'nosotros' | 'notif' | 'audit'>('faq')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // FAQ State
    const [faqs, setFaqs] = useState<{ q: string, a: string }[]>([
        {
            q: "¿De qué manera DialyStock protege el medio ambiente?",
            a: "Eliminando por completo la necesidad de formularios y registros físicos. Una clínica promedio ahorra hasta 10,000 hojas de papel al año mediante nuestra gestión digital de insumos y farmacia."
        },
        {
            q: "¿Es compatible con cualquier centro de diálisis?",
            a: "Sí, DialyStock V4.0 está diseñado modularmente para adaptarse a salas de Hemodiálisis, Diálisis Peritoneal y Farmacias Centrales, integrando todos los puntos de consumo en una sola plataforma."
        },
        {
            q: "¿El personal médico necesita capacitación avanzada?",
            a: "No. El sistema ha sido diseñado pensando en la agilidad de los enfermeros y auxiliares. La interfaz es intuitiva y permite realizar solicitudes de insumos o despachos en menos de 30 segundos."
        }
    ])

    // Social & Contact State
    const [social, setSocial] = useState({
        facebook: '',
        instagram: '',
        tiktok: '',
        github: '',
        whatsapp: '',
        email: ''
    })

    // Nosotros / Environment State
    const [nosotros, setNosotros] = useState({
        mision: 'Nuestra misión es liderar la transformación digital en el sector de la salud renal, integrando tecnología de precisión y prácticas sostenibles. Eliminamos la burocracia operativa para que las clínicas puedan centrarse exclusivamente en la excelencia del cuidado al paciente.',
        vision: 'DialyStock aspira a ser el estándar tecnológico global para la gestión de unidades renales en 2030. Nuestra meta es consolidar un ecosistema de salud inteligente que no solo optimice recursos, sino que también actúe como motor de cambio hacia una medicina 100% digital.',
        paper_savings: '10,000 → 0',
        time_saved: '+85%'
    })

    // Audit Logs State
    const [logs, setLogs] = useState<any[]>([])

    useEffect(() => {
        fetchConfig()
        fetchLogs()
    }, [])

    const fetchConfig = async () => {
        const { data, error } = await supabase.from('app_settings').select('*')
        if (data) {
            data.forEach(item => {
                if (item.category === 'faq') setFaqs(item.data.items || [])
                if (item.category === 'social') setSocial(item.data)
                if (item.category === 'nosotros') setNosotros(item.data)
            })
        }
    }

    const fetchLogs = async () => {
        const { data } = await supabase.from('app_audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
        if (data) setLogs(data)
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage('')

        const { data: { user } } = await supabase.auth.getUser()

        try {
            // Guardar FAQ
            await supabase.from('app_settings').upsert({
                category: 'faq',
                data: { items: faqs }
            }, { onConflict: 'category' })

            // Guardar Social
            await supabase.from('app_settings').upsert({
                category: 'social',
                data: social
            }, { onConflict: 'category' })

            // Guardar Nosotros
            await supabase.from('app_settings').upsert({
                category: 'nosotros',
                data: nosotros
            }, { onConflict: 'category' })

            // Registrar Audit Log
            await supabase.from('app_audit_logs').insert({
                admin_email: user?.email || 'admin@dialystock.com',
                action: `UPDATE_CONFIG_${activeTab.toUpperCase()}`,
                details: `El administrador actualizó la sección ${activeTab}`
            })

            setMessage('✅ Configuración actualizada globalmente.')
            fetchLogs()
        } catch (err) {
            setMessage('❌ Error al guardar los cambios.')
        } finally {
            setLoading(false)
        }
    }

    const addFaq = () => setFaqs([...faqs, { q: '', a: '' }])
    const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <Settings size={24} />
                        </div>
                        Configuración DialyStock V4.0
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Control total sobre el ecosistema digital.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                    {loading ? 'Sincronizando...' : <span className="flex items-center gap-2"><Save size={20} /> Guardar Cambios</span>}
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl font-bold flex items-center gap-3 animate-in slide-in-from-top-2 ${message.includes('✅') ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    <ShieldCheck size={20} /> {message}
                </div>
            )}

            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-2xl md:w-fit">
                {[
                    { id: 'faq', label: 'FAQ', icon: HelpCircle },
                    { id: 'social', label: 'Contacto & Redes', icon: MessageCircle },
                    { id: 'nosotros', label: 'Institucional', icon: Leaf },
                    { id: 'audit', label: 'Auditoría', icon: Globe }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
              ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}
            `}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                {activeTab === 'faq' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Preguntas Frecuentes</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">Aparecen dinámicamente en la Landing Page.</p>
                            </div>
                            <Button onClick={addFaq} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl">
                                <Plus size={18} className="mr-2" /> Añadir
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {faqs.length === 0 && <p className="text-center py-12 text-slate-400 font-medium">No hay preguntas configuradas.</p>}
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group transition-all hover:bg-slate-100/50">
                                    <button
                                        onClick={() => removeFaq(idx)}
                                        className="absolute -top-2 -right-2 p-2 bg-white text-red-500 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid gap-4">
                                        <Input
                                            placeholder="Escribe la pregunta..."
                                            value={faq.q}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const newFaqs = [...faqs]
                                                newFaqs[idx].q = e.target.value
                                                setFaqs(newFaqs)
                                            }}
                                            className="bg-white font-bold h-12 rounded-xl"
                                        />
                                        <Textarea
                                            placeholder="Escribe la respuesta detallada..."
                                            value={faq.a}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                const newFaqs = [...faqs]
                                                newFaqs[idx].a = e.target.value
                                                setFaqs(newFaqs)
                                            }}
                                            className="bg-white min-h-[100px] rounded-xl"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                <MessageCircle size={16} /> Contacto Directo
                            </h4>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500">WhatsApp (Número sin +)</label>
                                <Input placeholder="57304578..." value={social.whatsapp} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocial({ ...social, whatsapp: e.target.value })} className="h-12 font-bold bg-slate-50" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500">Email de Soporte</label>
                                <Input placeholder="correo@ejemplo.com" value={social.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocial({ ...social, email: e.target.value })} className="h-12 font-bold bg-slate-50" />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-sm font-black uppercase tracking-widest text-purple-600 flex items-center gap-2">
                                <Globe size={16} /> Presencia Digital
                            </h4>
                            <div className="grid gap-4">
                                <Input placeholder="Link Facebook" value={social.facebook} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocial({ ...social, facebook: e.target.value })} className="h-12 bg-slate-50" />
                                <Input placeholder="Link Instagram" value={social.instagram} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocial({ ...social, instagram: e.target.value })} className="h-12 bg-slate-50" />
                                <Input placeholder="Link TikTok" value={social.tiktok} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocial({ ...social, tiktok: e.target.value })} className="h-12 bg-slate-50" />
                                <Input placeholder="Link Perfil Comercial" value={social.github} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocial({ ...social, github: e.target.value })} className="h-12 bg-slate-50" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'nosotros' && (
                    <div className="space-y-12">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Leaf size={14} className="text-emerald-500" /> Misión del Negocio
                                </label>
                                <Textarea value={nosotros.mision} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNosotros({ ...nosotros, mision: e.target.value })} className="min-h-[200px] bg-slate-50 border-none font-medium text-slate-700 p-6 rounded-[2rem]" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Globe size={14} className="text-blue-500" /> Visión 2028
                                </label>
                                <Textarea value={nosotros.vision} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNosotros({ ...nosotros, vision: e.target.value })} className="min-h-[200px] bg-slate-50 border-none font-medium text-slate-700 p-6 rounded-[2rem]" />
                            </div>
                        </div>

                        <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                    <Leaf className="text-emerald-500" size={32} />
                                </div>
                                <div>
                                    <h4 className="font-black text-emerald-900">Manifiesto Ambiental</h4>
                                    <p className="text-sm text-emerald-700 font-medium">Controla las métricas de ahorro que se muestran al público.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-emerald-600 block px-1">Papel (Hojas)</label>
                                    <Input value={nosotros.paper_savings} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNosotros({ ...nosotros, paper_savings: e.target.value })} className="w-32 bg-white font-black text-center text-emerald-700 h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-emerald-600 block px-1">Tiempo (%)</label>
                                    <Input value={nosotros.time_saved} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNosotros({ ...nosotros, time_saved: e.target.value })} className="w-32 bg-white font-black text-center text-emerald-700 h-12 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <ShieldCheck className="text-blue-600" /> Registro de Actividad
                        </h3>
                        <div className="overflow-hidden border border-slate-100 rounded-2xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-black">Admin</th>
                                        <th className="px-6 py-4 font-black">Acción</th>
                                        <th className="px-6 py-4 font-black">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-600">{log.admin_email}</td>
                                            <td className="px-6 py-4 font-black text-blue-600">{log.action}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
