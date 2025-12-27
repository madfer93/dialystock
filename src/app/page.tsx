'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard',
      },
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('¡Revisa tu correo! Te enviamos un enlace mágico para entrar.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800">DialyStock</CardTitle>
          <CardDescription className="text-lg mt-2">
            Sistema de Gestión de Inventario Médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Enlace Mágico'}
            </Button>
          </form>

          {message && (
            <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-center">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}