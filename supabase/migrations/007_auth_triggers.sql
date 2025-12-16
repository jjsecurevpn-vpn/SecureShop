-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 007_auth_triggers
-- Fecha: 2024-12-16
-- Descripción: Triggers para autenticación y perfiles
-- ============================================

-- ============================================
-- 1. FUNCIÓN PARA CREAR PERFIL AL REGISTRARSE
-- ============================================
-- Se ejecuta automáticamente cuando un usuario se registra

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
  attempts INT := 0;
BEGIN
  -- Generar código de referido desde el email
  base_code := UPPER(
    SUBSTRING(
      REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')
      FROM 1 FOR 8
    )
  );
  
  final_code := base_code;
  
  -- Verificar unicidad del código
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE referral_code = final_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists OR attempts >= 10;
    
    -- Agregar número aleatorio
    final_code := base_code || FLOOR(RANDOM() * 1000)::TEXT;
    attempts := attempts + 1;
  END LOOP;
  
  -- Fallback si aún existe
  IF code_exists THEN
    final_code := base_code || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
  END IF;
  
  -- Insertar perfil
  INSERT INTO public.profiles (
    id,
    email,
    nombre,
    telefono,
    saldo,
    referral_code,
    total_referrals,
    total_earned,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
    0,
    final_code,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre = COALESCE(NULLIF(EXCLUDED.nombre, ''), profiles.nombre),
    telefono = COALESCE(NULLIF(EXCLUDED.telefono, ''), profiles.telefono),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. TRIGGER PARA NUEVOS USUARIOS
-- ============================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. FUNCIÓN PARA INCREMENTAR CONTADOR DE REFERIDOS
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_referral_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_referrals = total_referrals + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. FUNCIÓN PARA ACTUALIZAR SALDO Y GANANCIAS
-- ============================================

CREATE OR REPLACE FUNCTION public.add_referral_earnings(
  user_id UUID,
  amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    saldo = saldo + amount,
    total_earned = total_earned + amount,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ASEGURAR COLUMNAS EN PROFILES
-- ============================================

-- Agregar columnas si no existen
DO $$
BEGIN
  -- Columna saldo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'saldo'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN saldo DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Columna referral_code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
  
  -- Columna referred_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referred_by UUID REFERENCES public.profiles(id);
  END IF;
  
  -- Columna total_referrals
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'total_referrals'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN total_referrals INTEGER DEFAULT 0;
  END IF;
  
  -- Columna total_earned
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'total_earned'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN total_earned DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles(LOWER(email));

-- ============================================
-- 7. RLS POLICIES PARA PROFILES
-- ============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Permitir búsqueda pública de códigos de referido
DROP POLICY IF EXISTS "Anyone can search referral codes" ON public.profiles;
CREATE POLICY "Anyone can search referral codes"
  ON public.profiles FOR SELECT
  USING (referral_code IS NOT NULL);

-- Política: Service role puede hacer todo
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access"
  ON public.profiles
  USING (auth.role() = 'service_role');

-- ============================================
-- 8. GRANT PERMISOS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_referral_count TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_referral_earnings TO authenticated, service_role;
