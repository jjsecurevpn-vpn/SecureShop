-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 011_donaciones
-- Fecha: 2024-12-16
-- Descripción: Tabla de donaciones voluntarias
-- ============================================

-- ============================================
-- 1. TABLA DE DONACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS public.donaciones (
  id TEXT PRIMARY KEY,
  monto DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  metodo_pago TEXT NOT NULL DEFAULT 'mercadopago',
  donante_email TEXT,
  donante_nombre TEXT,
  mensaje TEXT,
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  agradecimiento_enviado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_donaciones_estado ON public.donaciones(estado);
CREATE INDEX IF NOT EXISTS idx_donaciones_mp_payment ON public.donaciones(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_donaciones_email ON public.donaciones(donante_email);
CREATE INDEX IF NOT EXISTS idx_donaciones_created_at ON public.donaciones(created_at DESC);

-- ============================================
-- 2. RLS POLICIES
-- ============================================

ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;

-- Service role tiene acceso completo
CREATE POLICY "Service role full access on donaciones"
  ON public.donaciones FOR ALL
  USING (auth.role() = 'service_role');

-- Usuarios autenticados pueden ver sus propias donaciones
CREATE POLICY "Users can view own donations"
  ON public.donaciones FOR SELECT
  USING (donante_email = auth.jwt()->>'email');

-- ============================================
-- 3. TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_donaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_donaciones_updated_at ON public.donaciones;
CREATE TRIGGER trigger_donaciones_updated_at
  BEFORE UPDATE ON public.donaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_donaciones_updated_at();

-- ============================================
-- 4. FUNCIÓN PARA ESTADÍSTICAS
-- ============================================

CREATE OR REPLACE FUNCTION public.donaciones_estadisticas(
  p_desde TIMESTAMPTZ DEFAULT NULL,
  p_hasta TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_donaciones BIGINT,
  donaciones_aprobadas BIGINT,
  monto_total DECIMAL,
  monto_aprobado DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE estado = 'aprobado')::BIGINT,
    COALESCE(SUM(monto), 0)::DECIMAL,
    COALESCE(SUM(monto) FILTER (WHERE estado = 'aprobado'), 0)::DECIMAL
  FROM public.donaciones
  WHERE 
    (p_desde IS NULL OR created_at >= p_desde)
    AND (p_hasta IS NULL OR created_at <= p_hasta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. GRANT PERMISOS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.donaciones TO authenticated;
GRANT ALL ON public.donaciones TO service_role;

GRANT EXECUTE ON FUNCTION public.donaciones_estadisticas TO service_role;
