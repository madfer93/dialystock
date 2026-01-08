import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ClinicasPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Clínicas</h1>
        <Link href="/(superadmin)/clinicas/nueva">
          <Button>Nueva Clínica</Button>
        </Link>
      </div>
      <p className="text-gray-600">
        Aquí podrás ver todas las clínicas registradas y crear nuevas para revender el sistema.
      </p>
    </div>
  )
}