-- =====================================================
-- SISTEMA DE APRENDIZAJE AUTOMÁTICO - DialyStock
-- Captura silenciosa de eventos para análisis de patrones
-- =====================================================

-- Tabla principal de eventos (captura todo lo que pasa)
CREATE TABLE IF NOT EXISTS eventos_aprendizaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,

    -- Información del evento
    tipo_evento VARCHAR(50) NOT NULL, -- 'solicitud_creada', 'solicitud_completada', 'producto_agregado', etc.
    categoria VARCHAR(30), -- 'sala_hd', 'sala_pd', 'farmacia', 'jefe_hd', etc.

    -- Actor del evento
    usuario_id UUID,
    usuario_nombre VARCHAR(255),
    usuario_rol VARCHAR(50),

    -- Datos del evento (JSON flexible para cualquier dato)
    datos JSONB DEFAULT '{}',

    -- Contexto temporal (importante para patrones)
    hora_del_dia INTEGER, -- 0-23
    dia_semana INTEGER, -- 0=Domingo, 6=Sábado
    es_fin_semana BOOLEAN DEFAULT FALSE,

    -- Métricas calculadas
    tiempo_desde_ultimo_evento INTEGER, -- segundos desde último evento similar

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas de análisis
CREATE INDEX IF NOT EXISTS idx_eventos_tenant ON eventos_aprendizaje(tenant_id);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos_aprendizaje(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos_aprendizaje(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_usuario ON eventos_aprendizaje(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos_aprendizaje(created_at);
CREATE INDEX IF NOT EXISTS idx_eventos_hora ON eventos_aprendizaje(hora_del_dia);
CREATE INDEX IF NOT EXISTS idx_eventos_dia ON eventos_aprendizaje(dia_semana);

-- Tabla de patrones aprendidos (resumen de comportamiento)
CREATE TABLE IF NOT EXISTS patrones_aprendidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,

    -- Tipo de patrón
    tipo_patron VARCHAR(50) NOT NULL, -- 'frecuencia_pedidos', 'hora_pico', 'productos_juntos', etc.
    categoria VARCHAR(30),

    -- Descripción y datos del patrón
    descripcion TEXT,
    datos JSONB DEFAULT '{}',

    -- Métricas del patrón
    confianza DECIMAL(5,2) DEFAULT 0, -- 0-100% de confianza
    frecuencia INTEGER DEFAULT 0, -- veces que se ha visto
    ultima_ocurrencia TIMESTAMPTZ,

    -- Estado
    activo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patrones_tenant ON patrones_aprendidos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patrones_tipo ON patrones_aprendidos(tipo_patron);

-- Tabla de alertas inteligentes (generadas por el sistema)
CREATE TABLE IF NOT EXISTS alertas_inteligentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,

    -- Tipo y prioridad
    tipo_alerta VARCHAR(50) NOT NULL, -- 'sin_pedido_hoy', 'patron_inusual', 'producto_frecuente_faltante', etc.
    prioridad VARCHAR(20) DEFAULT 'media', -- 'baja', 'media', 'alta', 'critica'

    -- Destino de la alerta
    destinatario_rol VARCHAR(50), -- 'farmacia', 'jefe_hd', 'sala_hd', etc.
    destinatario_id UUID,

    -- Contenido
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    datos JSONB DEFAULT '{}',

    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    descartada BOOLEAN DEFAULT FALSE,
    accion_tomada VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_tenant ON alertas_inteligentes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alertas_destinatario ON alertas_inteligentes(destinatario_rol);
CREATE INDEX IF NOT EXISTS idx_alertas_leida ON alertas_inteligentes(leida);

-- RLS Policies
ALTER TABLE eventos_aprendizaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrones_aprendidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_inteligentes ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos (solo insertar, sin leer datos de otros)
CREATE POLICY "Usuarios pueden insertar eventos de su tenant"
ON eventos_aprendizaje FOR INSERT
WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Solo admins pueden leer eventos
CREATE POLICY "Admins pueden leer eventos"
ON eventos_aprendizaje FOR SELECT
USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Patrones
CREATE POLICY "Usuarios pueden ver patrones de su tenant"
ON patrones_aprendidos FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema puede gestionar patrones"
ON patrones_aprendidos FOR ALL
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Alertas
CREATE POLICY "Usuarios pueden ver alertas de su tenant"
ON alertas_inteligentes FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuarios pueden actualizar alertas"
ON alertas_inteligentes FOR UPDATE
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- FUNCIÓN: Registrar evento de aprendizaje
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_evento_aprendizaje(
    p_tenant_id UUID,
    p_tipo_evento VARCHAR(50),
    p_categoria VARCHAR(30),
    p_usuario_id UUID,
    p_usuario_nombre VARCHAR(255),
    p_usuario_rol VARCHAR(50),
    p_datos JSONB
) RETURNS UUID AS $$
DECLARE
    v_hora INTEGER;
    v_dia INTEGER;
    v_es_finde BOOLEAN;
    v_tiempo_desde_ultimo INTEGER;
    v_nuevo_id UUID;
BEGIN
    -- Calcular contexto temporal
    v_hora := EXTRACT(HOUR FROM NOW());
    v_dia := EXTRACT(DOW FROM NOW());
    v_es_finde := v_dia IN (0, 6);

    -- Calcular tiempo desde último evento similar
    SELECT EXTRACT(EPOCH FROM (NOW() - MAX(created_at)))::INTEGER
    INTO v_tiempo_desde_ultimo
    FROM eventos_aprendizaje
    WHERE tenant_id = p_tenant_id
      AND tipo_evento = p_tipo_evento
      AND categoria = p_categoria;

    -- Insertar evento
    INSERT INTO eventos_aprendizaje (
        tenant_id, tipo_evento, categoria,
        usuario_id, usuario_nombre, usuario_rol,
        datos, hora_del_dia, dia_semana, es_fin_semana,
        tiempo_desde_ultimo_evento
    ) VALUES (
        p_tenant_id, p_tipo_evento, p_categoria,
        p_usuario_id, p_usuario_nombre, p_usuario_rol,
        p_datos, v_hora, v_dia, v_es_finde,
        v_tiempo_desde_ultimo
    )
    RETURNING id INTO v_nuevo_id;

    RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Analizar patrones de pedidos
-- =====================================================
CREATE OR REPLACE FUNCTION analizar_patrones_pedidos(p_tenant_id UUID)
RETURNS TABLE (
    patron VARCHAR(100),
    descripcion TEXT,
    valor JSONB,
    confianza DECIMAL
) AS $$
BEGIN
    -- Patrón 1: Hora pico de pedidos
    RETURN QUERY
    SELECT
        'hora_pico'::VARCHAR(100) as patron,
        'Hora con más actividad de pedidos'::TEXT as descripcion,
        jsonb_build_object('hora', hora_del_dia, 'cantidad', COUNT(*)) as valor,
        (COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM eventos_aprendizaje WHERE tenant_id = p_tenant_id AND tipo_evento = 'solicitud_creada'), 0))::DECIMAL as confianza
    FROM eventos_aprendizaje
    WHERE tenant_id = p_tenant_id
      AND tipo_evento = 'solicitud_creada'
    GROUP BY hora_del_dia
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- Patrón 2: Día más activo
    RETURN QUERY
    SELECT
        'dia_mas_activo'::VARCHAR(100) as patron,
        'Día de la semana con más pedidos'::TEXT as descripcion,
        jsonb_build_object(
            'dia', CASE dia_semana
                WHEN 0 THEN 'Domingo'
                WHEN 1 THEN 'Lunes'
                WHEN 2 THEN 'Martes'
                WHEN 3 THEN 'Miércoles'
                WHEN 4 THEN 'Jueves'
                WHEN 5 THEN 'Viernes'
                WHEN 6 THEN 'Sábado'
            END,
            'cantidad', COUNT(*)
        ) as valor,
        (COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM eventos_aprendizaje WHERE tenant_id = p_tenant_id AND tipo_evento = 'solicitud_creada'), 0))::DECIMAL as confianza
    FROM eventos_aprendizaje
    WHERE tenant_id = p_tenant_id
      AND tipo_evento = 'solicitud_creada'
    GROUP BY dia_semana
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- Patrón 3: Frecuencia promedio entre pedidos (por categoría)
    RETURN QUERY
    SELECT
        'frecuencia_pedidos'::VARCHAR(100) as patron,
        'Tiempo promedio entre pedidos por área'::TEXT as descripcion,
        jsonb_build_object(
            'categoria', categoria,
            'promedio_horas', ROUND(AVG(tiempo_desde_ultimo_evento) / 3600.0, 1),
            'total_pedidos', COUNT(*)
        ) as valor,
        LEAST(COUNT(*) * 5, 100)::DECIMAL as confianza
    FROM eventos_aprendizaje
    WHERE tenant_id = p_tenant_id
      AND tipo_evento = 'solicitud_creada'
      AND tiempo_desde_ultimo_evento IS NOT NULL
    GROUP BY categoria;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Detectar anomalías (para alertas)
