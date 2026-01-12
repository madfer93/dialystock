-- =====================================================
-- RE-FIX TOTAL v3: farmacia_alertas_predictivas
-- Usando TEXT universal para evitar error 42804
-- =====================================================

-- 1. Limpieza total
DROP FUNCTION IF EXISTS farmacia_alertas_predictivas(UUID);
DROP FUNCTION IF EXISTS farmacia_alertas_predictivas(TEXT);

-- 2. Creación con tipos TEXT (Postgres los prefiere para retornos de rpc)
CREATE OR REPLACE FUNCTION farmacia_alertas_predictivas(p_tenant_id UUID)
RETURNS TABLE (
    producto_codigo TEXT,
    descripcion TEXT,
    stock_actual INTEGER,
    consumo_diario DECIMAL,
    dias_restantes INTEGER,
    urgency TEXT
) AS $$
BEGIN
    IF p_tenant_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        p.producto_codigo::TEXT,
        p.descripcion::TEXT,
        p.stock_actual::INTEGER,
        ROUND(COALESCE(p.consumo_promedio_semanal, 0) / 7, 2)::DECIMAL,
        COALESCE(p.dias_hasta_agotamiento, 0)::INTEGER,
        CASE 
            WHEN p.dias_hasta_agotamiento <= 7 THEN 'critica'::TEXT
            WHEN p.dias_hasta_agotamiento <= 14 THEN 'advertencia'::TEXT
            ELSE 'informativa'::TEXT
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
