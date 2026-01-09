'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, Mail, ArrowRight, Loader2 } from 'lucide-react'

type PaymentStatus = 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR' | 'LOADING'

function ConfirmacionContent() {
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<PaymentStatus>('LOADING')
    const [transactionId, setTransactionId] = useState<string>('')

    useEffect(() => {
        // Wompi redirige con el ID de transacción
        const id = searchParams.get('id')
        if (id) {
            setTransactionId(id)
            checkTransactionStatus(id)
        } else {
            // Si no hay ID, verificar si viene el status directamente
            const statusParam = searchParams.get('status')
            if (statusParam) {
                setStatus(statusParam.toUpperCase() as PaymentStatus)
            } else {
                setStatus('ERROR')
            }
        }
    }, [searchParams])

    const checkTransactionStatus = async (id: string) => {
        try {
            // Consultar estado de la transacción en Wompi
            const response = await fetch(`https://production.wompi.co/v1/transactions/${id}`)
            const data = await response.json()

            if (data.data?.status) {
                setStatus(data.data.status as PaymentStatus)
            } else {
                setStatus('ERROR')
            }
        } catch (error) {
            console.error('Error verificando transacción:', error)
            setStatus('ERROR')
        }
    }

    const statusConfig = {
        LOADING: {
            icon: Loader2,
            title: 'Verificando pago...',
            message: 'Por favor espera mientras confirmamos tu transacción.',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        APPROVED: {
            icon: CheckCircle2,
            title: '¡Pago Exitoso!',
            message: 'Tu cuenta ha sido activada. Revisa tu correo electrónico para acceder a DialyStock.',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        },
        DECLINED: {
            icon: XCircle,
            title: 'Pago Rechazado',
            message: 'Tu tarjeta fue rechazada. Por favor intenta con otro medio de pago.',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
        },
        PENDING: {
            icon: Clock,
            title: 'Pago Pendiente',
            message: 'Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20'
        },
        ERROR: {
            icon: XCircle,
            title: 'Error en la Transacción',
            message: 'Ocurrió un error al procesar tu pago. Por favor contacta a soporte.',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
        }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                <div className={`${config.bgColor} border ${config.borderColor} rounded-[2.5rem] p-12 text-center`}>
                    <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-8`}>
                        <Icon
                            size={48}
                            className={`${config.color} ${status === 'LOADING' ? 'animate-spin' : ''}`}
                        />
                    </div>

                    <h1 className={`text-3xl font-black mb-4 ${config.color}`}>
                        {config.title}
                    </h1>

                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                        {config.message}
                    </p>

                    {transactionId && (
                        <div className="bg-slate-800/50 rounded-2xl p-4 mb-8">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">
                                ID de Transacción
                            </p>
                            <p className="text-white font-mono text-sm break-all">
                                {transactionId}
                            </p>
                        </div>
                    )}

                    {status === 'APPROVED' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                <Mail className="text-emerald-500 shrink-0" size={24} />
                                <p className="text-sm text-emerald-300 text-left">
                                    Te hemos enviado un correo con el enlace de acceso a tu cuenta.
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all w-full justify-center"
                            >
                                Ir al Inicio
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    )}

                    {status === 'DECLINED' && (
                        <Link
                            href="/#planes"
                            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all w-full justify-center"
                        >
                            Intentar de Nuevo
                            <ArrowRight size={20} />
                        </Link>
                    )}

                    {status === 'PENDING' && (
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-600 transition-all w-full justify-center"
                        >
                            Volver al Inicio
                            <ArrowRight size={20} />
                        </Link>
                    )}

                    {status === 'ERROR' && (
                        <div className="space-y-4">
                            <a
                                href="https://wa.me/573045788873?text=Hola, tuve un problema con mi pago en DialyStock"
                                target="_blank"
                                className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all w-full justify-center"
                            >
                                Contactar Soporte
                            </a>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3 bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-600 transition-all w-full justify-center"
                            >
                                Volver al Inicio
                            </Link>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-600 text-xs mt-8">
                    DialyStock V4.0 - Gestión Médica Inteligente
                </p>
            </div>
        </div>
    )
}

export default function ConfirmacionPago() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        }>
            <ConfirmacionContent />
        </Suspense>
    )
}
