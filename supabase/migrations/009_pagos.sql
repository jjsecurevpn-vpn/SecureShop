-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 009_pagos
-- Fecha: 2024-12-16
-- Descripción: Tabla de pagos y transacciones
-- ============================================

-- ============================================
-- 1. TABLA DE PLANES (necesaria para FK)
-- ============================================

CREATE TABLE IF NOT EXISTS public.planes (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  dias INTEGER NOT NULL,
  connection_limit INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planes_activo ON public.planes(activo);

-- ============================================
-- 2. TABLA DE PAGOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.pagos (
  id TEXT PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  metodo_pago TEXT NOT NULL DEFAULT 'mercadopago',
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  
  -- MercadoPago
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  
  -- Servex (cuenta creada)
  servex_cuenta_id INTEGER,
  servex_username TEXT,
  servex_password TEXT,
  servex_categoria TEXT,
  servex_expiracion TIMESTAMPTZ,
  servex_connection_limit INTEGER,
  
  -- Cupones y descuentos
  cupon_id INTEGER REFERENCES public.cupones(id) ON DELETE SET NULL,
  cupon_codigo TEXT,
  descuento_aplicado DECIMAL(10,2) DEFAULT 0,
  
  -- Referidos
  referido_codigo TEXT,
  referido_descuento DECIMAL(10,2) DEFAULT 0,
  saldo_usado DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata adicional (JSON)
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON public.pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_email ON public.pagos(cliente_email);
CREATE INDEX IF NOT EXISTS idx_pagos_mp_payment_id ON public.pagos(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_pagos_mp_preference_id ON public.pagos(mp_preference_id);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at ON public.pagos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pagos_plan_id ON public.pagos(plan_id);

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Service role tiene acceso completo
CREATE POLICY "Service role full access on planes"
  ON public.planes FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on pagos"
  ON public.pagos FOR ALL
  USING (auth.role() = 'service_role');

-- Usuarios autenticados pueden ver sus propios pagos
CREATE POLICY "Users can view own payments"
  ON public.pagos FOR SELECT
  USING (cliente_email = auth.jwt()->>'email');

-- Anónimos pueden ver planes activos
CREATE POLICY "Anon can view active plans"
  ON public.planes FOR SELECT
  USING (activo = TRUE);

-- ============================================
-- 4. FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_pagos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pagos_updated_at ON public.pagos;
CREATE TRIGGER trigger_pagos_updated_at
  BEFORE UPDATE ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.update_pagos_updated_at();

-- Función para obtener estadísticas de pagos
CREATE OR REPLACE FUNCTION public.pagos_estadisticas(
  p_desde TIMESTAMPTZ DEFAULT NULL,
  p_hasta TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_pagos BIGINT,
  pagos_aprobados BIGINT,
  pagos_pendientes BIGINT,
  monto_total DECIMAL,
  monto_aprobado DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE estado = 'aprobado')::BIGINT,
    COUNT(*) FILTER (WHERE estado = 'pendiente')::BIGINT,
    COALESCE(SUM(monto), 0)::DECIMAL,
    COALESCE(SUM(monto) FILTER (WHERE estado = 'aprobado'), 0)::DECIMAL
  FROM public.pagos
  WHERE 
    (p_desde IS NULL OR created_at >= p_desde)
    AND (p_hasta IS NULL OR created_at <= p_hasta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. GRANT PERMISOS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.planes TO anon, authenticated;
GRANT ALL ON public.planes TO service_role;
GRANT SELECT ON public.pagos TO authenticated;
GRANT ALL ON public.pagos TO service_role;

GRANT EXECUTE ON FUNCTION public.pagos_estadisticas TO service_role;

-- ============================================
-- 6. INSERTAR PLANES INICIALES
-- ============================================

INSERT INTO public.planes (id, nombre, descripcion, precio, dias, connection_limit, activo)
VALUES
  -- Planes de 3 días
  (33, 'Plan Básico 3D (1 dispositivo - 3 días)', 'VPN básico para probar', 2000, 3, 1, TRUE),
  (34, 'Plan Doble 3D (2 dispositivos - 3 días)', 'VPN para 2 dispositivos', 3000, 3, 2, TRUE),
  (35, 'Plan Triple 3D (3 dispositivos - 3 días)', 'VPN para 3 dispositivos', 4500, 3, 3, TRUE),
  (36, 'Plan Familiar 3D (4 dispositivos - 3 días)', 'VPN para toda la familia', 5500, 3, 4, TRUE),
  
  -- Planes de 7 días
  (21, 'Plan Básico 7D (1 dispositivo - 7 días)', 'VPN básico semanal', 4000, 7, 1, TRUE),
  (22, 'Plan Doble 7D (2 dispositivos - 7 días)', 'VPN para 2 dispositivos', 6000, 7, 2, TRUE),
  (23, 'Plan Triple 7D (3 dispositivos - 7 días)', 'VPN para 3 dispositivos', 9000, 7, 3, TRUE),
  (24, 'Plan Familiar 7D (4 dispositivos - 7 días)', 'VPN para toda la familia', 11000, 7, 4, TRUE),
  
  -- Planes de 15 días
  (25, 'Plan Básico 15D (1 dispositivo - 15 días)', 'VPN básico quincenal', 6000, 15, 1, TRUE),
  (26, 'Plan Doble 15D (2 dispositivos - 15 días)', 'VPN para 2 dispositivos', 9000, 15, 2, TRUE),
  (27, 'Plan Triple 15D (3 dispositivos - 15 días)', 'VPN para 3 dispositivos', 12000, 15, 3, TRUE),
  (28, 'Plan Familiar 15D (4 dispositivos - 15 días)', 'VPN para toda la familia', 15000, 15, 4, TRUE),
  
  -- Planes de 20 días
  (37, 'Plan Básico 20D (1 dispositivo - 20 días)', 'VPN básico 20 días', 6500, 20, 1, TRUE),
  (38, 'Plan Doble 20D (2 dispositivos - 20 días)', 'VPN para 2 dispositivos', 9500, 20, 2, TRUE),
  (39, 'Plan Triple 20D (3 dispositivos - 20 días)', 'VPN para 3 dispositivos', 12500, 20, 3, TRUE),
  (40, 'Plan Familiar 20D (4 dispositivos - 20 días)', 'VPN para toda la familia', 15500, 20, 4, TRUE),
  
  -- Planes de 25 días
  (41, 'Plan Básico 25D (1 dispositivo - 25 días)', 'VPN básico 25 días', 7000, 25, 1, TRUE),
  (42, 'Plan Doble 25D (2 dispositivos - 25 días)', 'VPN para 2 dispositivos', 10000, 25, 2, TRUE),
  (43, 'Plan Triple 25D (3 dispositivos - 25 días)', 'VPN para 3 dispositivos', 13000, 25, 3, TRUE),
  (44, 'Plan Familiar 25D (4 dispositivos - 25 días)', 'VPN para toda la familia', 16000, 25, 4, TRUE),
  
  -- Planes de 30 días
  (29, 'Plan Básico 30D (1 dispositivo - 30 días)', 'VPN básico mensual', 8000, 30, 1, TRUE),
  (30, 'Plan Doble 30D (2 dispositivos - 30 días)', 'VPN para 2 dispositivos', 12000, 30, 2, TRUE),
  (31, 'Plan Triple 30D (3 dispositivos - 30 días)', 'VPN para 3 dispositivos', 15000, 30, 3, TRUE),
  (32, 'Plan Familiar 30D (4 dispositivos - 30 días)', 'VPN para toda la familia', 18000, 30, 4, TRUE)
ON CONFLICT (id) DO NOTHING;
