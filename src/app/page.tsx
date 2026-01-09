'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import {
  Droplet,
  FlaskConical,
  Package,
  Stethoscope,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Activity,
  ShieldCheck,
  ChevronRight,
  Send,
  Building2,
  Users,
  Facebook,
  Instagram,
  Mail,
  Globe,
  HelpCircle,
  Plus,
  Minus,
  Rocket
} from 'lucide-react'
import { FaTiktok, FaFacebook, FaInstagram, FaGlobe, FaWhatsapp } from 'react-icons/fa'
import Link from 'next/link'
import SharedFooter from '@/components/SharedFooter'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import FloatingSupport from '@/components/FloatingSupport' // Already in layout, but sometimes needed for local context if logic shared

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
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
    },
    {
      q: "¿Qué nivel de seguridad ofrece para el control de stock?",
      a: "Ofrecemos trazabilidad total mediante auditoría digital. Cada movimiento de inventario queda registrado con responsable, hora y fecha exacta, permitiendo auditorías precisas y sin errores manuales."
    },
    {
      q: "¿Puedo personalizar mi logo y colores corporativos?",
      a: "¡Absolutamente! A través de nuestro panel de Superadmin, puedes actualizar tu identidad visual, logo y enlaces de contacto para que la plataforma sea una extensión fiel de tu marca clínica."
    }
  ])
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [leadData, setLeadData] = useState({ name: '', email: '', clinic: '' })
  const [wompiLinks, setWompiLinks] = useState({ pro: 'https://checkout.wompi.co/l/os2Qr0', ent: 'https://checkout.wompi.co/l/Hwxym7' })

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Gratis',
      period: 'por 30 días',
      desc: 'Ideal para probar la potencia de DialyStock en tu primera sede.',
      features: ['1 Sede', 'Módulos HD/PD Básicos', 'Trazabilidad de Insumos', 'Soporte vía Ticket'],
      color: 'from-slate-500 to-slate-700',
      cta: 'Empezar Prueba',
      link: '#'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$500.000',
      period: 'COP / mes',
      desc: 'Gestión profesional para clínicas en crecimiento.',
      features: ['Hasta 5 Sedes', 'Auditoría Pro', 'Módulo Farmacia Premium', 'Soporte 24/7 WhatsApp'],
      color: 'from-blue-600 to-indigo-700',
      cta: 'Comprar Plan Pro',
      link: wompiLinks.pro,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$1.000.000+',
      period: 'COP / mes',
      desc: 'Para redes hospitalarias con requerimientos masivos.',
      features: ['Sedes Ilimitadas', 'Analítica Avanzada con IA', 'Custom Roles', 'Gestor de cuenta dedicado'],
      color: 'from-purple-600 to-indigo-900',
      cta: 'Contactar Ventas',
      link: wompiLinks.ent
    }
  ]
  const router = useRouter()

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase.from('app_settings').select('data').eq('category', 'faq').single()
      if (data && data.data.items) setFaqs(data.data.items)
    }
    const fetchWompiLinks = async () => {
      const { data } = await supabase.from('app_settings').select('data').eq('category', 'social').single()
      if (data?.data) {
        const formatWompiLink = (link: string) => {
          if (!link) return null
          return link.startsWith('http') ? link : `https://checkout.wompi.co/l/${link}`
        }
        setWompiLinks({
          pro: formatWompiLink(data.data.wompi_pro) || wompiLinks.pro,
          ent: formatWompiLink(data.data.wompi_ent) || wompiLinks.ent
        })
      }
    }
    fetchFaqs()
    fetchWompiLinks()
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          const role = profile.role.toLowerCase().replace(/\s+/g, '_')
          if (role === 'superadmin_global') router.push('/superadmin')
          else if (role === 'sala_hd') router.push('/sala-hd')
          else if (role === 'sala_pd') router.push('/sala-pd')
          else if (role === 'farmacia') router.push('/farmacia')
          else if (role === 'jefe_hd') router.push('/jefe-hd')
          else if (role === 'jefe_pd') router.push('/jefe-pd')
          else router.push('/farmacia') // Default
        }
      }
    }
    checkSession()
  }, [router])

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Guardar el Lead en la base de datos
      const { error } = await supabase.from('app_leads').insert({
        name: leadData.name,
        email: leadData.email,
        clinic_name: leadData.clinic,
        plan_interested: selectedPlan?.id
      })

      if (error) throw error

      // 2. Redirigir al link de Wompi correspondiente si no es Starter
      if (selectedPlan && selectedPlan.id !== 'starter') {
        window.location.href = selectedPlan.link
      } else {
        setMessage('✅ ¡Solicitud de prueba enviada! Te contactaremos pronto.')
        setShowLeadModal(false)
        setLeadData({ name: '', email: '', clinic: '' })
      }
    } catch (error) {
      console.error('Error Lead Capture:', error)
      alert('Hubo un error al procesar tu solicitud. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✅ ¡Link de acceso enviado! Revisa tu correo.')
    }
    setLoading(false)
  }

  const modules = [
    {
      title: 'Hemodiálisis (HD)',
      desc: 'Gestión de líneas, filtros y suministros básicos para salas de HD.',
      icon: Droplet,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Crítico',
      link: '/demo/hd'
    },
    {
      title: 'Diálisis Peritoneal (PD)',
      desc: 'Control de soluciones, catéteres y equipos especializados para PD.',
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Especializado',
      link: '/demo/pd'
    },
    {
      title: 'Químicos y Reactivos',
      desc: 'Administración de concentrados, desinfectantes y reactivos.',
      icon: FlaskConical,
      color: 'from-purple-500 to-fuchsia-600',
      badge: 'Precisión',
      link: '/demo/quimicos'
    },
    {
      title: 'Farmacia & Despacho',
      desc: 'Control centralizado de inventario, lotes y entregas a salas.',
      icon: Package,
      color: 'from-orange-500 to-red-600',
      badge: 'Logística',
      link: '/demo/farmacia'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-dialystock.png" alt="Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-black tracking-tighter text-white">Dialy<span className="text-blue-500">Stock</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#modulos" className="text-sm font-semibold hover:text-blue-400 transition-colors">Módulos</a>
            <a href="#beneficios" className="text-sm font-semibold hover:text-blue-400 transition-colors">Beneficios</a>
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold mb-8 animate-bounce">
              <ShieldCheck size={14} />
              NUEVA VERSIÓN 3.5 DISPONIBLE
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[0.9]">
              Gestión Médica <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600">Sin Errores.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
              DialyStock es la plataforma líder para el control de inventarios en unidades renales.
              Optimiza tus procesos de hemodiálisis y diálisis peritoneal con trazabilidad total.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="group w-full md:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-2xl"
              >
                Empezar Ahora
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola Manuel, me interesa una demostración de DialyStock.')}`}
                target="_blank"
                className="w-full md:w-auto px-10 py-5 bg-slate-800 text-white rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all border border-white/10 flex items-center justify-center gap-3"
              >
                <MessageCircle />
                Agendar Demo
              </a>
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section id="modulos" className="py-32 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-white mb-4">Ecosistema Integral</h2>
              <p className="text-slate-400 font-medium">Módulos especializados para cada área de tu clínica renal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {modules.map((m: any, idx) => (
                <Link
                  key={idx}
                  href={m.link}
                  className="group relative bg-slate-800/50 border border-white/10 rounded-[2rem] p-8 hover:bg-slate-800 transition-all hover:-translate-y-2 cursor-pointer overflow-hidden border-b-4 border-b-transparent hover:border-b-blue-500 shadow-xl"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`}></div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                    <m.icon className="text-white" size={28} />
                  </div>
                  <div className="inline-block px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    {m.badge}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{m.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {m.desc}
                  </p>
                  <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                    Simular Proceso <ChevronRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[40%] h-full bg-black/10 backdrop-blur-2xl skew-x-12 translate-x-1/2"></div>
              <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                    ¿Por qué elegir DialyStock para tu clínica?
                  </h2>
                  <div className="space-y-6">
                    {[
                      { t: 'Trazabilidad Total', d: 'Seguimiento de lotes y fechas de vencimiento automatizado.' },
                      { t: 'Reportes en Tiempo Real', d: 'Gráficos de consumo y stock críticos con un solo clic.' },
                      { t: 'templates Recurrentes', d: 'Crea pedidos en segundos usando tus plantillas favoritas.' },
                      { t: 'Soporte 24/7', d: 'Atención personalizada vía WhatsApp para soporte técnico.' }
                    ].map((b, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{b.t}</h4>
                          <p className="text-blue-100 text-sm">{b.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-white font-black text-2xl">Métrica Real</p>
                      <p className="text-blue-200 text-sm">Ahorro operativo garantizado</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">Eficiencia en Despacho</span>
                      <span className="text-3xl font-black text-white">+85%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-white rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-blue-200 text-[10px] font-bold uppercase">Clínicas</p>
                        <p className="text-2xl font-black text-white">12+</p>
                      </div>
                      <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-blue-200 text-[10px] font-bold uppercase">Países</p>
                        <p className="text-2xl font-black text-white">Región</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planes" className="py-32 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-white mb-4">Planes de Inversión</h2>
              <p className="text-slate-400 font-medium">Soluciones escalables para cada nivel de tu operación clínica.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "relative bg-slate-800/40 border rounded-[2.5rem] p-10 transition-all hover:-translate-y-2 flex flex-col h-full overflow-hidden",
                    plan.popular ? "border-blue-500/50 shadow-2xl shadow-blue-500/10" : "border-white/5"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-6 right-6 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      Más Elegido
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="mb-10 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500 font-bold text-sm tracking-tighter uppercase">{plan.period}</span>
                  </div>

                  <div className="space-y-4 mb-12 flex-1">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                        <span className="text-sm text-slate-300 font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowLeadModal(true);
                    }}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20"
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    )}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-32 bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-4xl font-black text-white mb-4">Preguntas Frecuentes</h2>
              <p className="text-slate-400">Todo lo que necesitas saber sobre la plataforma.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-white pr-8">{faq.q}</span>
                    {openFaq === idx ? <Minus className="text-blue-500 shrink-0" size={20} /> : <Plus className="text-slate-500 shrink-0" size={20} />}
                  </button>
                  <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 py-6 border-t border-white/5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SharedFooter />
      </main>

      {/* Login Modal Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowLogin(false)}
          ></div>
          <div className="relative w-full max-w-md bg-[#1e293b] border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <img src="/logo-dialystock.png" alt="Logo" className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Acceso al Sistema</h2>
              <p className="text-slate-400 text-sm">Ingresa tu correo para recibir un link de acceso seguro.</p>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">Email Corporativo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="nombre@clinica.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Enviando...' : (
                  <>
                    <span>Enviar Magic Link</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-2xl text-center text-sm font-bold ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {message}
              </div>
            )}

            <button
              onClick={() => setShowLogin(false)}
              className="mt-8 w-full text-slate-500 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.3em]"
            >
              Cerrar y Regresar
            </button>
          </div>
        </div>
      )}
      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowLeadModal(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br",
                selectedPlan?.color || "from-blue-600 to-indigo-700"
              )}>
                <Rocket className="text-white" size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">¡Excelente elección!</h2>
              <p className="text-slate-400 text-sm">Estás a un paso de activar tu plan <strong>{selectedPlan?.name}</strong>. Déjanos tus datos para asegurar tu cuenta.</p>
            </div>

            <form onSubmit={handleLeadCapture} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">Tu Nombre</label>
                  <input
                    type="text"
                    required
                    value={leadData.name}
                    onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="Manuel Madrid"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="manuel@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">Nombre de la Clínica</label>
                <input
                  type="text"
                  required
                  value={leadData.clinic}
                  onChange={(e) => setLeadData({ ...leadData, clinic: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Unidad Renal DialyStock"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full rounded-2xl py-4 font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2",
                  selectedPlan?.id === 'starter'
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
                  "text-white disabled:opacity-50"
                )}
              >
                {loading ? 'Procesando...' : (
                  <>
                    <span>{selectedPlan?.id === 'starter' ? 'Iniciar Prueba Gratuita' : 'Continuar al Pago'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => setShowLeadModal(false)}
              className="mt-8 w-full text-slate-500 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.3em]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}