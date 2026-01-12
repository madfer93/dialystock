-- =====================================================
-- FINAL FIX: farmacia_alertas_predictivas
-- Asegura que la función maneje correctamente el tipo UUID
-- y devuelva los datos necesarios para el nuevo diseño.
-- =====================================================

-- 1. Limpieza total de versiones anteriores para evitar conflictos de firma
DROP FUNCTION IF EXISTS farmacia_alertas_predictivas(UUID);
DROP FUNCTION IF EXISTS farmacia_alertas_predictivas(TEXT);

-- 2. Creación de la función con firma clara (UUID)
CREATE OR REPLACE FUNCTION farmacia_alertas_predictivas(p_tenant_id UUID)
RETURNS TABLE (
    producto_codigo VARCHAR,
    descripcion VARCHAR,
    stock_actual INTEGER,
    consumo_diario DECIMAL,
    dias_restantes INTEGER,
    urgency VARCHAR
) AS $$
BEGIN
    -- Validar que el tenant_id no sea nulo
    IF p_tenant_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        p.producto_codigo::VARCHAR,
        p.descripcion::VARCHAR,
        p.stock_actual,
        ROUND(COALESCE(p.consumo_promedio_semanal, 0) / 7, 2) as consumo_diario,
        COALESCE(p.dias_hasta_agotamiento, 0) as dias_restantes,
        CASE 
            WHEN p.dias_hasta_agotamiento <= 7 THEN 'critica'
            WHEN p.dias_hasta_agotamiento <= 14 THEN 'advertencia'
            ELSE 'informativa'
        END as urgency
    FROM predicciones_consumo p
    WHERE p.tenant_id = p_tenant_id
    ORDER BY p.dias_hasta_agotamiento ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Permisos
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO authenticated;
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO anon;
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO service_role;
