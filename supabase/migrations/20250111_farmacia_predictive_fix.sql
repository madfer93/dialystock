-- =====================================================
-- FIX: Implementación de farmacia_alertas_predictivas
-- Requerida por el frontend de Farmacia para mostrar alertas reales
-- =====================================================

DROP FUNCTION IF EXISTS farmacia_alertas_predictivas(UUID);

CREATE OR REPLACE FUNCTION farmacia_alertas_predictivas(tenant_id UUID)
RETURNS TABLE (
    producto_codigo VARCHAR,
    descripcion VARCHAR,
    stock_actual INTEGER,
    consumo_diario DECIMAL,
    dias_restantes INTEGER,
    urgency VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.producto_codigo::VARCHAR,
        p.descripcion::VARCHAR,
        p.stock_actual,
        ROUND(p.consumo_promedio_semanal / 7, 2) as consumo_diario,
        p.dias_hasta_agotamiento as dias_restantes,
        CASE 
            WHEN p.dias_hasta_agotamiento <= 7 THEN 'critica'
            WHEN p.dias_hasta_agotamiento <= 14 THEN 'alta'
            ELSE 'media'
        END as urgency
    FROM predicciones_consumo p
    WHERE p.tenant_id = $1
    ORDER BY p.dias_hasta_agotamiento ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permisos
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO authenticated;
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO service_role;
