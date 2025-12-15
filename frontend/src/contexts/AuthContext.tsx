import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, PurchaseHistory } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  purchaseHistory: PurchaseHistory[];
  loading: boolean;
  signUp: (email: string, password: string, nombre?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshPurchaseHistory: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar perfil del usuario
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Cargar historial de compras
  const fetchPurchaseHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchase history:', error);
        return;
      }

      setPurchaseHistory(data || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    }
  };

  // Refrescar historial de compras
  const refreshPurchaseHistory = async () => {
    if (user) {
      await fetchPurchaseHistory(user.id);
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPurchaseHistory(session.user.id);
      }
      
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
          await fetchPurchaseHistory(session.user.id);
        } else {
          setProfile(null);
          setPurchaseHistory([]);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Registrar usuario
  const signUp = async (email: string, password: string, nombre?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre || '',
        },
      },
    });

    return { error };
  };

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Iniciar sesión con Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/perfil`,
      },
    });

    return { error };
  };

  // Cerrar sesión
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPurchaseHistory([]);
  };

  // Actualizar perfil
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No hay usuario autenticado') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refrescar perfil
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    profile,
    purchaseHistory,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshPurchaseHistory,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
