'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SolicitudesPanel() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [clinicaNombre, setClinicaNombre] = useState('Clínica')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  const [detalles, setDetalles] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

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

        if (!profile) {
          setError('No se encontró el perfil')
          return
        }

        const { data: clinica } = await supabase
          .from('clinicas')
          .select('nombre')
          .eq('tenant_id', profile.tenant_id)
          .single()

        setClinicaNombre(clinica?.nombre || 'Clínica')

        // Cargar solicitudes
        const { data: sol, error: solError } = await supabase
          .from('solicitudes')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('fecha', { ascending: false })

        if (solError) {
          console.error('Error cargando solicitudes:', solError)
          setError('Error al cargar solicitudes: ' + solError.message)
          return
        }

        console.log('Solicitudes cargadas:', sol)
        setSolicitudes(sol || [])
        setLoading(false)
      } catch (err: any) {
        console.error('Error general:', err)
        setError(err.message || 'Error al cargar datos')
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const verDetalles = async (solicitud: any) => {
    try {
      setSelectedSolicitud(solicitud)

      // Cargar items de la solicitud (usando tabla estandar solicitudes_items)
      const { data: detallesData, error: detError } = await supabase
        .from('solicitudes_items')
        .select('*')
        .eq('solicitud_id', solicitud.id)

      if (detError) {
        console.error('Error cargando detalles:', detError)
      }

      console.log('Items cargados:', detallesData)
      setDetalles(detallesData || [])

      // Cargar lotes de la solicitud
      const { data: lotesData, error: lotError } = await supabase
        .from('solicitudes_lotes')
        .select('*')
        .eq('id_solicitud', solicitud.id)

      if (lotError) {
        console.error('Error cargando lotes:', lotError)
      }

      console.log('Lotes:', lotesData)
      setLotes(lotesData || [])
      setShowModal(true)
    } catch (err) {
      console.error('Error en verDetalles:', err)
    }
  }

  const imprimirDetalle = () => {
    if (!selectedSolicitud) return

    const ventana = window.open('', '_blank')
    ventana?.document.write(`
      <html>
        <head>
          <title>Solicitud ${selectedSolicitud.id}</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            img { width: 250px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 12px; }
            .header { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <img src="https://uralmzgniwcafidyqtiu.supabase.co/storage/v1/object/sign/archivos/davita_logo-ul-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OTk3NGZmZS02OTgxLTRmZGQtYjAzOC0xMGQwY2JkYjk1YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcmNoaXZvcy9kYXZpdGFfbG9nby11bC0xLnBuZyIsImlhdCI6MTc2Njg5NDUwNywiZXhwIjoxNzk4NDMwNTA3fQ.3BM7JDmZ_cOZY_zSa7lYQ55nlVhEBG7ySI9etUP7Bow" alt="DaVita" />
          
          <div class="header">
            <h1>Solicitud ${selectedSolicitud.id}</h1>
            <p><strong>Tipo:</strong> ${selectedSolicitud.tipo}</p>
            <p><strong>Estado:</strong> ${selectedSolicitud.estado}</p>
            <p><strong>Fecha:</strong> ${new Date(selectedSolicitud.fecha).toLocaleString('es-CO')}</p>
            <p><strong>Solicitante:</strong> ${selectedSolicitud.solicitante || 'N/A'}</p>
            ${selectedSolicitud.paciente && selectedSolicitud.paciente !== '-' ? `<p><strong>Paciente:</strong> ${selectedSolicitud.paciente}</p>` : ''}
            ${selectedSolicitud.completado_por ? `<p><strong>Completado por:</strong> ${selectedSolicitud.completado_por}</p>` : ''}
            ${selectedSolicitud.observaciones && selectedSolicitud.observaciones !== '-' ? `<p><strong>Observaciones:</strong> ${selectedSolicitud.observaciones}</p>` : ''}
          </div>

          ${detalles.length > 0 ? `
            <div class="section-title">Detalle de Productos</div>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Cant. Solicitada</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                ${detalles.map(d => `
                  <tr>
                    <td>${d.producto_codigo}</td>
                    <td>${d.descripcion || d.producto_descripcion || ''}</td>
                    <td style="text-align: center;">${d.cantidad_solicitada}</td>
                    <td>${d.observacion || d.observaciones || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${lotes.length > 0 ? `
            <div class="section-title">Lotes Entregados</div>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Número Lote</th>
                  <th>Fecha Vencimiento</th>
                  <th>Cantidad Entregada</th>
                </tr>
              </thead>
              <tbody>
                ${lotes.map(l => `
                  <tr>
                    <td>${l.producto_codigo}</td>
                    <td>${l.numero_lote}</td>
                    <td>${new Date(l.fecha_vencimiento).toLocaleDateString('es-CO')}</td>
                    <td style="text-align: center;">${l.cantidad_entregada_lote}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        </body>
      </html>
    `)
    ventana?.document.close()
    ventana?.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando solicitudes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-200 text-xl mb-4">{error}</p>
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
      <header className="bg-white shadow-lg">
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

            <Link
              href="/clinica"
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Solicitudes de la Clínica</h2>
            <div className="text-sm text-gray-600">
              Total: <span className="font-bold text-indigo-600">{solicitudes.length}</span> solicitudes
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Tipo</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Estado</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Solicitante</th>
                  <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-gray-300 p-8 text-center text-gray-500">
                      No hay solicitudes registradas
                    </td>
                  </tr>
                ) : (
                  solicitudes.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="border border-gray-300 p-3 font-mono text-xs">{s.id}</td>
                      <td className="border border-gray-300 p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${s.tipo === 'HD' ? 'bg-blue-100 text-blue-700' :
                          s.tipo === 'PD' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {s.tipo}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.estado === 'Completado'
                          ? 'bg-green-100 text-green-700'
                          : s.estado === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                          {s.estado}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3 text-sm">
                        {new Date(s.fecha).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="border border-gray-300 p-3 text-sm">{s.solicitante || 'N/A'}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => verDetalles(s)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL DE DETALLES */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Solicitud {selectedSolicitud.id}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600"><strong>Tipo:</strong> {selectedSolicitud.tipo}</p>
                  <p className="text-gray-600"><strong>Estado:</strong> {selectedSolicitud.estado}</p>
                  <p className="text-gray-600"><strong>Fecha:</strong> {new Date(selectedSolicitud.fecha).toLocaleString('es-CO')}</p>
                  <p className="text-gray-600"><strong>Solicitante:</strong> {selectedSolicitud.solicitante}</p>
                  {selectedSolicitud.paciente && selectedSolicitud.paciente !== '-' && (
                    <p className="text-gray-600 col-span-2"><strong>Paciente:</strong> {selectedSolicitud.paciente}</p>
                  )}
                  {selectedSolicitud.completado_por && (
                    <p className="text-gray-600"><strong>Completado por:</strong> {selectedSolicitud.completado_por}</p>
                  )}
                  {selectedSolicitud.observaciones && selectedSolicitud.observaciones !== '-' && (
                    <p className="text-gray-600 col-span-2"><strong>Observaciones:</strong> {selectedSolicitud.observaciones}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* DETALLES DE PRODUCTOS */}
            {detalles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Productos Solicitados ({detalles.length})</h4>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="border p-2 text-left">Código</th>
                        <th className="border p-2 text-left">Descripción</th>
                        <th className="border p-2 text-center">Solicitado</th>
                        <th className="border p-2 text-left">Observación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((d, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2 font-mono text-xs">{d.producto_codigo}</td>
                          <td className="border p-2 text-xs">{d.descripcion}</td>
                          <td className="border p-2 text-center">{d.cantidad_solicitada}</td>
                          <td className="border p-2 text-left">{d.observacion || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LOTES ENTREGADOS */}
            {lotes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Lotes Entregados ({lotes.length})</h4>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="border p-2 text-left">Producto</th>
                        <th className="border p-2 text-left">Número Lote</th>
                        <th className="border p-2 text-center">Vencimiento</th>
                        <th className="border p-2 text-center">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotes.map((l, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2 text-xs">{l.producto_codigo}</td>
                          <td className="border p-2 font-mono text-xs">{l.numero_lote}</td>
                          <td className="border p-2 text-center text-xs">{new Date(l.fecha_vencimiento).toLocaleDateString('es-CO')}</td>
                          <td className="border p-2 text-center font-semibold">{l.cantidad_entregada_lote}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BOTONES */}
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cerrar
              </button>
              <button
                onClick={imprimirDetalle}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                🖨️ Imprimir Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER GENERAL */}
      <div className="footer-credits text-white/70">
        💻 <strong>Sistema desarrollado por Manuel Fernando Madrid</strong> | DaVita Farmacia © 2025 Todos los derechos reservados | Sistema HD/PD V3.0
      </div>
    </div>
  )
}