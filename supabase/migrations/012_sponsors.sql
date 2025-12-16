-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 012_sponsors
-- Fecha: 2024-12-16
-- Descripción: Tabla de patrocinadores/testimonios
-- ============================================

-- ============================================
-- 1. TABLA DE SPONSORS
-- ============================================

CREATE TABLE IF NOT EXISTS public.sponsors (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('empresa', 'persona')),
  rol TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  avatar_class TEXT NOT NULL,
  avatar_url TEXT,
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_sponsors_destacado ON public.sponsors(destacado);
CREATE INDEX IF NOT EXISTS idx_sponsors_orden ON public.sponsors(orden DESC);
CREATE INDEX IF NOT EXISTS idx_sponsors_categoria ON public.sponsors(categoria);

-- ============================================
-- 2. RLS POLICIES
-- ============================================

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Service role tiene acceso completo
CREATE POLICY "Service role full access on sponsors"
  ON public.sponsors FOR ALL
  USING (auth.role() = 'service_role');

-- Todos pueden ver sponsors (son públicos)
CREATE POLICY "Public can view sponsors"
  ON public.sponsors FOR SELECT
  USING (true);

-- ============================================
-- 3. TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_sponsors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sponsors_updated_at ON public.sponsors;
CREATE TRIGGER trigger_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_sponsors_updated_at();

-- ============================================
-- 4. GRANT PERMISOS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.sponsors TO anon, authenticated;
GRANT ALL ON public.sponsors TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.sponsors_id_seq TO service_role;
