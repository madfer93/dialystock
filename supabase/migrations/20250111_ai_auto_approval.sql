-- =====================================================
-- SISTEMA DE AUTO-APROBACIÓN INTELIGENTE - DialyStock
-- La IA aprende durante la semana y auto-aprueba los sábados
-- Horario: Lunes a Sábado (Domingos cerrado)
-- Jefe HD no trabaja sábados -> IA toma el control
-- =====================================================

-- Configuración de horarios por clínica
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS config_ia JSONB DEFAULT '{
  "auto_aprobacion_enabled": true,
  "dias_laborales": [1, 2, 3, 4, 5, 6],
  "dia_auto_aprobacion": 6,
  "hora_inicio": 7,
  "hora_fin": 18,
  "confianza_minima": 70,
  "notificar_admin": true
}'::jsonb;

-- Comentario: dias_laborales = 1-6 (Lunes a Sábado), 0 = Domingo cerrado
-- dia_auto_aprobacion = 6 (Sábado) cuando Jefe HD no está

-- Tabla de productos confiables (aprendidos por la IA)
CREATE TABLE IF NOT EXISTS productos_confiables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,

    producto_codigo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),

    -- Métricas de confianza
    veces_solicitado INTEGER DEFAULT 0,
    veces_aprobado INTEGER DEFAULT 0,
    veces_rechazado INTEGER DEFAULT 0,
    cantidad_promedio DECIMAL(10,2) DEFAULT 0,
    cantidad_max_aprobada INTEGER DEFAULT 0,

    -- Nivel de confianza calculado (0-100)
    nivel_confianza DECIMAL(5,2) DEFAULT 0,

    -- Último solicitante conocido
    ultimo_solicitante VARCHAR(255),
    ultima_solicitud TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, producto_codigo)
);

CREATE INDEX IF NOT EXISTS idx_productos_confiables_tenant ON productos_confiables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_productos_confiables_confianza ON productos_confiables(nivel_confianza DESC);

-- Tabla de log de auto-aprobaciones
CREATE TABLE IF NOT EXISTS auto_aprobaciones_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,

    solicitud_id UUID NOT NULL,

    -- Decisión de la IA
    decision VARCHAR(20) NOT NULL, -- 'auto_aprobado', 'requiere_revision', 'rechazado_confianza'
    motivo TEXT,

    -- Métricas usadas para la decisión
    confianza_promedio DECIMAL(5,2),
    productos_evaluados INTEGER,
    productos_confiables INTEGER,
    productos_nuevos INTEGER,

    -- Contexto
    dia_semana INTEGER, -- 0-6
    es_sabado BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_aprobaciones_tenant ON auto_aprobaciones_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_aprobaciones_fecha ON auto_aprobaciones_log(created_at);

-- RLS Policies
ALTER TABLE productos_confiables ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_aprobaciones_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver productos confiables de su tenant"
ON productos_confiables FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema puede gestionar productos confiables"
ON productos_confiables FOR ALL
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuarios pueden ver log auto-aprobaciones de su tenant"
ON auto_aprobaciones_log FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema puede insertar auto-aprobaciones"
ON auto_aprobaciones_log FOR INSERT
WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- FUNCIÓN: Actualizar confianza de producto
-- Se ejecuta cada vez que un producto es aprobado/rechazado
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_confianza_producto(
    p_tenant_id UUID,
    p_producto_codigo VARCHAR(50),
    p_descripcion VARCHAR(255),
    p_cantidad INTEGER,
    p_fue_aprobado BOOLEAN,
    p_solicitante VARCHAR(255)
) RETURNS void AS $$
DECLARE
    v_existe BOOLEAN;
