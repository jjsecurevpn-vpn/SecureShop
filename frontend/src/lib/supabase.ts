import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
  keySet: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase URL o Anon Key no configurados. ' +
    'Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a tu archivo .env'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Tipos para la base de datos de Supabase
export interface Profile {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseHistory {
  id: string;
  user_id: string;
  tipo: 'plan' | 'renovacion' | 'revendedor';
  plan_nombre: string;
  monto: number;
  estado: string;
  servex_username: string | null;
  servex_password: string | null;
  servex_expiracion: string | null;
  servex_connection_limit: number | null;
  mp_payment_id: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      purchase_history: {
        Row: PurchaseHistory;
        Insert: Omit<PurchaseHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<PurchaseHistory, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
