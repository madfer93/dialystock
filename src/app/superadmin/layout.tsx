'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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

  const navItems = [
    { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
    { name: 'Nueva Clínica', href: '/superadmin/clinicas/nueva', icon: Building2 },
    { name: 'Nuevo Admin', href: '/superadmin/usuario/nuevo', icon: UserPlus },
  ]

  if (!user) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0f172a] text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-400" size={24} />
          <span className="font-bold text-xl tracking-tight">DialyStock <span className="text-blue-400 text-xs">PRO</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-slate-300 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">DialyStock</h1>
              <p className="text-xs text-blue-400 font-medium tracking-widest uppercase">Global Admin</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all duration-200 group
                  ${pathname === item.href
                    ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-inner'
                    : 'hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} className={pathname === item.href ? 'text-blue-400' : 'group-hover:text-blue-400'} />
                <span className="font-medium">{item.name}</span>
                {pathname === item.href && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Identificado como</p>
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-4 py-6 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}