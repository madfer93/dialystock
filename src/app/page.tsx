'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import {
  Droplet,
  FlaskConical,
  Package,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Activity,
  ShieldCheck,
  ChevronRight,
  Send,
  HelpCircle,
  Plus,
  Minus,
  Rocket,
  Star,
  Quote,
  MapPin,
  Phone,
  Clock,
  Sparkles
} from 'lucide-react'
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import Link from 'next/link'
import SharedFooter from '@/components/SharedFooter'
import { cn } from '@/lib/utils'

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
      id: 'pro',
      name: 'Professional',
      price: '$1.200.000',
      period: 'COP / mes',
      desc: 'Gestión profesional para clínicas consolidadas.',
      features: ['Hasta 5 Sedes', 'Auditoría Pro', 'Módulo Farmacia Premium', 'Soporte 8/5 Prioritario'],
      color: 'from-blue-600 to-indigo-700',
      cta: 'Comprar Plan Pro',
      link: wompiLinks.pro,
      popular: false
    },
    {
      id: 'premium_ia',
      name: 'Premium IA',
      price: '$2.500.000',
      period: 'COP / mes',
      desc: 'Potencia total con Inteligencia Artificial predictiva.',
      features: ['✨ 2 MESES GRATIS', 'Sedes Ilimitadas', '🤖 Predicciones Stock', '🤖 Auto-aprobación', '🛡️ Auditoría Forense'],
      color: 'from-purple-600 to-pink-700',
      cta: 'Probar IA Gratis',
      link: wompiLinks.pro, // Temporal, usuario debe actualizar
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Desde $5M',
      period: 'COP / mes',
      desc: 'Para redes hospitalarias con requerimientos masivos.',
      features: ['Infraestructura Dedicada', 'IA Entrenada a Medida', 'Integración SAP/Oracle', 'Soporte 24/7 VIP'],
      color: 'from-slate-700 to-slate-900',
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
      <nav className="relative z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo-dialystock.png" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white">Dialy<span className="text-blue-500">Stock</span></span>
          </div>
          <div className="flex items-center gap-2 md:gap-8">
            <a href="#modulos" className="hidden sm:block text-xs md:text-sm font-semibold hover:text-blue-400 transition-colors">Módulos</a>
            <a href="#beneficios" className="hidden sm:block text-xs md:text-sm font-semibold hover:text-blue-400 transition-colors">Beneficios</a>
            <a href="#contacto" className="hidden md:block text-xs md:text-sm font-semibold hover:text-blue-400 transition-colors">Contacto</a>
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-full font-bold text-xs md:text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 md:pt-32 pb-20 md:pb-40 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen animate-blob"></div>
            <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Badges */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest animate-fade-in-up">
                <ShieldCheck size={12} />
                Versión 4.0 Estable
              </div>

              <div className="inline-flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-full backdrop-blur-md shadow-xl shadow-purple-500/10 hover:scale-105 transition-transform cursor-default animate-fade-in-up animation-delay-200">
                <div className="relative">
                  <Sparkles size={16} className="text-yellow-400" />
                  <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-50 animate-pulse"></div>
                </div>
                <span className="text-white text-xs md:text-sm font-bold">
                  2 Meses <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">GRATIS</span> de IA Premium
                </span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[0.9] animate-fade-in-up animation-delay-300">
              Gestión Médica <br />
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600">
                  Inteligente.
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-[10px] bg-blue-600/20 blur-lg"></span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed animate-fade-in-up animation-delay-400">
              La primera plataforma que predice el desabastecimiento antes de que ocurra.
              Control total para Hemodiálisis, Peritoneal y Farmacia.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-500">
              <button
                onClick={() => setShowLogin(true)}
                className="group relative w-full sm:w-auto px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)]"
              >
                Empezar Ahora
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href={`https://wa.me/573045788873?text=${encodeURIComponent('Hola, me interesa ver una demo de DialyStock IA')}`}
                target="_blank"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 backdrop-blur text-white rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all border border-white/10 flex items-center justify-center gap-3"
              >
                <MessageCircle size={20} />
                Agendar Demo
              </a>
            </div>
          </div>
        </section>

        {/* AI Brain Section (NEW) */}
        <section className="py-20 bg-slate-900/50 border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">El Cerebro de tu Clínica</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Nuestro motor de IA no solo registra datos, los analiza en tiempo real para tomar decisiones autónomas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Predicción de Stock', desc: 'Analiza patrones de consumo históricos para alertarte 7 días antes de que se agote un insumo crítico.', icon: Activity, color: 'text-pink-500' },
                { title: 'Auto-Aprobación', desc: 'Permite que la IA apruebe solicitudes rutinarias los fines de semana basándose en la confianza del producto.', icon: ShieldCheck, color: 'text-blue-500' },
                { title: 'Auditoría Forense', desc: 'Detecta anomalías en el consumo y alerta sobre posibles pérdidas o usos indebidos de material.', icon: CheckCircle2, color: 'text-emerald-500' }
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/40 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-lg ${item.color}`}>
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section id="modulos" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ecosistema Modular</h2>
              <p className="text-slate-400">Todo lo que necesitas, integrado en una sola plataforma.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((m: any, idx) => (
                <Link
                  key={idx}
                  href={m.link}
                  className="group relative bg-slate-900 border border-white/10 rounded-[2rem] p-8 hover:bg-slate-800 transition-all overflow-hidden flex flex-col h-full"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${m.color} opacity-[0.03] group-hover:opacity-10 blur-2xl transition-all`}></div>

                  <div className="mb-auto">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                      <m.icon className="text-white" size={24} />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {m.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{m.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors">Explorar módulo</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planes" className="py-16 md:py-32 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 md:mb-4">Planes de Inversión</h2>
              <p className="text-slate-400 font-medium text-sm md:text-base">Soluciones escalables para cada nivel de tu operación clínica.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {pricingPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "relative bg-slate-800/40 border rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 transition-all hover:-translate-y-2 flex flex-col h-full overflow-hidden",
                    plan.popular ? "border-blue-500/50 shadow-2xl shadow-blue-500/10" : "border-white/5"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 px-3 md:px-4 py-1 md:py-1.5 bg-blue-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                      Más Elegido
                    </div>
                  )}

                  <div className="mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-2">{plan.name}</h3>
                    <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="mb-6 md:mb-10 flex items-baseline gap-2">
                    <span className="text-3xl md:text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500 font-bold text-xs md:text-sm tracking-tighter uppercase">{plan.period}</span>
                  </div>

                  <div className="space-y-3 md:space-y-4 mb-8 md:mb-12 flex-1">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 md:gap-3">
                        <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                        <span className="text-xs md:text-sm text-slate-300 font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowLeadModal(true);
                    }}
                    className={cn(
                      "w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all",
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

        {/* Testimonials Section */}
        <section id="testimonios" className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 md:mb-20">
              <div className="inline-flex p-3 rounded-2xl bg-yellow-500/10 text-yellow-400 mb-4">
                <Star size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Lo que dicen nuestros clientes</h2>
              <p className="text-slate-400 font-medium max-w-2xl mx-auto">Clínicas de toda la región confían en DialyStock para optimizar sus operaciones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  name: 'Dra. María González',
                  role: 'Directora Médica',
                  clinic: 'Unidad Renal del Caribe',
                  text: 'DialyStock transformó nuestra gestión de inventarios. Ahorramos más de 8 horas semanales en papeleo y tenemos trazabilidad total de cada insumo.',
                  rating: 5
                },
                {
                  name: 'Carlos Martínez',
                  role: 'Jefe de Farmacia',
                  clinic: 'Clínica Renal Medellín',
                  text: 'La integración con nuestros proveedores es increíble. Los pedidos que antes tomaban días ahora se procesan en minutos.',
                  rating: 5
                },
                {
                  name: 'Enf. Laura Pérez',
                  role: 'Coordinadora HD',
                  clinic: 'Centro Diálisis Bogotá',
                  text: 'El personal de enfermería adoptó el sistema en menos de una semana. La interfaz es tan intuitiva que no necesitamos capacitación extensa.',
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:bg-slate-800/70 transition-all group"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="relative mb-6">
                    <Quote size={32} className="absolute -top-2 -left-2 text-blue-500/20" />
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed pl-6">{testimonial.text}</p>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{testimonial.name}</p>
                      <p className="text-xs text-slate-400">{testimonial.role}</p>
                      <p className="text-xs text-blue-400">{testimonial.clinic}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contacto" className="py-20 md:py-32 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">¿Listo para transformar tu clínica?</h2>
                <p className="text-slate-400 mb-8 text-sm md:text-base">Contáctanos y un especialista te ayudará a encontrar el plan perfecto para tu operación.</p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <FaWhatsapp className="text-emerald-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">WhatsApp</h4>
                      <p className="text-slate-400 text-sm">+57 304 578 8873</p>
                      <a
                        href="https://wa.me/573045788873?text=Hola,%20quiero%20información%20sobre%20DialyStock"
                        target="_blank"
                        className="text-emerald-400 text-xs font-bold hover:underline"
                      >
                        Enviar mensaje →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Send className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Email</h4>
                      <p className="text-slate-400 text-sm">soporte@dialystock.com</p>
                      <a href="mailto:madfer1993+soporteDialystock@gmail.com" className="text-blue-400 text-xs font-bold hover:underline">
                        Enviar correo →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Clock className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Horario de Atención</h4>
                      <p className="text-slate-400 text-sm">Lun - Vie: 8:00 AM - 6:00 PM</p>
                      <p className="text-slate-400 text-sm">Soporte 24/7 para clientes Pro</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-4">Síguenos en redes sociales</p>
                  <div className="flex gap-4">
                    <a href="https://www.facebook.com/profile.php?id=61583530845268" target="_blank" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-600/20 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all">
                      <FaFacebook size={20} />
                    </a>
                    <a href="https://www.instagram.com/dosis_de_conocimiento/" target="_blank" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-pink-600/20 flex items-center justify-center text-slate-400 hover:text-pink-400 transition-all">
                      <FaInstagram size={20} />
                    </a>
                    <a href="https://www.tiktok.com/@dosis_de_conocimiento" target="_blank" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-slate-600/20 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                      <FaTiktok size={20} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-slate-800/50 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-10">
                <h3 className="text-xl md:text-2xl font-black text-white mb-6">Solicita una demostración</h3>
                <form className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-2 block">Nombre completo</label>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dr. Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-2 block">Teléfono</label>
                      <input
                        type="tel"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">Email corporativo</label>
                    <input
                      type="email"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="correo@clinica.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">Nombre de la clínica</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Unidad Renal XYZ"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">¿Cuántas sedes tienen?</label>
                    <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="1">1 sede</option>
                      <option value="2-5">2-5 sedes</option>
                      <option value="6-10">6-10 sedes</option>
                      <option value="10+">Más de 10 sedes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-2 block">Mensaje (opcional)</label>
                    <textarea
                      rows={3}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Cuéntanos sobre tus necesidades..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
                  >
                    Solicitar Demo Gratis
                    <ArrowRight size={18} />
                  </button>
                  <p className="text-xs text-slate-500 text-center">Te contactaremos en menos de 24 horas</p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-32 bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Preguntas Frecuentes</h2>
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