BEGIN
    -- Verificar si existe
    SELECT EXISTS(
        SELECT 1 FROM productos_confiables
        WHERE tenant_id = p_tenant_id AND producto_codigo = p_producto_codigo
    ) INTO v_existe;

    IF v_existe THEN
        -- Actualizar existente
        UPDATE productos_confiables SET
            veces_solicitado = veces_solicitado + 1,
            veces_aprobado = CASE WHEN p_fue_aprobado THEN veces_aprobado + 1 ELSE veces_aprobado END,
            veces_rechazado = CASE WHEN NOT p_fue_aprobado THEN veces_rechazado + 1 ELSE veces_rechazado END,
            cantidad_promedio = (cantidad_promedio * veces_solicitado + p_cantidad) / (veces_solicitado + 1),
            cantidad_max_aprobada = CASE
                WHEN p_fue_aprobado AND p_cantidad > cantidad_max_aprobada THEN p_cantidad
                ELSE cantidad_max_aprobada
            END,
            -- Calcular nivel de confianza: (aprobados / total) * 100, mínimo 5 solicitudes
            nivel_confianza = CASE
                WHEN veces_solicitado + 1 >= 5 THEN
                    ((veces_aprobado + CASE WHEN p_fue_aprobado THEN 1 ELSE 0 END)::DECIMAL / (veces_solicitado + 1)) * 100
                ELSE 0
            END,
            ultimo_solicitante = p_solicitante,
            ultima_solicitud = NOW(),
            updated_at = NOW()
        WHERE tenant_id = p_tenant_id AND producto_codigo = p_producto_codigo;
    ELSE
        -- Insertar nuevo
        INSERT INTO productos_confiables (
            tenant_id, producto_codigo, descripcion,
            veces_solicitado, veces_aprobado, veces_rechazado,
            cantidad_promedio, cantidad_max_aprobada, nivel_confianza,
            ultimo_solicitante, ultima_solicitud
        ) VALUES (
            p_tenant_id, p_producto_codigo, p_descripcion,
            1,
            CASE WHEN p_fue_aprobado THEN 1 ELSE 0 END,
            CASE WHEN NOT p_fue_aprobado THEN 1 ELSE 0 END,
            p_cantidad,
            CASE WHEN p_fue_aprobado THEN p_cantidad ELSE 0 END,
            0, -- Sin confianza hasta 5 solicitudes
            p_solicitante, NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Evaluar solicitud para auto-aprobación
-- Retorna si la solicitud puede ser auto-aprobada
-- =====================================================
CREATE OR REPLACE FUNCTION evaluar_auto_aprobacion(
    p_tenant_id UUID,
    p_solicitud_id UUID
) RETURNS TABLE (
    puede_aprobar BOOLEAN,
    confianza_promedio DECIMAL,
    productos_evaluados INTEGER,
    productos_confiables INTEGER,
    productos_nuevos INTEGER,
    motivo TEXT
) AS $$
DECLARE
    v_config JSONB;
    v_confianza_minima DECIMAL;
    v_dia_actual INTEGER;
    v_auto_enabled BOOLEAN;
    v_total_items INTEGER;
    v_items_confiables INTEGER;
    v_items_nuevos INTEGER;
    v_confianza_total DECIMAL := 0;
    v_motivo TEXT;
    v_puede_aprobar BOOLEAN := FALSE;
BEGIN
    -- Obtener configuración de la clínica
    SELECT config_ia INTO v_config FROM clinicas WHERE id = p_tenant_id;

    v_auto_enabled := COALESCE((v_config->>'auto_aprobacion_enabled')::BOOLEAN, TRUE);
    v_confianza_minima := COALESCE((v_config->>'confianza_minima')::DECIMAL, 70);
    v_dia_actual := EXTRACT(DOW FROM NOW())::INTEGER;

    -- Verificar si es domingo (cerrado)
    IF v_dia_actual = 0 THEN
        v_motivo := 'Domingo - Clínica cerrada';
        RETURN QUERY SELECT FALSE, 0::DECIMAL, 0, 0, 0, v_motivo;
        RETURN;
    END IF;

    -- Verificar si auto-aprobación está habilitada
    IF NOT v_auto_enabled THEN
        v_motivo := 'Auto-aprobación deshabilitada';
        RETURN QUERY SELECT FALSE, 0::DECIMAL, 0, 0, 0, v_motivo;
        RETURN;
    END IF;

    -- Contar items de la solicitud
    SELECT COUNT(*) INTO v_total_items
    FROM solicitudes_items WHERE solicitud_id = p_solicitud_id;

    -- Contar items con productos confiables (nivel >= minimo)
    SELECT
        COUNT(*),
        COALESCE(AVG(pc.nivel_confianza), 0)
    INTO v_items_confiables, v_confianza_total
    FROM solicitudes_items si
    LEFT JOIN productos_confiables pc ON pc.producto_codigo = si.producto_codigo AND pc.tenant_id = p_tenant_id
    WHERE si.solicitud_id = p_solicitud_id
      AND pc.nivel_confianza >= v_confianza_minima;

    -- Contar items nuevos (sin historial o bajo confianza)
    v_items_nuevos := v_total_items - v_items_confiables;

    -- Evaluar decisión
    IF v_items_nuevos = 0 AND v_items_confiables = v_total_items THEN
        -- Todos los productos son confiables
        v_puede_aprobar := TRUE;
        v_motivo := 'Todos los productos tienen alta confianza histórica';
    ELSIF v_items_confiables >= (v_total_items * 0.8) THEN
        -- Al menos 80% confiables
        v_puede_aprobar := TRUE;
        v_motivo := 'Mayoría de productos (80%+) son confiables';
    ELSE
        v_puede_aprobar := FALSE;
        v_motivo := 'Productos nuevos o con baja confianza detectados';
    END IF;

    RETURN QUERY SELECT
        v_puede_aprobar,
        v_confianza_total,
        v_total_items,
        v_items_confiables,
        v_items_nuevos,
        v_motivo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Ejecutar auto-aprobación (solo sábados o manual)
-- =====================================================
CREATE OR REPLACE FUNCTION ejecutar_auto_aprobacion(
    p_tenant_id UUID,
    p_solicitud_id UUID,
    p_forzar BOOLEAN DEFAULT FALSE
) RETURNS TABLE (
    exito BOOLEAN,
    mensaje TEXT,
    log_id UUID
) AS $$
DECLARE
    v_dia_actual INTEGER;
    v_es_sabado BOOLEAN;
    v_evaluacion RECORD;
    v_log_id UUID;
    v_solicitud RECORD;
BEGIN
    v_dia_actual := EXTRACT(DOW FROM NOW())::INTEGER;
    v_es_sabado := v_dia_actual = 6;

    -- Solo ejecutar en sábado o si se fuerza
    IF NOT v_es_sabado AND NOT p_forzar THEN
        RETURN QUERY SELECT FALSE, 'Auto-aprobación solo disponible los sábados'::TEXT, NULL::UUID;
        RETURN;
    END IF;

    -- Obtener datos de la solicitud
    SELECT * INTO v_solicitud FROM solicitudes WHERE id = p_solicitud_id AND tenant_id = p_tenant_id;

    IF v_solicitud IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Solicitud no encontrada'::TEXT, NULL::UUID;
        RETURN;
    END IF;

    IF v_solicitud.estado_aprobacion != 'pendiente_revision' THEN
        RETURN QUERY SELECT FALSE, 'Solicitud ya procesada'::TEXT, NULL::UUID;
        RETURN;
    END IF;

    -- Evaluar la solicitud
    SELECT * INTO v_evaluacion FROM evaluar_auto_aprobacion(p_tenant_id, p_solicitud_id);

    -- Registrar en log de auto-aprobaciones
    INSERT INTO auto_aprobaciones_log (
        tenant_id, solicitud_id, decision, motivo,
        confianza_promedio, productos_evaluados, productos_confiables, productos_nuevos,
        dia_semana, es_sabado
    ) VALUES (
        p_tenant_id, p_solicitud_id,
        CASE WHEN v_evaluacion.puede_aprobar THEN 'auto_aprobado' ELSE 'requiere_revision' END,
        v_evaluacion.motivo,
        v_evaluacion.confianza_promedio,
        v_evaluacion.productos_evaluados,
        v_evaluacion.productos_confiables,
        v_evaluacion.productos_nuevos,
        v_dia_actual, v_es_sabado
    ) RETURNING id INTO v_log_id;

    IF v_evaluacion.puede_aprobar THEN
        -- Auto-aprobar la solicitud
        UPDATE solicitudes SET
            estado_aprobacion = 'aprobado',
            comentario_jefe = '[IA] Auto-aprobado por sistema inteligente. ' || v_evaluacion.motivo,
            estado = 'Pendiente'
        WHERE id = p_solicitud_id;

        -- Registrar en log de aprobaciones normal
        INSERT INTO aprobaciones_log (
            solicitud_id, tenant_id, accion, usuario_email, usuario_rol, comentario
        ) VALUES (
            p_solicitud_id, p_tenant_id, 'AUTO_APROBADO',
            'IA-Sistema', 'sistema',
            'Auto-aprobado el sábado. Confianza: ' || ROUND(v_evaluacion.confianza_promedio, 1) || '%'
        );

        -- Crear notificación para farmacia
        INSERT INTO notificaciones_pendientes (
            tenant_id, rol_destino, tipo, titulo, mensaje, solicitud_id
        ) VALUES (
            p_tenant_id, 'farmacia', 'NUEVA_SOLICITUD',
            '[IA] Solicitud Auto-Aprobada',
            'Pedido #' || LEFT(p_solicitud_id::TEXT, 8) || ' aprobado automáticamente por IA',
            p_solicitud_id
        );

        RETURN QUERY SELECT TRUE, 'Solicitud auto-aprobada exitosamente'::TEXT, v_log_id;
    ELSE
        RETURN QUERY SELECT FALSE, v_evaluacion.motivo, v_log_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Obtener estadísticas de IA para dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION obtener_estadisticas_ia(p_tenant_id UUID)
RETURNS TABLE (
    total_productos_confiables INTEGER,
    promedio_confianza DECIMAL,
    auto_aprobaciones_totales INTEGER,
    auto_aprobaciones_mes INTEGER,
    tasa_exito DECIMAL,
    productos_top JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*)::INTEGER as total_confiables,
            COALESCE(AVG(nivel_confianza), 0) as avg_confianza
        FROM productos_confiables
        WHERE tenant_id = p_tenant_id AND nivel_confianza >= 70
    ),
    auto_stats AS (
        SELECT
            COUNT(*)::INTEGER as total_auto,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::INTEGER as auto_mes,
            (COUNT(*) FILTER (WHERE decision = 'auto_aprobado')::DECIMAL /
             NULLIF(COUNT(*)::DECIMAL, 0) * 100) as tasa
        FROM auto_aprobaciones_log
        WHERE tenant_id = p_tenant_id
    ),
    top_productos AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'codigo', producto_codigo,
                'descripcion', descripcion,
                'confianza', ROUND(nivel_confianza, 1),
                'veces_aprobado', veces_aprobado
            ) ORDER BY nivel_confianza DESC
        ) as top
        FROM (
            SELECT producto_codigo, descripcion, nivel_confianza, veces_aprobado
            FROM productos_confiables
            WHERE tenant_id = p_tenant_id AND nivel_confianza >= 70
            ORDER BY nivel_confianza DESC, veces_aprobado DESC
            LIMIT 10
        ) t
    )
    SELECT
        s.total_confiables,
        ROUND(s.avg_confianza, 1),
        a.total_auto,
        a.auto_mes,
        COALESCE(ROUND(a.tasa, 1), 0),
        COALESCE(t.top, '[]'::jsonb)
    FROM stats s, auto_stats a, top_productos t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permisos
GRANT EXECUTE ON FUNCTION actualizar_confianza_producto TO authenticated;
GRANT EXECUTE ON FUNCTION evaluar_auto_aprobacion TO authenticated;
GRANT EXECUTE ON FUNCTION ejecutar_auto_aprobacion TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_estadisticas_ia TO authenticated;
