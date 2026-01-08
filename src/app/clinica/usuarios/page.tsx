'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function CrearUsuarios() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('jefe_hd')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Enviar Magic Link
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (authError) throw authError

      // Esperar a que el usuario se cree
      let newUserId
      let attempts = 0
      while (!newUserId && attempts < 5) {
        attempts++
        const { data: users } = await supabase.auth.admin.listUsers()
        const newUser = users.users.find(u => u.email === email)
        if (newUser) newUserId = newUser.id
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!newUserId) throw new Error('No se pudo crear el usuario')

      // Asignar rol y tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', newUserId)
        .single()

      if (!profile) throw new Error('No se pudo obtener el tenant_id del perfil creado.')
      const tenantId = profile.tenant_id

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role, tenant_id: tenantId })
        .eq('id', newUserId)

      if (updateError) throw updateError

      setMessage(`Usuario creado con rol ${role.toUpperCase().replace('_', ' ')}. Magic Link enviado a ${email}.`)
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Crear Usuario</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-indigo-600"
              placeholder="nuevo@usuario.com"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-700">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-indigo-600"
            >
              <option value="jefe_hd">Jefe HD</option>
              <option value="jefe_pd">Jefe PD</option>
              <option value="quimico">Químico</option>
              <option value="farmacia">Farmacia</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white text-xl rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear y Enviar Magic Link'}
          </button>
          {message && <p className="text-green-600 text-center mt-4">{message}</p>}
          {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        </div>
      </div>

      {/* FOOTER GENERAL */}
      <div className="footer-credits text-white/70">
        💻 <strong>Sistema desarrollado por Manuel Fernando Madrid</strong> | DaVita Farmacia © 2025 Todos los derechos reservados | Sistema HD/PD V3.0
      </div>
    </div>
  )
}