'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const allowedRoles = ['admin_clinica']

export default function ClinicaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

      if (error || !profileData || !allowedRoles.includes(profileData.role)) {
        router.push('/')
        return
      }

      setUser(user)
      setProfile(profileData)
    }
    checkUser()
  }, [router])

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
        <p className="text-white text-2xl">Cargando...</p>
      </div>
    )
  }

  return <>{children}</>
}