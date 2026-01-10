-- =============================================
-- DIALYSTOCK V4.0 - Sistema de Aprobación Jefe HD
-- Migración: Flujo de aprobación y reglas de validación
-- =============================================

-- NOTA: La tabla reglas_validacion ya existe con columna 'activa'

-- Índices para reglas (si no existen)
CREATE INDEX IF NOT EXISTS idx_reglas_tenant ON reglas_validacion(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reglas_tipo ON reglas_validacion(tipo);
CREATE INDEX IF NOT EXISTS idx_reglas_activa ON reglas_validacion(activa);

-- 1. AGREGAR CAMPOS DE APROBACIÓN A SOLICITUDES (si no existen)
DO $$
BEGIN
    -- Campo para estado de aprobación
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'solicitudes' AND column_name = 'estado_aprobacion') THEN
        ALTER TABLE solicitudes ADD COLUMN estado_aprobacion VARCHAR(50) DEFAULT 'pendiente_revision';
        -- Valores: 'pendiente_revision', 'aprobado', 'devuelto'
    END IF;

    -- Campo para comentario de rechazo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'solicitudes' AND column_name = 'comentario_jefe') THEN
        ALTER TABLE solicitudes ADD COLUMN comentario_jefe TEXT;
    END IF;

    -- Campo para fecha de revisión
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'solicitudes' AND column_name = 'fecha_revision') THEN
        ALTER TABLE solicitudes ADD COLUMN fecha_revision TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Campo para ID del jefe que revisó
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'solicitudes' AND column_name = 'revisado_por') THEN
        ALTER TABLE solicitudes ADD COLUMN revisado_por UUID REFERENCES auth.users(id);
    END IF;

    -- Observación general de la solicitud
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'solicitudes' AND column_name = 'observacion_general') THEN
        ALTER TABLE solicitudes ADD COLUMN observacion_general TEXT;
    END IF;
END $$;

-- Índice para estado de aprobación
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado_aprobacion ON solicitudes(estado_aprobacion);

-- 3. TABLA DE LOG DE APROBACIONES
-- Registro de todas las acciones de aprobación/rechazo
CREATE TABLE IF NOT EXISTS aprobaciones_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitud_id TEXT NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL, -- 'ENVIADO_REVISION', 'APROBADO', 'DEVUELTO', 'MODIFICADO', 'ENVIADO_FARMACIA'
    usuario_id UUID REFERENCES auth.users(id),
    usuario_email VARCHAR(255),
    usuario_rol VARCHAR(50),
    comentario TEXT,
    datos_anteriores JSONB, -- Snapshot del estado anterior
    datos_nuevos JSONB, -- Snapshot del estado nuevo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para log
CREATE INDEX IF NOT EXISTS idx_aprobaciones_log_solicitud ON aprobaciones_log(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_log_tenant ON aprobaciones_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_log_fecha ON aprobaciones_log(created_at);

-- 4. TABLA DE NOTIFICACIONES PENDIENTES
CREATE TABLE IF NOT EXISTS notificaciones_pendientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    usuario_destino_id UUID REFERENCES auth.users(id),
    rol_destino VARCHAR(50), -- 'jefe_sala_hd', 'sala_hd', 'farmacia'
    tipo VARCHAR(50) NOT NULL, -- 'NUEVA_SOLICITUD', 'SOLICITUD_DEVUELTA', 'SOLICITUD_APROBADA'
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    solicitud_id TEXT REFERENCES solicitudes(id) ON DELETE CASCADE,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones_pendientes(usuario_destino_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_rol ON notificaciones_pendientes(rol_destino);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones_pendientes(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tenant ON notificaciones_pendientes(tenant_id);

-- 5. RLS POLICIES

-- Reglas de validación: solo admins y jefes pueden ver/editar
ALTER TABLE reglas_validacion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reglas visibles por tenant" ON reglas_validacion;
CREATE POLICY "Reglas visibles por tenant" ON reglas_validacion
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Reglas editables por jefes y admins" ON reglas_validacion;
CREATE POLICY "Reglas editables por jefes y admins" ON reglas_validacion
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin_clinica', 'jefe_sala_hd')
        )
    );

-- Log de aprobaciones: visible por tenant
ALTER TABLE aprobaciones_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Log visible por tenant" ON aprobaciones_log;
CREATE POLICY "Log visible por tenant" ON aprobaciones_log
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Log insertable por usuarios del tenant" ON aprobaciones_log;
CREATE POLICY "Log insertable por usuarios del tenant" ON aprobaciones_log
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Notificaciones: solo propias o por rol
ALTER TABLE notificaciones_pendientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notificaciones propias" ON notificaciones_pendientes;
CREATE POLICY "Notificaciones propias" ON notificaciones_pendientes
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        AND (
            usuario_destino_id = auth.uid()
            OR rol_destino IN (SELECT role FROM profiles WHERE id = auth.uid())
        )
    );

