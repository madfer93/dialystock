-- =====================================================
-- SISTEMA DE IA MEJORADO v2.0 - DialyStock
-- Predicción de consumo, detección de anomalías, alertas proactivas
-- Feedback incorporado: alertas con 7 días de anticipación
-- =====================================================

-- =====================================================
-- TABLA: Predicciones de Consumo
-- Almacena predicciones futuras de consumo por producto
-- =====================================================
CREATE TABLE IF NOT EXISTS predicciones_consumo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    
    producto_codigo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    
    -- Datos de predicción
    consumo_promedio_semanal DECIMAL(10,2) DEFAULT 0,
    consumo_predicho_7dias DECIMAL(10,2) DEFAULT 0,
    consumo_predicho_14dias DECIMAL(10,2) DEFAULT 0,
    consumo_predicho_30dias DECIMAL(10,2) DEFAULT 0,
    
    -- Stock actual vs predicho
    stock_actual INTEGER DEFAULT 0,
    dias_hasta_agotamiento INTEGER DEFAULT 0,
    
    -- Metadata
    calculado_en TIMESTAMPTZ DEFAULT NOW(),
    proxima_actualizacion TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predicciones_tenant ON predicciones_consumo(tenant_id);
CREATE INDEX IF NOT EXISTS idx_predicciones_codigo ON predicciones_consumo(producto_codigo);
CREATE INDEX IF NOT EXISTS idx_predicciones_agotamiento ON predicciones_consumo(dias_hasta_agotamiento);

-- =====================================================
-- TABLA: Anomalías Detectadas
-- Detecta patrones anormales en el consumo y solicitudes
-- =====================================================
CREATE TABLE IF NOT EXISTS anomalias_detectadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    
    tipo VARCHAR(50) NOT NULL, -- 'consumo_alto', 'consumo_bajo', 'producto_nuevo', 'rechazo_multiple'
    severidad VARCHAR(20) NOT NULL, -- 'leve', 'moderada', 'critica'
    
    -- Contexto
    producto_codigo VARCHAR(50),
    solicitud_id UUID,
    area_origen VARCHAR(50),
    
    -- Detalles de la anomalía
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    valor_esperado DECIMAL(10,2),
    valor_real DECIMAL(10,2),
    desviacion_porcentaje DECIMAL(5,2),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'confirmada', 'falsa_alarma', 'resuelta'
    revisada_por VARCHAR(255),
    fecha_revision TIMESTAMPTZ,
    comentario_revision TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomalias_tenant ON anomalias_detectadas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_anomalias_estado ON anomalias_detectadas(estado);
CREATE INDEX IF NOT EXISTS idx_anomalias_severidad ON anomalias_detectadas(severidad);
CREATE INDEX IF NOT EXISTS idx_anomalias_fecha ON anomalias_detectadas(created_at DESC);

