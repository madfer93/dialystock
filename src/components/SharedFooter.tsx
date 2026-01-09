'use client'

import { Mail, MessageCircle, Facebook, Instagram, Globe } from 'lucide-react'
import { FaTiktok, FaFacebook, FaInstagram, FaGlobe } from 'react-icons/fa'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SharedFooter() {
    const [social, setSocial] = useState({
        facebook: 'https://www.facebook.com/profile.php?id=61583530845268',
        instagram: 'https://www.instagram.com/dosis_de_conocimiento/',
        tiktok: 'https://www.tiktok.com/@dosis_de_conocimiento',
        github: 'https://madfer93.github.io/Perfil-comercial-Manuel/',
        whatsapp: '573045788873',
        email: 'madfer1993@gmail.com'
    })

    useEffect(() => {
        const fetchSocial = async () => {
            const { data } = await supabase.from('app_settings').select('data').eq('category', 'social').single()
            if (data) setSocial(data.data)
        }
        fetchSocial()
    }, [])

    return (
        <footer className="py-20 border-t border-white/5 bg-slate-900 mt-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-20 text-left">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo-dialystock.png" alt="Logo" className="h-10 w-10" />
                            <span className="text-2xl font-black text-white">DialyStock</span>
                        </div>
                        <p className="text-slate-400 max-w-sm leading-relaxed mb-8">
                            Soluciones de software personalizadas para el sector salud.
                            Impulsamos la digitalización de clínicas renales en toda Latinoamérica.
                        </p>
                        <div className="flex gap-4">
                            <a href={social.facebook} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/10">
                                <FaFacebook size={18} />
                            </a>
                            <a href={social.instagram} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 transition-colors shadow-lg">
                                <FaInstagram size={18} />
                            </a>
                            <a href={social.tiktok} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-slate-950 transition-colors shadow-lg">
                                <FaTiktok size={18} />
                            </a>
                            <a href={social.github} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg">
                                <FaGlobe size={18} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 italic text-sm uppercase tracking-widest">Contacto Directo</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="font-bold text-white">Manuel Fernando Madrid</li>
                            <li>
                                <a href={`https://wa.me/${social.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent('Hola Manuel, necesito soporte con el sistema DialyStock.')}`} target="_blank" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    <MessageCircle size={14} /> WhatsApp: +{social.whatsapp.replace(/\+/g, '')}
                                </a>
                            </li>
                            <li>
                                <a href={`mailto:${social.email}`} className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                    <Mail size={14} /> {social.email}
                                </a>
                            </li>
                            <li>Villavicencio, Meta, Colombia</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 italic text-sm uppercase tracking-widest">Institucional</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/nosotros" className="hover:text-blue-400 transition-colors">¿Quiénes Somos?</Link></li>
                            <li><Link href="/privacidad" className="hover:text-blue-400 transition-colors">Privacidad</Link></li>
                            <li><Link href="/tratamiento-datos" className="hover:text-blue-400 transition-colors">Tratamiento de Datos</Link></li>
                            <li><Link href="/habeas-data" className="hover:text-blue-400 transition-colors">Habeas Data</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                        © 2025 DialyStock PRO V4.0 | Desarrollado con 💙 por Manuel Madrid para Variedades JyM <br />
                        Tecnología Lider en Gestión de Unidades Renales
                    </p>
                </div>
            </div>
        </footer>
    )
}