-- 7. FUNCIÓN PARA CREAR NOTIFICACIÓN
CREATE OR REPLACE FUNCTION crear_notificacion(
    p_tenant_id UUID,
    p_rol_destino VARCHAR,
    p_tipo VARCHAR,
    p_titulo VARCHAR,
    p_mensaje TEXT,
    p_solicitud_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notificacion_id UUID;
BEGIN
    INSERT INTO notificaciones_pendientes (
        tenant_id, rol_destino, tipo, titulo, mensaje, solicitud_id
    ) VALUES (
        p_tenant_id, p_rol_destino, p_tipo, p_titulo, p_mensaje, p_solicitud_id
    ) RETURNING id INTO v_notificacion_id;

    RETURN v_notificacion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNCIÓN PARA REGISTRAR ACCIÓN DE APROBACIÓN
CREATE OR REPLACE FUNCTION registrar_accion_aprobacion(
    p_solicitud_id TEXT,
    p_tenant_id UUID,
    p_accion VARCHAR,
    p_usuario_id UUID,
    p_usuario_email VARCHAR,
    p_usuario_rol VARCHAR,
    p_comentario TEXT DEFAULT NULL,
    p_datos_anteriores JSONB DEFAULT NULL,
    p_datos_nuevos JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO aprobaciones_log (
        solicitud_id, tenant_id, accion, usuario_id, usuario_email,
        usuario_rol, comentario, datos_anteriores, datos_nuevos
    ) VALUES (
        p_solicitud_id, p_tenant_id, p_accion, p_usuario_id, p_usuario_email,
        p_usuario_rol, p_comentario, p_datos_anteriores, p_datos_nuevos
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. INSERTAR REGLA POR DEFECTO PARA LÍNEAS/FILTROS (ejemplo)
-- Esta regla se debe configurar por cada clínica desde el panel de Jefe HD
-- INSERT INTO reglas_validacion (tenant_id, nombre, tipo, configuracion, mensaje_error)
-- VALUES (
--     'UUID_DE_LA_CLINICA',
--     'Líneas igual a Filtros',
--     'LINEAS_FILTROS',
--     '{"lineas": ["D009937", "D009936"], "filtros": ["D009888", "D009889", "D009890"]}',
--     'La cantidad de líneas debe ser igual a la cantidad de filtros'
-- );

-- 10. ACTUALIZAR SOLICITUDES EXISTENTES AL NUEVO ESTADO
UPDATE solicitudes
SET estado_aprobacion = 'aprobado'
WHERE estado_aprobacion IS NULL
AND estado IN ('Despachado', 'En proceso');

UPDATE solicitudes
SET estado_aprobacion = 'pendiente_revision'
WHERE estado_aprobacion IS NULL
AND estado = 'Pendiente';

COMMENT ON TABLE reglas_validacion IS 'Reglas de validación configurables para solicitudes HD';
COMMENT ON TABLE aprobaciones_log IS 'Historial de acciones de aprobación/rechazo de solicitudes';
COMMENT ON TABLE notificaciones_pendientes IS 'Cola de notificaciones para usuarios del sistema';
