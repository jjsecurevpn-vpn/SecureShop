-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 010_renovaciones
-- Fecha: 2024-12-16
-- Descripción: Tabla de renovaciones y upgrades
-- ============================================

-- ============================================
-- 1. TABLA DE RENOVACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS public.renovaciones (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'revendedor')),
  servex_id INTEGER NOT NULL,
  servex_username TEXT NOT NULL,
  operacion TEXT NOT NULL CHECK (operacion IN ('renovacion', 'upgrade')),
  dias_agregados INTEGER,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT NOT NULL DEFAULT 'mercadopago',
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  
  -- Cupones y descuentos
  cupon_id INTEGER REFERENCES public.cupones(id) ON DELETE SET NULL,
  cupon_codigo TEXT,
  descuento_aplicado DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_renovaciones_tipo ON public.renovaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_renovaciones_servex_id ON public.renovaciones(servex_id);
CREATE INDEX IF NOT EXISTS idx_renovaciones_username ON public.renovaciones(servex_username);
CREATE INDEX IF NOT EXISTS idx_renovaciones_email ON public.renovaciones(cliente_email);
CREATE INDEX IF NOT EXISTS idx_renovaciones_estado ON public.renovaciones(estado);
CREATE INDEX IF NOT EXISTS idx_renovaciones_mp_payment_id ON public.renovaciones(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_renovaciones_created_at ON public.renovaciones(created_at DESC);

-- ============================================
-- 2. RLS POLICIES
-- ============================================

ALTER TABLE public.renovaciones ENABLE ROW LEVEL SECURITY;

-- Service role tiene acceso completo
CREATE POLICY "Service role full access on renovaciones"
  ON public.renovaciones FOR ALL
  USING (auth.role() = 'service_role');

-- Usuarios autenticados pueden ver sus propias renovaciones
CREATE POLICY "Users can view own renewals"
  ON public.renovaciones FOR SELECT
  USING (cliente_email = auth.jwt()->>'email');

-- ============================================
-- 3. FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_renovaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_renovaciones_updated_at ON public.renovaciones;
CREATE TRIGGER trigger_renovaciones_updated_at
  BEFORE UPDATE ON public.renovaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_renovaciones_updated_at();

-- Función para obtener renovaciones pendientes antiguas (para auto-retry)
CREATE OR REPLACE FUNCTION public.obtener_renovaciones_pendientes(
  p_minutos_antiguedad INTEGER DEFAULT 5,
  p_limite INTEGER DEFAULT 10
)
RETURNS SETOF public.renovaciones AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.renovaciones
  WHERE estado = 'pendiente'
    AND updated_at <= NOW() - (p_minutos_antiguedad || ' minutes')::INTERVAL
  ORDER BY updated_at ASC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para estadísticas de renovaciones
CREATE OR REPLACE FUNCTION public.renovaciones_estadisticas(
  p_desde TIMESTAMPTZ DEFAULT NULL,
  p_hasta TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_renovaciones BIGINT,
  renovaciones_aprobadas BIGINT,
  renovaciones_pendientes BIGINT,
  monto_total DECIMAL,
  monto_aprobado DECIMAL,
  por_tipo JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE estado = 'aprobado')::BIGINT,
    COUNT(*) FILTER (WHERE estado = 'pendiente')::BIGINT,
    COALESCE(SUM(monto), 0)::DECIMAL,
    COALESCE(SUM(monto) FILTER (WHERE estado = 'aprobado'), 0)::DECIMAL,
    jsonb_build_object(
      'cliente', COUNT(*) FILTER (WHERE tipo = 'cliente'),
      'revendedor', COUNT(*) FILTER (WHERE tipo = 'revendedor')
    )
  FROM public.renovaciones
  WHERE 
    (p_desde IS NULL OR created_at >= p_desde)
    AND (p_hasta IS NULL OR created_at <= p_hasta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. GRANT PERMISOS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.renovaciones TO authenticated;
GRANT ALL ON public.renovaciones TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.renovaciones_id_seq TO service_role;

GRANT EXECUTE ON FUNCTION public.obtener_renovaciones_pendientes TO service_role;
GRANT EXECUTE ON FUNCTION public.renovaciones_estadisticas TO service_role;
