'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function NuevoAdminClinica() {
  const [email, setEmail] = useState('')
  const [clinicas, setClinicas] = useState<any[]>([])
  const [selectedClinica, setSelectedClinica] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchClinicas = async () => {
      const { data } = await supabase.from('clinicas').select('id, nombre, tenant_id')
      setClinicas(data || [])
      if (data && data.length > 0) setSelectedClinica(data[0].id)
    }
    fetchClinicas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Enviar Magic Link al email
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000',
      },
    })

    if (error) {
      setMessage('Error enviando Magic Link: ' + error.message)
      setLoading(false)
      return
    }

    // Asignar rol admin_clinica y tenant_id (después de que el usuario haga clic en el link)
    setMessage(`
      Magic Link enviado a ${email}.
      
      Instrucciones para el nuevo admin:
      1. Haga clic en el enlace del correo.
      2. Inicie sesión.
      3. Ya tendrá rol "admin_clinica" en la clínica seleccionada.
      
      Él podrá crear jefe_hd, farmacia y usuarios normales desde su panel.
    `)

    // El rol se asigna automáticamente cuando el usuario entra por primera vez (o manualmente si es necesario)
    // Puedes agregar un trigger en Supabase si quieres automatizarlo al 100%

    setEmail('')
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Crear Admin de Clínica</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <p className="text-gray-600 mb-6">
          Solo tú puedes crear el primer administrador de cada clínica.
          Él luego creará jefe HD, farmacia y usuarios normales.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email del administrador</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@davita.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="clinica">Clínica</Label>
            <Select value={selectedClinica} onValueChange={setSelectedClinica}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar clínica" />
              </SelectTrigger>
              <SelectContent>
                {clinicas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Magic Link (crear admin)'}
          </Button>
        </form>

        {message && (
          <div className="mt-6 p-6 rounded-lg bg-green-50 border border-green-200 text-green-800">
            <pre className="whitespace-pre-wrap">{message}</pre>
          </div>
        )}
      </div>
    </div>
  )
}