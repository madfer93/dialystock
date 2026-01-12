-- =====================================================
-- RE-FIX TOTAL: farmacia_alertas_predictivas
-- Forzando tipos VARCHAR para evitar error 400
-- =====================================================

-- 1. Eliminar versiones anteriores de forma agresiva
-- Es necesario si los tipos de retorno cambiaron (VARCHAR vs TEXT)
DROP FUNCTION IF EXISTS farmacia_alertas_predictivas(UUID);
DROP FUNCTION IF EXISTS farmacia_alertas_predictivas(TEXT);

-- 2. Creación con tipos VARCHAR explícitos para mayor compatibilidad
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
    IF p_tenant_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        p.producto_codigo::VARCHAR,
        p.descripcion::VARCHAR,
        p.stock_actual::INTEGER,
        ROUND(COALESCE(p.consumo_promedio_semanal, 0) / 7, 2)::DECIMAL,
        COALESCE(p.dias_hasta_agotamiento, 0)::INTEGER,
        CASE 
            WHEN p.dias_hasta_agotamiento <= 7 THEN 'critica'::VARCHAR
            WHEN p.dias_hasta_agotamiento <= 14 THEN 'advertencia'::VARCHAR
            ELSE 'informativa'::VARCHAR
        END as urgency
    FROM predicciones_consumo p
    WHERE p.tenant_id = p_tenant_id
    ORDER BY p.dias_hasta_agotamiento ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Permisos universales
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO authenticated;
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO anon;
GRANT EXECUTE ON FUNCTION farmacia_alertas_predictivas TO service_role;
