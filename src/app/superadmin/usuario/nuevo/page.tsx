'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const fetchClinicas = async () => {
      const res = await fetch('/api/clinicas')
      const data = await res.json()
      setClinicas(data)
      if (data.length > 0) setSelectedClinica(data[0].id)
    }
    fetchClinicas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const clinica = clinicas.find(c => c.id === selectedClinica)

    const res = await fetch('/functions/v1/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'sb_publishable_NTrVHpCXSzos1ELVazQ-ww__0Mzi4xV' + 'sb_publishable_NTrVHpCXSzos1ELVazQ-ww__0Mzi4xV',  // <-- PON TU SERVICE_ROLE KEY
      },
      body: JSON.stringify({
        email,
        role: 'admin_clinica',
        tenant_id: clinica.tenant_id
      })
    })

    const result = await res.json()

    if (res.ok) {
      setMessage(`Admin creado: ${email}. Magic Link enviado. Tenant: ${clinica.nombre}`)
      setEmail('')
    } else {
      setMessage('Error: ' + result.error)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Crear Admin de Clínica</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email del admin</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="clinica">Clínica</Label>
            <Select value={selectedClinica} onValueChange={setSelectedClinica}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clinicas.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Admin Clínica'}
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