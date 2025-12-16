-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 008_cupones
-- Fecha: 2024-12-16
-- Descripción: Tabla de cupones de descuento
-- ============================================

-- ============================================
-- 1. TABLA DE CUPONES
-- ============================================

CREATE TABLE IF NOT EXISTS public.cupones (
  id SERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('porcentaje', 'monto_fijo')),
  valor DECIMAL(10,2) NOT NULL,
  limite_uso INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  fecha_expiracion TIMESTAMPTZ,
  planes_aplicables JSONB,
  activo BOOLEAN DEFAULT TRUE,
  descripcion TEXT,
  -- Campos para tracking
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON public.cupones(codigo);
CREATE INDEX IF NOT EXISTS idx_cupones_activo ON public.cupones(activo);
CREATE INDEX IF NOT EXISTS idx_cupones_expiracion ON public.cupones(fecha_expiracion);

-- ============================================
-- 2. TABLA DE USO DE CUPONES (para tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS public.cupon_usos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cupon_id INTEGER REFERENCES public.cupones(id) ON DELETE SET NULL,
  usuario_email TEXT NOT NULL,
  pago_id TEXT,
  monto_original DECIMAL(10,2),
  descuento_aplicado DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas de abuso
CREATE INDEX IF NOT EXISTS idx_cupon_usos_cupon_id ON public.cupon_usos(cupon_id);
CREATE INDEX IF NOT EXISTS idx_cupon_usos_email ON public.cupon_usos(usuario_email);
CREATE INDEX IF NOT EXISTS idx_cupon_usos_cupon_email ON public.cupon_usos(cupon_id, usuario_email);

-- ============================================
-- 3. FUNCIÓN PARA VALIDAR CUPÓN
-- ============================================

CREATE OR REPLACE FUNCTION public.validar_cupon(
  p_codigo TEXT,
  p_plan_id INTEGER DEFAULT NULL,
  p_cliente_email TEXT DEFAULT NULL
)
RETURNS TABLE (
  valido BOOLEAN,
  mensaje TEXT,
  cupon_id INTEGER,
  tipo TEXT,
  valor DECIMAL,
  codigo TEXT
) AS $$
DECLARE
  v_cupon RECORD;
  v_usos_usuario INTEGER;
BEGIN
  -- Buscar cupón
  SELECT * INTO v_cupon
  FROM public.cupones c
  WHERE UPPER(c.codigo) = UPPER(p_codigo);

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Cupón no encontrado'::TEXT, NULL::INTEGER, NULL::TEXT, NULL::DECIMAL, NULL::TEXT;
    RETURN;
  END IF;

  -- Verificar si está activo
  IF NOT v_cupon.activo THEN
    RETURN QUERY SELECT FALSE, 'Cupón inactivo'::TEXT, NULL::INTEGER, NULL::TEXT, NULL::DECIMAL, NULL::TEXT;
    RETURN;
  END IF;

  -- Verificar expiración
  IF v_cupon.fecha_expiracion IS NOT NULL AND v_cupon.fecha_expiracion < NOW() THEN
    RETURN QUERY SELECT FALSE, 'Cupón expirado'::TEXT, NULL::INTEGER, NULL::TEXT, NULL::DECIMAL, NULL::TEXT;
    RETURN;
  END IF;

  -- Verificar límite de uso global
  IF v_cupon.limite_uso IS NOT NULL AND v_cupon.usos_actuales >= v_cupon.limite_uso THEN
    RETURN QUERY SELECT FALSE, 'Cupón agotado'::TEXT, NULL::INTEGER, NULL::TEXT, NULL::DECIMAL, NULL::TEXT;
    RETURN;
  END IF;

  -- Verificar uso por usuario (cupones de un solo uso por persona)
  IF p_cliente_email IS NOT NULL AND UPPER(v_cupon.codigo) = 'BIENVENIDO' THEN
    SELECT COUNT(*) INTO v_usos_usuario
    FROM public.cupon_usos
    WHERE cupon_id = v_cupon.id AND LOWER(usuario_email) = LOWER(p_cliente_email);
    
    IF v_usos_usuario > 0 THEN
      RETURN QUERY SELECT FALSE, 'Ya utilizaste el cupón de bienvenida'::TEXT, NULL::INTEGER, NULL::TEXT, NULL::DECIMAL, NULL::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Verificar planes aplicables
  IF v_cupon.planes_aplicables IS NOT NULL AND p_plan_id IS NOT NULL THEN
    IF NOT (v_cupon.planes_aplicables @> to_jsonb(p_plan_id)) THEN
      RETURN QUERY SELECT FALSE, 'Cupón no aplicable a este plan'::TEXT, NULL::INTEGER, NULL::TEXT, NULL::DECIMAL, NULL::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Cupón válido
  RETURN QUERY SELECT 
    TRUE, 
    'Cupón válido'::TEXT, 
    v_cupon.id, 
    v_cupon.tipo, 
    v_cupon.valor,
    v_cupon.codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. FUNCIÓN PARA APLICAR CUPÓN
-- ============================================

CREATE OR REPLACE FUNCTION public.aplicar_cupon(
  p_cupon_id INTEGER,
  p_usuario_email TEXT,
  p_pago_id TEXT,
  p_monto_original DECIMAL,
  p_descuento_aplicado DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_cupon RECORD;
  v_nuevos_usos INTEGER;
BEGIN
  -- Obtener cupón
  SELECT * INTO v_cupon FROM public.cupones WHERE id = p_cupon_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Incrementar usos
  v_nuevos_usos := COALESCE(v_cupon.usos_actuales, 0) + 1;
  
  -- Actualizar cupón
  UPDATE public.cupones
  SET 
    usos_actuales = v_nuevos_usos,
    activo = CASE 
      WHEN limite_uso IS NOT NULL AND v_nuevos_usos >= limite_uso THEN FALSE
      ELSE activo
    END,
    updated_at = NOW()
  WHERE id = p_cupon_id;

  -- Registrar uso
  INSERT INTO public.cupon_usos (
    cupon_id, usuario_email, pago_id, monto_original, descuento_aplicado
  ) VALUES (
    p_cupon_id, LOWER(p_usuario_email), p_pago_id, p_monto_original, p_descuento_aplicado
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNCIÓN PARA ESTADÍSTICAS
-- ============================================

CREATE OR REPLACE FUNCTION public.cupones_estadisticas()
RETURNS TABLE (
  total_cupones BIGINT,
  cupones_activos BIGINT,
  usos_totales BIGINT,
  cupones_expirados BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE activo = TRUE)::BIGINT,
    COALESCE(SUM(usos_actuales), 0)::BIGINT,
    COUNT(*) FILTER (WHERE fecha_expiracion < NOW() AND activo = TRUE)::BIGINT
  FROM public.cupones;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupon_usos ENABLE ROW LEVEL SECURITY;

-- Service role puede hacer todo
CREATE POLICY "Service role full access on cupones"
  ON public.cupones
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on cupon_usos"
  ON public.cupon_usos
  USING (auth.role() = 'service_role');

-- Usuarios anónimos pueden ver cupones activos (para validar)
CREATE POLICY "Anon can validate coupons"
  ON public.cupones FOR SELECT
  USING (activo = TRUE);

-- ============================================
-- 7. GRANT PERMISOS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.cupones TO anon, authenticated;
GRANT ALL ON public.cupones TO service_role;
GRANT ALL ON public.cupon_usos TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.cupones_id_seq TO service_role;

GRANT EXECUTE ON FUNCTION public.validar_cupon TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aplicar_cupon TO service_role;
GRANT EXECUTE ON FUNCTION public.cupones_estadisticas TO service_role;

-- ============================================
-- 8. TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_cupones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cupones_updated_at ON public.cupones;
CREATE TRIGGER trigger_cupones_updated_at
  BEFORE UPDATE ON public.cupones
  FOR EACH ROW EXECUTE FUNCTION public.update_cupones_updated_at();
