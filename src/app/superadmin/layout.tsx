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
  X,
  Settings
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
    { name: 'Configuración', href: '/superadmin/config', icon: Settings },
  ]

  if (!user) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0f172a] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo Section */}
            <Link href="/superadmin" className="flex items-center gap-3 group">
              <div className="group-hover:scale-110 transition-transform">
                <img
                  src="/logo-dialystock.png"
                  alt="Logo"
                  className="h-14 w-14 object-contain shadow-lg shadow-blue-500/10 rounded-xl"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight leading-none text-white">DialyStock</span>
                <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-0.5">Global Admin</span>
              </div>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 py-2 px-4 rounded-xl transition-all duration-200
                    ${pathname === item.href
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <item.icon size={18} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              ))}

              <div className="h-6 w-px bg-white/10 mx-4"></div>

              {/* User Dropdown / Info (Simplified for now) */}
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Admin</span>
                  <span className="text-xs font-medium text-slate-300 max-w-[150px] truncate">{user.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white bg-white/5 rounded-xl border border-white/10"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu content */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 inset-x-0 bg-[#0f172a] border-t border-white/5 p-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-4 py-4 px-5 rounded-2xl transition-all
                  ${pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-slate-300'}
                `}
              >
                <item.icon size={20} />
                <span className="font-bold">{item.name}</span>
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-white/5">
              <Button
                onClick={handleLogout}
                className="w-full justify-start gap-4 py-8 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl"
              >
                <LogOut size={20} />
                <span className="font-bold">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-80px)] bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}