'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'madfer1993@gmail.com') {
        router.push('/')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return <p className="text-center mt-20 text-white text-2xl">Verificando acceso...</p>

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-purple-900 text-white flex flex-col">
        <div className="p-8">
          <h1 className="text-3xl font-bold">DialyStock</h1>
          <p className="text-sm opacity-80 mt-2">Panel del Dueño</p>
        </div>
        <nav className="flex-1 px-6">
          <Link href="/superadmin" className="block py-4 px-6 rounded-lg hover:bg-white hover:bg-opacity-20 transition mb-2">
            Inicio
          </Link>
          <Link href="/superadmin/clinicas/nueva" className="block py-4 px-6 rounded-lg hover:bg-white hover:bg-opacity-20 transition mb-2">
            Clínicas
          </Link>
          <Link href="/superadmin/usuario/nuevo" className="block py-4 px-6 rounded-lg hover:bg-white hover:bg-opacity-20 transition mb-2">
            Crear Admin Clínica
          </Link>
        </nav>
        <div className="p-6 border-t border-white border-opacity-20">
          <p className="text-sm opacity-80">Conectado como:</p>
          <p className="font-bold">{user.email}</p>
          <Button onClick={handleLogout} variant="ghost" className="mt-4 text-white hover:bg-white hover:bg-opacity-20 w-full">
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  )
}