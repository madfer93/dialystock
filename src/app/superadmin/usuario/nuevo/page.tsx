'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UserPlus, ArrowLeft, Building2, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function NuevoAdminClinica() {
  const [email, setEmail] = useState('')
  const [clinicas, setClinicas] = useState<any[]>([])
  const [selectedClinica, setSelectedClinica] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchClinicas = async () => {
      // Reemplazamos la llamada API que daba 404 por consulta directa a Supabase
      const { data } = await supabase.from('clinicas').select('id, nombre, tenant_id')
      if (data) {
        setClinicas(data)
        if (data.length > 0) setSelectedClinica(data[0].id)
      }
    }
    fetchClinicas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    const clinica = clinicas.find(c => c.id === selectedClinica)
    if (!clinica) {
      setMessage('Debes seleccionar una clínica válida.')
      setLoading(false)
      return
    }

    // Nota: El envío directo de Magic Link con metadatos requiere el service_role para bypass de políticas
    // o usar invitaciones_pendientes si tienes un trigger en la DB.
    // Aquí implementamos el flujo usando la tabla de invitaciones que tienes configurada.
    const { error: invError } = await supabase
      .from('invitaciones_pendientes')
      .insert({
        email: email.toLowerCase(),
        role: 'admin_clinica',
        tenant_id: clinica.tenant_id,
        usado: false
      })

    if (invError) {
      setMessage('Error al crear invitación: ' + invError.message)
    } else {
      // Intentar enviar el Magic Link
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: 'Admin ' + clinica.nombre,
          }
        }
      })

      if (authError) {
        setMessage('Invitación creada pero falló el envío del correo: ' + authError.message)
      } else {
        setSuccess(true)
        setMessage(`Invitación enviada con éxito a ${email}. Se le asignará la clínica ${clinica.nombre}.`)
        setEmail('')
        setTimeout(() => router.push('/superadmin'), 4000)
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/superadmin" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
        <ArrowLeft size={18} />
        Volver al Dashboard
      </Link>

      <div className="flex items-center gap-4 mb-2">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
          <UserPlus size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Crear Administrador</h1>
          <p className="text-slate-500">Asigna un nuevo encargado a una de tus clínicas.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Correo Electrónico del Admin</Label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 py-6 pl-14 pr-6 bg-slate-50/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="clinica" className="text-sm font-bold text-slate-700 ml-1">Seleccionar Clínica Destino</Label>
                <Select value={selectedClinica} onValueChange={setSelectedClinica}>
                  <SelectTrigger className="rounded-2xl border-slate-200 py-7 px-6 bg-slate-50/30 focus:ring-indigo-500/20">
                    <div className="flex items-center gap-3">
                      <Building2 size={18} className="text-slate-400" />
                      <SelectValue placeholder="Busca una clínica..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {clinicas.map(c => (
                      <SelectItem key={c.id} value={c.id} className="py-3 rounded-lg focus:bg-indigo-50">
                        {c.nombre}
                      </SelectItem>
                    ))}
                    {clinicas.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-sm">No hay clínicas disponibles.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || success || clinicas.length === 0}
              className={`
                w-full py-8 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]
                ${success ? 'bg-emerald-500 hover:bg-emerald-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25'}
              `}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enviando invitación...
                </div>
              ) : success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={24} />
                  ¡Invitación Enviada!
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus size={24} />
                  Habilitar Acceso al Sistema
                </div>
              )}
            </Button>
          </form>

          {message && (
            <div className={`mt-8 p-6 rounded-2xl border flex items-center gap-4 animate-in zoom-in-95 duration-300 ${success
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-red-50 border-red-100 text-red-800'
              }`}>
              {success ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
              <div>
                <p className="font-bold">{success ? 'Todo listo' : 'Error de configuración'}</p>
                <p className="text-sm opacity-90">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white flex gap-6 items-start shadow-xl">
        <div className="text-indigo-400 mt-1">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-2 italic">Proceso de Seguridad</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Al hacer clic en registrar, el sistema enviará un **Magic Link** al correo del destinatario.
            Su cuenta quedará vinculada automáticamente a la clínica seleccionada bajo el rol de Administrador.
          </p>
        </div>
      </div>
    </div>
  )
}