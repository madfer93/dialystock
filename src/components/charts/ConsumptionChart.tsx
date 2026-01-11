'use client'

import { useMemo } from 'react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

interface ConsumoData {
    fecha: string
    solicitudes: number
    productos: number
    aprobadas?: number
    rechazadas?: number
}

interface CategoriaData {
    nombre: string
    cantidad: number
    porcentaje: number
}

interface ConsumptionChartProps {
    data: ConsumoData[]
    tipo: 'linea' | 'barras' | 'area'
    titulo?: string
    darkMode?: boolean
}

interface CategoryChartProps {
    data: CategoriaData[]
    titulo?: string
    darkMode?: boolean
}

// Colores para los gráficos
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const GRADIENT_COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
}

// Gráfico de líneas/barras para consumo temporal
export function ConsumptionChart({ data, tipo, titulo, darkMode }: ConsumptionChartProps) {
    const textColor = darkMode ? '#e5e7eb' : '#374151'
    const gridColor = darkMode ? '#374151' : '#e5e7eb'

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Sin datos de consumo disponibles</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {titulo && <h3 className="text-lg font-bold mb-4">{titulo}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                {tipo === 'linea' ? (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="fecha" tick={{ fill: textColor, fontSize: 12 }} />
                        <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                border: `1px solid ${gridColor}`,
                                borderRadius: '8px',
                                color: textColor
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="solicitudes"
                            stroke={GRADIENT_COLORS.primary}
                            strokeWidth={2}
                            dot={{ fill: GRADIENT_COLORS.primary, strokeWidth: 2, r: 4 }}
                            name="Solicitudes"
                        />
                        <Line
                            type="monotone"
                            dataKey="productos"
                            stroke={GRADIENT_COLORS.success}
                            strokeWidth={2}
                            dot={{ fill: GRADIENT_COLORS.success, strokeWidth: 2, r: 4 }}
                            name="Productos"
                        />
                    </LineChart>
                ) : (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="fecha" tick={{ fill: textColor, fontSize: 12 }} />
                        <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                border: `1px solid ${gridColor}`,
                                borderRadius: '8px',
                                color: textColor
                            }}
                        />
                        <Legend />
                        <Bar dataKey="solicitudes" fill={GRADIENT_COLORS.primary} name="Solicitudes" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="productos" fill={GRADIENT_COLORS.success} name="Productos" radius={[4, 4, 0, 0]} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}

// Gráfico de pastel para categorías
export function CategoryChart({ data, titulo, darkMode }: CategoryChartProps) {
    const textColor = darkMode ? '#e5e7eb' : '#374151'

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Sin datos de categorías disponibles</p>
            </div>
        )
    }

    // Función de label personalizada con tipos correctos
    const renderLabel = (props: any) => {
        const { name, percent } = props
        return `${name}: ${(percent * 100).toFixed(0)}%`
    }

    return (
        <div className="w-full">
            {titulo && <h3 className="text-lg font-bold mb-4">{titulo}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data as any[]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="cantidad"
                        nameKey="nombre"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: textColor
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

// Gráfico de barras para aprobaciones vs rechazos
export function ApprovalChart({ data, darkMode }: { data: ConsumoData[], darkMode?: boolean }) {
    const textColor = darkMode ? '#e5e7eb' : '#374151'
    const gridColor = darkMode ? '#374151' : '#e5e7eb'

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Sin datos de aprobaciones disponibles</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold mb-4">Aprobaciones vs Rechazos</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="fecha" tick={{ fill: textColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${gridColor}`,
                            borderRadius: '8px',
                            color: textColor
                        }}
                    />
                    <Legend />
                    <Bar dataKey="aprobadas" stackId="a" fill={GRADIENT_COLORS.success} name="Aprobadas" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="rechazadas" stackId="a" fill={GRADIENT_COLORS.danger} name="Rechazadas" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// Gráfico de productos más solicitados
export function TopProductsChart({
    data,
    darkMode
}: {
    data: Array<{ codigo: string; descripcion: string; cantidad: number; confianza?: number }>
    darkMode?: boolean
}) {
    const textColor = darkMode ? '#e5e7eb' : '#374151'
    const gridColor = darkMode ? '#374151' : '#e5e7eb'

    const chartData = useMemo(() =>
        data.slice(0, 10).map(p => ({
            nombre: p.codigo,
            cantidad: p.cantidad,
            confianza: p.confianza || 0
        })),
        [data]
    )

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Sin datos de productos disponibles</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold mb-4">Top 10 Productos Solicitados</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis type="number" tick={{ fill: textColor, fontSize: 12 }} />
                    <YAxis dataKey="nombre" type="category" tick={{ fill: textColor, fontSize: 10 }} width={80} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${gridColor}`,
                            borderRadius: '8px',
                            color: textColor
                        }}
                    />
                    <Bar dataKey="cantidad" fill={GRADIENT_COLORS.primary} name="Cantidad" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// Componente de métricas resumidas
export function MetricCards({
    metricas,
    darkMode
}: {
    metricas: {
        totalSolicitudes: number
        solicitudesHoy: number
        tasaAprobacion: number
        tiempoPromedio: string
    }
    darkMode?: boolean
}) {
    const bgColor = darkMode ? 'bg-gray-800' : 'bg-white'
    const textColor = darkMode ? 'text-white' : 'text-gray-900'

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${bgColor} p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Solicitudes</p>
                <p className={`text-2xl font-bold ${textColor}`}>{metricas.totalSolicitudes}</p>
            </div>
            <div className={`${bgColor} p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
                <p className={`text-2xl font-bold text-blue-600`}>{metricas.solicitudesHoy}</p>
            </div>
            <div className={`${bgColor} p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasa Aprobacion</p>
                <p className={`text-2xl font-bold ${metricas.tasaAprobacion >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metricas.tasaAprobacion}%
                </p>
            </div>
            <div className={`${bgColor} p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo Promedio</p>
                <p className={`text-2xl font-bold ${textColor}`}>{metricas.tiempoPromedio}</p>
            </div>
        </div>
    )
}

export default ConsumptionChart
