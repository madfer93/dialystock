import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Cliente admin de Supabase (con service_role key para crear usuarios)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verificar firma del webhook de Wompi
function verifyWompiSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')
    return signature === expectedSignature
}

export async function POST(req: Request) {
    try {
        const payload = await req.text()
        const signature = req.headers.get('x-wompi-signature') || ''

        // Obtener el secreto de eventos de Wompi desde la config
        const { data: config } = await supabaseAdmin
            .from('app_settings')
            .select('data')
            .eq('category', 'social')
            .single()

        const wompiSecret = config?.data?.wompi_events_secret || process.env.WOMPI_EVENTS_SECRET || ''

        // Verificar firma (en producción)
        if (wompiSecret && !verifyWompiSignature(payload, signature, wompiSecret)) {
            console.error('Firma de Wompi inválida')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(payload)

        // Solo procesar transacciones aprobadas
        if (event.event !== 'transaction.updated' || event.data?.transaction?.status !== 'APPROVED') {
            return NextResponse.json({ message: 'Event ignored' })
        }

        const transaction = event.data.transaction
        const customerEmail = transaction.customer_email
        const customerName = transaction.customer_data?.full_name || 'Admin'
        const reference = transaction.reference // Puede contener info del plan
        const amountInCents = transaction.amount_in_cents

        // Determinar el plan basado en el monto
        let planType = 'starter'
        if (amountInCents >= 100000000) { // $1,000,000+
            planType = 'enterprise'
        } else if (amountInCents >= 50000000) { // $500,000+
            planType = 'pro'
        }

        // Verificar si el lead existe
        const { data: existingLead } = await supabaseAdmin
            .from('app_leads')
            .select('*')
            .eq('email', customerEmail)
            .maybeSingle()

        // 1. Crear la clínica
        const clinicName = existingLead?.clinic_name || `Clínica de ${customerName}`
        const { data: newClinic, error: clinicError } = await supabaseAdmin
            .from('clinicas')
            .insert({
                nombre: clinicName,
                plan: planType,
                activo: true,
                fecha_pago: new Date().toISOString(),
                wompi_transaction_id: transaction.id
            })
            .select()
            .single()

        if (clinicError) {
            console.error('Error creando clínica:', clinicError)
            throw clinicError
        }

        // 2. Crear usuario en Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: customerEmail,
            email_confirm: true,
            user_metadata: {
                full_name: customerName,
                plan: planType
            }
        })

        if (authError && !authError.message.includes('already been registered')) {
            console.error('Error creando usuario auth:', authError)
            throw authError
        }

        // 3. Crear o actualizar el perfil
        const userId = authUser?.user?.id
        if (userId) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    email: customerEmail,
                    nombre: customerName,
                    role: 'admin_clinica',
                    tenant_id: newClinic.id,
                    plan: planType
                })

            if (profileError) {
                console.error('Error creando perfil:', profileError)
            }
        }

        // 4. Actualizar el lead como "convertido"
        if (existingLead) {
            await supabaseAdmin
                .from('app_leads')
                .update({ status: 'convertido' })
                .eq('id', existingLead.id)
        }

        // 5. Registrar en audit log
        await supabaseAdmin.from('app_audit_logs').insert({
            admin_email: 'sistema@dialystock.com',
            action: 'WOMPI_PAYMENT_SUCCESS',
            details: `Pago recibido: ${customerEmail} - Plan ${planType} - $${amountInCents / 100} COP - Clínica: ${clinicName}`
        })

        // 6. Enviar Magic Link al usuario para que pueda acceder
        await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: customerEmail,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dialystock.vercel.app'}/auth/callback`
            }
        })

        console.log(`✅ Pago procesado: ${customerEmail} - ${planType}`)

        return NextResponse.json({
            success: true,
            message: 'Payment processed successfully',
            clinic_id: newClinic.id
        })

    } catch (error) {
        console.error('Error procesando webhook Wompi:', error)
        return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
        )
    }
}

// Wompi también puede hacer GET para verificar el endpoint
export async function GET() {
    return NextResponse.json({ status: 'Webhook endpoint active' })
}
