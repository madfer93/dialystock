'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function NuevaClinica() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    // Insertamos directamente en Supabase (Lógica descentralizada)
    const { data, error } = await supabase
      .from('clinicas')
      .insert({ nombre, descripcion, logo_url: logoUrl })
      .select()

    if (error) {
      setMessage('Error al crear la clínica: ' + error.message)
    } else {
      setSuccess(true)
      setMessage(`¡Clínica ${nombre} registrada con éxito!`)
      setNombre('')
      setDescripcion('')
      // Redirección corregida al panel de superadmin
      setTimeout(() => router.push('/superadmin'), 3000)
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
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
          <Building2 size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Nueva Clínica</h1>
          <p className="text-slate-500">Registra un nuevo centro médico en el ecosistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label htmlFor="nombre" className="text-sm font-bold text-slate-700 ml-1">Nombre Oficial de la Clínica</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Clínica Santa María"
                  className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 py-6 px-6 bg-slate-50/30"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="descripcion" className="text-sm font-bold text-slate-700 ml-1">Descripción o Notas</Label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles adicionales, ubicación o contacto..."
                  className="w-full min-h-[100px] rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 p-6 bg-slate-50/30 text-sm focus:outline-none focus:ring-2 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="logoUrl" className="text-sm font-bold text-slate-700 ml-1">URL del Logo (Opcional)</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 py-6 px-6 bg-slate-50/30"
                />
                <p className="text-[10px] text-slate-400 ml-2 italic">Deja en blanco para usar el logo por defecto de DialyStock.</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || success}
              className={`
                w-full py-8 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]
                ${success ? 'bg-emerald-500 hover:bg-emerald-500 cursor-default' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25'}
              `}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando registro...
                </div>
              ) : success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={24} />
                  ¡Registro Completado!
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={24} />
                  Registrar Clínica Ahora
                </div>
              )}
            </Button>
          </form>

          {message && (
            <div className={`mt-8 p-6 rounded-2xl border flex items-center gap-4 animate-in zoom-in-95 duration-300 ${success
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-red-50 border-red-100 text-red-800'
              }`}>
              {success ? <CheckCircle2 size={24} /> : <div className="text-2xl">⚠️</div>}
              <div>
                <p className="font-bold">{success ? 'Operación éxitosa' : 'Algo salió mal'}</p>
                <p className="text-sm opacity-90">{message}</p>
                {success && <p className="text-xs mt-2 font-medium opacity-70">Redirigiendo al panel en segundos...</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex gap-6 items-start">
        <div className="text-amber-500 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Nota del Sistema</h4>
          <p className="text-amber-800/80 text-sm mt-1 leading-relaxed">
            Al registrar una clínica, se genera automáticamente un identificador único (Tenant ID).
            Podrás usar este ID más adelante para asignar administradores específicos a esta sucursal.
          </p>
        </div>
      </div>
    </div>
  )
}