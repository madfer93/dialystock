'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProductosLotes() {
  const [productos, setProductos] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [clinicaNombre, setClinicaNombre] = useState('Clínica')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('No hay usuario autenticado')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single()

        if (!profile || !profile.tenant_id) {
          setError('No se encontró tenant_id')
          return
        }

        const tenantId = profile.tenant_id

        // Obtener nombre de la clínica
        const { data: clinica } = await supabase
          .from('clinicas')
          .select('nombre')
          .eq('tenant_id', tenantId)
          .single()

        setClinicaNombre(clinica?.nombre || 'Clínica')

        // Cargar productos
        const { data: productosData, error: prodError } = await supabase
          .from('productos')
          .select('*')
          .eq('tenant_id', tenantId)

        if (prodError) throw prodError
        setProductos(productosData || [])

        // Cargar lotes
        const { data: lotesData, error: lotesError } = await supabase
          .from('lotes')
          .select('*')
          .eq('tenant_id', tenantId)

        if (lotesError) throw lotesError
        setLotes(lotesData || [])

        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const imprimirInventario = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando inventario...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-200 text-2xl mb-4">{error}</p>
          <Link
            href="/clinica"
            className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      {/* HEADER */}
      <header className="bg-white shadow-lg print:shadow-none">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://uralmzgniwcafidyqtiu.supabase.co/storage/v1/object/sign/archivos/davita_logo-ul-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OTk3NGZmZS02OTgxLTRmZGQtYjAzOC0xMGQwY2JkYjk1YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcmNoaXZvcy9kYXZpdGFfbG9nby11bC0xLnBuZyIsImlhdCI6MTc2Njg5NDUwNywiZXhwIjoxNzk4NDMwNTA3fQ.3BM7JDmZ_cOZY_zSa7lYQ55nlVhEBG7ySI9etUP7Bow"
                alt="DaVita Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">DialyStock</h1>
                <p className="text-sm text-gray-600">{clinicaNombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={imprimirInventario}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                🖨️ Imprimir
              </button>
              <Link
                href="/clinica"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                ← Volver
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto p-6 print:p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 print:shadow-none">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Inventario de Productos y Lotes
          </h2>

          {/* GRID CON PRODUCTOS Y LOTES LADO A LADO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* COLUMNA IZQUIERDA: PRODUCTOS */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Productos</h3>
                <span className="text-sm text-gray-600">
                  Total: <span className="font-bold text-indigo-600">{productos.length}</span>
                </span>
              </div>

              <div className="overflow-y-auto max-h-96">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-indigo-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">Código</th>
                      <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">Descripción</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700">Min</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700">Max</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {productos.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 p-4 text-center text-gray-500">
                          No hay productos registrados
                        </td>
                      </tr>
                    ) : (
                      productos.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="border border-gray-300 p-2 font-mono text-xs">{p.codigo || 'N/A'}</td>
                          <td className="border border-gray-300 p-2 text-xs">{p.descripcion}</td>
                          <td className="border border-gray-300 p-2 text-center font-semibold text-xs">{p.stock_minimo || 0}</td>
                          <td className="border border-gray-300 p-2 text-center font-semibold text-xs">{p.stock_maximo || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLUMNA DERECHA: LOTES */}
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Lotes Activos</h3>
                <span className="text-sm text-gray-600">
                  Total: <span className="font-bold text-green-600">{lotes.length}</span>
                </span>
              </div>

              <div className="overflow-y-auto max-h-96">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-green-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">Lote</th>
                      <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">Producto</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700">Cant.</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {lotes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 p-4 text-center text-gray-500">
                          No hay lotes registrados
                        </td>
                      </tr>
                    ) : (
                      lotes.map((l) => {
                        const diasVencimiento = Math.floor(
                          (new Date(l.fecha_vencimiento).getTime() - Date.now()) / (1000 * 3600 * 24)
                        )
                        const stockBajo = l.cantidad_disponible < 10

                        return (
                          <tr key={l.id} className="hover:bg-gray-50 transition">
                            <td className="border border-gray-300 p-2 font-mono text-xs">{l.numero_lote}</td>
                            <td className="border border-gray-300 p-2 text-xs">{l.producto_codigo}</td>
                            <td className="border border-gray-300 p-2 text-center">
                              <span className={`font-semibold text-xs ${stockBajo ? 'text-red-600' : 'text-gray-800'}`}>
                                {l.cantidad_disponible}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {diasVencimiento <= 30 ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                  ⚠️ Vence
                                </span>
                              ) : stockBajo ? (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                  ⚠️ Bajo
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                  ✓ OK
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER GENERAL */}
      <div className="footer-credits text-white/70">
        💻 <strong>Sistema desarrollado por Manuel Fernando Madrid</strong> | DaVita Farmacia © 2025 Todos los derechos reservados | Sistema HD/PD V3.0
      </div>
    </div>
  )
}