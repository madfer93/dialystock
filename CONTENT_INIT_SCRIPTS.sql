-- SCRIPT DE INICIALIZACIÓN DE CONTENIDO PROFESIONAL - DIALYSTOCK V4.0
-- Ejecutar este script en el Editor SQL de Supabase para poblar el CMS.

-- 1. Poblar Sección 'Sobre Nosotros' (Misión y Visión)
INSERT INTO public.app_settings (category, data)
VALUES ('nosotros', '{
    "mision": "Nuestra misión es liderar la transformación digital en el sector de la salud renal, integrando tecnología de precisión y prácticas sostenibles. Eliminamos la burocracia operativa para que las clínicas puedan centrarse exclusivamente en la excelencia del cuidado al paciente, garantizando una trazabilidad absoluta de cada insumo médico.",
    "vision": "DialyStock aspira a ser el estándar tecnológico global para la gestión de unidades renales en 2030. Nuestra meta es consolidar un ecosistema de salud inteligente que no solo optimice recursos, sino que también actúe como motor de cambio hacia una medicina 100% digital, transparente y respetuosa con el medio ambiente.",
    "paper_savings": "10.000 → 0",
    "time_saved": "+85%"
}')
ON CONFLICT (category) DO UPDATE SET data = EXCLUDED.data;

-- 2. Poblar Preguntas Frecuentes (FAQ)
INSERT INTO public.app_settings (category, data)
VALUES ('faq', '{
    "items": [
        {
            "q": "¿De qué manera DialyStock protege el medio ambiente?",
            "a": "Eliminando por completo la necesidad de formularios y registros físicos. Una clínica promedio ahorra hasta 10,000 hojas de papel al año mediante nuestra gestión digital de insumos y farmacia."
        },
        {
            "q": "¿Es compatible con cualquier centro de diálisis?",
            "a": "Sí, DialyStock V4.0 está diseñado modularmente para adaptarse a salas de Hemodiálisis, Diálisis Peritoneal y Farmacias Centrales, integrando todos los puntos de consumo en una sola plataforma."
        },
        {
            "q": "¿El personal médico necesita capacitación avanzada?",
            "a": "No. El sistema ha sido diseñado pensando en la agilidad de los enfermeros y auxiliares. La interfaz es intuitiva y permite realizar solicitudes de insumos o despachos en menos de 30 segundos."
        },
        {
            "q": "¿Qué nivel de seguridad ofrece para el control de stock?",
            "a": "Ofrecemos trazabilidad total mediante auditoría digital. Cada movimiento de inventario queda registrado con responsable, hora y fecha exacta, permitiendo auditorías precisas y sin errores manuales."
        },
        {
            "q": "¿Puedo personalizar mi logo y colores corporativos?",
            "a": "¡Absolutamente! A través de nuestro panel de Superadmin, puedes actualizar tu identidad visual, logo y enlaces de contacto para que la plataforma sea una extensión fiel de tu marca clínica."
        }
    ]
}')
ON CONFLICT (category) DO UPDATE SET data = EXCLUDED.data;

-- 3. Poblar Redes Sociales (Ejemplo base)
INSERT INTO public.app_settings (category, data)
VALUES ('social', '{
    "email": "soporte@dialystock.com",
    "github": "https://github.com/madfer93",
    "tiktok": "https://tiktok.com/@dialystock",
    "facebook": "https://facebook.com/dialystock",
    "whatsapp": "573000000000",
    "instagram": "https://instagram.com/dialystock"
}')
ON CONFLICT (category) DO UPDATE SET data = EXCLUDED.data;