-- =====================================================
CREATE OR REPLACE FUNCTION detectar_anomalias(p_tenant_id UUID)
RETURNS TABLE (
    tipo_anomalia VARCHAR(100),
    descripcion TEXT,
    datos JSONB,
    prioridad VARCHAR(20)
) AS $$
DECLARE
    v_ultima_solicitud_hd TIMESTAMPTZ;
    v_promedio_frecuencia_hd INTERVAL;
BEGIN
    -- Anomalía 1: Sin pedidos de HD en tiempo inusual
    SELECT MAX(created_at) INTO v_ultima_solicitud_hd
    FROM eventos_aprendizaje
    WHERE tenant_id = p_tenant_id
      AND tipo_evento = 'solicitud_creada'
      AND categoria = 'sala_hd';

    -- Si han pasado más de 24 horas desde el último pedido de HD (en día laboral)
    IF v_ultima_solicitud_hd IS NOT NULL
       AND EXTRACT(DOW FROM NOW()) NOT IN (0, 6)
       AND NOW() - v_ultima_solicitud_hd > INTERVAL '24 hours' THEN
        RETURN QUERY SELECT
            'sin_pedido_hd'::VARCHAR(100),
            'Sala HD no ha realizado pedidos en más de 24 horas'::TEXT,
            jsonb_build_object(
                'ultimo_pedido', v_ultima_solicitud_hd,
                'horas_sin_pedido', EXTRACT(EPOCH FROM (NOW() - v_ultima_solicitud_hd)) / 3600
            ),
            'alta'::VARCHAR(20);
    END IF;

    -- Anomalía 2: Pedido fuera de horario habitual
    -- (Se detectaría comparando hora actual vs hora_pico histórica)

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permisos
GRANT EXECUTE ON FUNCTION registrar_evento_aprendizaje TO authenticated;
GRANT EXECUTE ON FUNCTION analizar_patrones_pedidos TO authenticated;
GRANT EXECUTE ON FUNCTION detectar_anomalias TO authenticated;
