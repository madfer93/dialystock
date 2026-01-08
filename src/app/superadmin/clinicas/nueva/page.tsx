'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NuevaClinica() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase
      .from('clinicas')
      .insert({ nombre, descripcion })
      .select()

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage(`Clínica ${nombre} creada con tenant_id: ${data[0].tenant_id}`)
      setNombre('')
      setDescripcion('')
      setTimeout(() => router.push('/(superadmin)'), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Crear Nueva Clínica</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="nombre">Nombre de la clínica</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Clínica'}
          </Button>
        </form>

        {message && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}