-- =====================================================
-- TABLA: Alertas Inteligentes
-- Sistema de alertas proactivas de la IA
-- Cambio crítico: alertas de stock 7 días antes (no 3)
-- =====================================================
CREATE TABLE IF NOT EXISTS alertas_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    
    tipo VARCHAR(50) NOT NULL, -- 'stock_critico_7dias', 'vencimiento_proximo', 'patron_consumo', 'producto_alto_rechazo'
    prioridad VARCHAR(20) NOT NULL, -- 'info', 'advertencia', 'critica'
    
    -- Contenido
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    recomendacion TEXT,
    
    -- Contexto
    producto_codigo VARCHAR(50),
    datos_contexto JSONB, -- Información adicional flexible
    
    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    fecha_leida TIMESTAMPTZ,
    leida_por VARCHAR(255),
    
    -- Auto-dismiss
    valida_hasta TIMESTAMPTZ, -- Se oculta automáticamente después de esta fecha
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_tenant ON alertas_ia(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_ia(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridad ON alertas_ia(prioridad);
CREATE INDEX IF NOT EXISTS idx_alertas_leida ON alertas_ia(leida);
CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON alertas_ia(created_at DESC);

-- =====================================================
-- TABLA: Recomendaciones de Compra
-- IA sugiere qué comprar, cuánto y cuándo
-- =====================================================
CREATE TABLE IF NOT EXISTS recomendaciones_compra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    
    producto_codigo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    
    -- Cálculos
    consumo_promedio_mensual DECIMAL(10,2),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo_configurado INTEGER DEFAULT 0,
    
    cantidad_sugerida INTEGER NOT NULL,
    motivo TEXT,
    urgencia VARCHAR(20) DEFAULT 'media', -- 'baja', 'media', 'alta'
    
    -- Fechas
    fecha_sugerida_pedido DATE,
    fecha_estimada_agotamiento DATE,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'rechazada', 'ejecutada'
    procesada_por VARCHAR(255),
    fecha_procesado TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recomendaciones_tenant ON recomendaciones_compra(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recomendaciones_estado ON recomendaciones_compra(estado);
CREATE INDEX IF NOT EXISTS idx_recomendaciones_urgencia ON recomendaciones_compra(urgencia);

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE predicciones_consumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalias_detectadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendaciones_compra ENABLE ROW LEVEL SECURITY;

-- Pol

íticas de lectura para todos
CREATE POLICY "Usuarios pueden ver predicciones de su tenant"
ON predicciones_consumo FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuarios pueden ver anomalías de su tenant"
ON anomalias_detectadas FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuarios pueden ver alertas de su tenant"
ON alertas_ia FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuarios pueden ver recomendaciones de su tenant"
ON recomendaciones_compra FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas de escritura (sistema y admins)
CREATE POLICY "Sistema puede gestionar predicciones"
ON predicciones_consumo FOR ALL
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema puede gestionar anomalías"
ON anomalias_detectadas FOR ALL
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema puede gestionar alertas"
ON alertas_ia FOR ALL
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema puede gestionar recomendaciones"
ON recomendaciones_compra FOR ALL
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- FUNCIÓN: Predecir Consumo de Producto
-- Calcula predicción basada en promedio móvil ponderado
-- =====================================================
DROP FUNCTION IF EXISTS predecir_consumo_producto(UUID, VARCHAR, INTEGER);
CREATE OR REPLACE FUNCTION predecir_consumo_producto(
    p_tenant_id UUID,
    p_producto_codigo VARCHAR(50),
    p_dias_futuro INTEGER DEFAULT 7
) RETURNS TABLE (
    consumo_predicho DECIMAL,
    dias_hasta_agotamiento INTEGER,
    stock_actual INTEGER,
    recomendacion TEXT
) AS $$
DECLARE
    v_consumo_promedio DECIMAL;
    v_stock_actual INTEGER;
    v_dias_agotamiento INTEGER;
    v_recomendacion TEXT;
BEGIN
    -- Calcular consumo promedio de los últimos 30 días
    SELECT AVG(cantidad_solicitada)::DECIMAL INTO v_consumo_promedio
    FROM solicitudes_items si
    JOIN solicitudes s ON s.id = si.solicitud_id
    WHERE s.tenant_id = p_tenant_id
      AND si.producto_codigo = p_producto_codigo
      AND s.created_at >= NOW() - INTERVAL '30 days';
    
    v_consumo_promedio := COALESCE(v_consumo_promedio, 0);
    
    -- Obtener stock actual (mock - en producción vendría de lotes)
    v_stock_actual := 50; -- MOCK: reemplazar con cálculo real de lotes
    
    -- Calcular días hasta agotamiento
    IF v_consumo_promedio > 0 THEN
        v_dias_agotamiento := FLOOR(v_stock_actual / v_consumo_promedio);
    ELSE
        v_dias_agotamiento := 999;
    END IF;
    
    -- Generar recomendación
    IF v_dias_agotamiento <= 7 THEN
        v_recomendacion := '🔴 CRÍTICO: Ordenar inmediatamente';
    ELSIF v_dias_agotamiento <= 14 THEN
        v_recomendacion := '🟡 ADVERTENCIA: Planificar pedido pronto';
    ELSE
        v_recomendacion := '🟢 OK: Stock suficiente';
    END IF;
    
    RETURN QUERY SELECT
        v_consumo_promedio * p_dias_futuro,
        v_dias_agotamiento,
        v_stock_actual,
        v_recomendacion;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Detectar Anomalías en Consumo
-- Analiza patrones y detecta desviaciones significativas
-- =====================================================
DROP FUNCTION IF EXISTS detectar_anomalias(UUID);
CREATE OR REPLACE FUNCTION detectar_anomalias(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_anomalias_creadas INTEGER := 0;
    v_producto RECORD;
    v_consumo_promedio DECIMAL;
    v_consumo_reciente DECIMAL;
    v_desviacion DECIMAL;
BEGIN
    -- Iterar sobre productos con actividad reciente
    FOR v_producto IN
        SELECT DISTINCT si.producto_codigo, si.descripcion
        FROM solicitudes_items si
        JOIN solicitudes s ON s.id = si.solicitud_id
        WHERE s.tenant_id = p_tenant_id
          AND s.created_at >= NOW() - INTERVAL '7 days'
    LOOP
        -- Calcular promedio histórico (últimos 90 días)
        SELECT AVG(cantidad_solicitada) INTO v_consumo_promedio
        FROM solicitudes_items si
        JOIN solicitudes s ON s.id = si.solicitud_id
        WHERE s.tenant_id = p_tenant_id
          AND si.producto_codigo = v_producto.producto_codigo
          AND s.created_at >= NOW() - INTERVAL '90 days'
          AND s.created_at < NOW() - INTERVAL '7 days';
        
        -- Calcular consumo reciente (últimos 7 días)
        SELECT AVG(cantidad_solicitada) INTO v_consumo_reciente
        FROM solicitudes_items si
        JOIN solicitudes s ON s.id = si.solicitud_id
        WHERE s.tenant_id = p_tenant_id
          AND si.producto_codigo = v_producto.producto_codigo
          AND s.created_at >= NOW() - INTERVAL '7 days';
        
        v_consumo_promedio := COALESCE(v_consumo_promedio, 0);
        v_consumo_reciente := COALESCE(v_consumo_reciente, 0);
        
        -- Calcular desviación porcentual
        IF v_consumo_promedio > 0 THEN
            v_desviacion := ((v_consumo_reciente - v_consumo_promedio) / v_consumo_promedio) * 100;
        ELSE
            v_desviacion := 0;
        END IF;
        
        -- Detectar consumo anormalmente alto (> 50% más)
        IF v_desviacion > 50 THEN
            INSERT INTO anomalias_detectadas (
                tenant_id, tipo, severidad, producto_codigo,
                titulo, descripcion, valor_esperado, valor_real, desviacion_porcentaje
            ) VALUES (
                p_tenant_id, 'consumo_alto', 'moderada', v_producto.producto_codigo,
                'Consumo elevado detectado',
                'El producto ' || v_producto.producto_codigo || ' tiene un consumo ' || ROUND(v_desviacion, 1) || '% mayor al promedio histórico',
                v_consumo_promedio, v_consumo_reciente, v_desviacion
            );
            v_anomalias_creadas := v_anomalias_creadas + 1;
        END IF;
        
        -- Detectar consumo anormalmente bajo (> 50% menos)
        IF v_desviacion < -50 AND v_consumo_promedio > 0 THEN
            INSERT INTO anomalias_detectadas (
                tenant_id, tipo, severidad, producto_codigo,
                titulo, descripcion, valor_esperado, valor_real, desviacion_porcentaje
            ) VALUES (
                p_tenant_id, 'consumo_bajo', 'leve', v_producto.producto_codigo,
                'Consumo reducido detectado',
                'El producto ' || v_producto.producto_codigo || ' tiene un consumo ' || ROUND(ABS(v_desviacion), 1) || '% menor al promedio histórico',
                v_consumo_promedio, v_consumo_reciente, v_desviacion
            );
            v_anomalias_creadas := v_anomalias_creadas + 1;
        END IF;
    END LOOP;
    
    RETURN v_anomalias_creadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Generar Alertas Proactivas
-- Crea alertas inteligentes con 7 días de anticipación
-- =====================================================
DROP FUNCTION IF EXISTS generar_alertas_proactivas(UUID);
CREATE OR REPLACE FUNCTION generar_alertas_proactivas(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_alertas_creadas INTEGER := 0;
    v_producto RECORD;
    v_prediccion RECORD;
BEGIN
    -- Obtener productos con stock crítico próximo (7 días)
    FOR v_producto IN
        SELECT DISTINCT si.producto_codigo, si.descripcion
        FROM solicitudes_items si
        JOIN solicitudes s ON s.id = si.solicitud_id
        WHERE s.tenant_id = p_tenant_id
    LOOP
        -- Obtener predicción
        SELECT * INTO v_prediccion
        FROM predecir_consumo_producto(p_tenant_id, v_producto.producto_codigo, 7);
        
        -- Alerta crítica: stock se agotará en 7 días o menos
        IF v_prediccion.dias_hasta_agotamiento <= 7 AND v_prediccion.dias_hasta_agotamiento > 0 THEN
            -- Verificar que no exista alerta similar reciente
            IF NOT EXISTS (
                SELECT 1 FROM alertas_ia
                WHERE tenant_id = p_tenant_id
                  AND producto_codigo = v_producto.producto_codigo
                  AND tipo = 'stock_critico_7dias'
                  AND created_at >= NOW() - INTERVAL '24 hours'
            ) THEN
                INSERT INTO alertas_ia (
                    tenant_id, tipo, prioridad, producto_codigo,
                    titulo, mensaje, recomendacion,
                    datos_contexto, valida_hasta
                ) VALUES (
                    p_tenant_id, 'stock_critico_7dias', 'critica', v_producto.producto_codigo,
                    '🔴 Stock Crítico: ' || v_producto.descripcion,
                    'El stock actual se agotará en aproximadamente ' || v_prediccion.dias_hasta_agotamiento || ' días según el patrón de consumo.',
                    'Recomendación: Ordenar ' || CEIL(v_prediccion.consumo_predicho * 4) || ' unidades para cubrir 4 semanas.',
                    jsonb_build_object(
                        'stock_actual', v_prediccion.stock_actual,
                        'consumo_diario', ROUND(v_prediccion.consumo_predicho / 7, 2),
                        'cantidad_sugerida_minima', CEIL(v_prediccion.consumo_predicho * 2)
                    ),
                    NOW() + INTERVAL '7 days'
                );
                v_alertas_creadas := v_alertas_creadas + 1;
            END IF;
        END IF;
    END LOOP;
    
    RETURN v_alertas_creadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Generar Recomendaciones de Compra
-- Calcula qué productos pedir y en qué cantidad
-- =====================================================
DROP FUNCTION IF EXISTS generar_recomendaciones_compra(UUID);
CREATE OR REPLACE FUNCTION generar_recomendaciones_compra(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_recomendaciones_creadas INTEGER := 0;
    v_producto RECORD;
    v_consumo_mensual DECIMAL;
    v_stock_min INTEGER;
    v_cantidad_sugerida INTEGER;
BEGIN
    -- Iterar sobre productos activos
    FOR v_producto IN
        SELECT DISTINCT p.codigo, p.descripcion, p.stock_min
        FROM productos p
        WHERE p.tenant_id = p_tenant_id
    LOOP
        -- Calcular consumo promedio mensual
        SELECT AVG(cantidad_solicitada) * 30 INTO v_consumo_mensual
        FROM solicitudes_items si
        JOIN solicitudes s ON s.id = si.solicitud_id
        WHERE s.tenant_id = p_tenant_id
          AND si.producto_codigo = v_producto.codigo
          AND s.created_at >= NOW() - INTERVAL '90 days';
        
        v_consumo_mensual := COALESCE(v_consumo_mensual, 0);
        v_stock_min := COALESCE(v_producto.stock_min, 10);
        
        -- Si el consumo mensual > stock mínimo, sugerir reposición
        IF v_consumo_mensual > v_stock_min THEN
            v_cantidad_sugerida := CEIL(v_consumo_mensual * 1.5); -- +50% de margen
            
            INSERT INTO recomendaciones_compra (
                tenant_id, producto_codigo, descripcion,
                consumo_promedio_mensual, stock_actual, stock_minimo_configurado,
                cantidad_sugerida, motivo, urgencia,
                fecha_sugerida_pedido, fecha_estimada_agotamiento
            ) VALUES (
                p_tenant_id, v_producto.codigo, v_producto.descripcion,
                v_consumo_mensual, 50, v_stock_min, -- MOCK stock_actual
                v_cantidad_sugerida,
                'Consumo mensual (' || ROUND(v_consumo_mensual) || ') supera stock mínimo configurado (' || v_stock_min || ')',
                CASE
                    WHEN v_consumo_mensual > v_stock_min * 2 THEN 'alta'
                    WHEN v_consumo_mensual > v_stock_min * 1.5 THEN 'media'
                    ELSE 'baja'
                END,
                NOW() + INTERVAL '3 days',
                NOW() + INTERVAL '14 days' -- MOCK
            );
            v_recomendaciones_creadas := v_recomendaciones_creadas + 1;
        END IF;
    END LOOP;
    
    RETURN v_recomendaciones_creadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Obtener Estadísticas IA Mejoradas
-- Incluye nuevas métricas de anomalías y alertas
-- =====================================================
DROP FUNCTION IF EXISTS obtener_estadisticas_ia_v2(UUID);
CREATE OR REPLACE FUNCTION obtener_estadisticas_ia_v2(p_tenant_id UUID)
RETURNS TABLE (
    total_productos_confiables INTEGER,
    promedio_confianza DECIMAL,
    auto_aprobaciones_totales INTEGER,
    auto_aprobaciones_mes INTEGER,
    tasa_exito DECIMAL,
    anomalias_pendientes INTEGER,
    alertas_criticas INTEGER,
    recomendaciones_pendientes INTEGER,
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
    anomalias_stats AS (
        SELECT COUNT(*)::INTEGER as anomalias
        FROM anomalias_detectadas
        WHERE tenant_id = p_tenant_id AND estado = 'pendiente'
    ),
    alertas_stats AS (
        SELECT COUNT(*)::INTEGER as alertas
        FROM alertas_ia
        WHERE tenant_id = p_tenant_id AND prioridad = 'critica' AND leida = FALSE
    ),
    recomendaciones_stats AS (
        SELECT COUNT(*)::INTEGER as recomendaciones
        FROM recomendaciones_compra
        WHERE tenant_id = p_tenant_id AND estado = 'pendiente'
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
        an.anomalias,
        al.alertas,
        r.recomendaciones,
        COALESCE(t.top, '[]'::jsonb)
    FROM stats s, auto_stats a, anomalias_stats an, alertas_stats al, recomendaciones_stats r, top_productos t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permisos
GRANT EXECUTE ON FUNCTION predecir_consumo_producto TO authenticated;
GRANT EXECUTE ON FUNCTION detectar_anomalias TO authenticated;
GRANT EXECUTE ON FUNCTION generar_alertas_proactivas TO authenticated;
GRANT EXECUTE ON FUNCTION generar_recomendaciones_compra TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_estadisticas_ia_v2 TO authenticated;
