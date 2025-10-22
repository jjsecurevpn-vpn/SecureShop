// ============================================
// TIPOS PARA PLANES
// ============================================

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo: boolean;
  fecha_creacion: Date;
}

export interface CrearPlanInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo?: boolean;
}

// ============================================
// TIPOS PARA PLANES DE REVENDEDORES
// ============================================

export interface PlanRevendedor {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number; // Límite de usuarios o créditos
  account_type: 'validity' | 'credit'; // Tipo de cuenta
  dias?: number; // Solo para cuentas de validez
  activo: boolean;
  fecha_creacion: Date;
}

export interface CrearPlanRevendedorInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  max_users: number;
  account_type: 'validity' | 'credit';
  dias?: number;
  activo?: boolean;
}

export interface PlanRevendedorRow {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number;
  account_type: string;
  dias: number | null;
  activo: number;
  fecha_creacion: string;
}

// ============================================
// TIPOS PARA PAGOS
// ============================================

export interface Pago {
  id: string;
  plan_id: number;
  monto: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  servex_cuenta_id?: number;
  servex_username?: string;
  servex_password?: string;
  servex_categoria?: string;
  servex_expiracion?: string;
  servex_connection_limit?: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface CrearPagoInput {
  planId: number;
  clienteEmail: string;
  clienteNombre: string;
}

export interface PagoRevendedor {
  id: string;
  plan_revendedor_id: number;
  monto: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  servex_revendedor_id?: number;
  servex_username?: string;
  servex_password?: string;
  servex_max_users?: number;
  servex_account_type?: string;
  servex_expiracion?: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface CrearPagoRevendedorInput {
  planRevendedorId: number;
  clienteEmail: string;
  clienteNombre: string;
}

export interface PagoRevendedorRow {
  id: string;
  plan_revendedor_id: number;
  monto: number;
  estado: string;
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  servex_revendedor_id: number | null;
  servex_username: string | null;
  servex_password: string | null;
  servex_max_users: number | null;
  servex_account_type: string | null;
  servex_expiracion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ============================================
// TIPOS PARA SERVEX API
// ============================================

export interface ServexApiConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

export interface ClienteServex {
  username: string;
  password: string;
  category_id: number;
  connection_limit: number;
  duration: number;
  type: 'user' | 'test';
  observation?: string;
  v2ray_uuid?: string;
}

export interface ClienteCreado {
  id: number;
  username: string;
  password: string;
  category_id: number;
  connection_limit: number;
  expiration_date: string;
  type: string;
  status: string;
  observation?: string;
  v2ray_uuid?: string;
  created_at: string;
  updated_at?: string;
  owner_id?: number;
  owner_type?: string;
}

export interface ServexClienteResponse {
  message: string;
  client: ClienteCreado;
}

export interface CategoriaServex {
  id: number;
  name: string;
  description?: string;
  admin_id?: number;
  limiter_active: boolean;
  valid_until?: string; // Fecha de expiración en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
  is_expired?: boolean; // Indica si la categoría está expirada (calculado en el cliente)
}

export interface RevendedorServex {
  name: string;
  username: string;
  password: string;
  max_users: number; // Límite de usuarios o créditos
  account_type: 'validity' | 'credit';
  category_ids: number[]; // IDs de categorías permitidas
  expiration_date?: string; // Solo para cuentas de validez (YYYY-MM-DD)
  obs?: string;
}

export interface RevendedorCreado {
  id: number;
  name: string;
  username: string;
  max_users: number;
  account_type: string;
  expiration_date?: string;
  category_ids: number[];
  status: string;
  created_at: string;
  updated_at?: string;
  obs?: string;
}

export interface ServexRevendedorResponse {
  message: string;
  reseller: RevendedorCreado;
}

// ============================================
// TIPOS PARA MERCADOPAGO
// ============================================

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  webhookUrl: string;
  frontendUrl: string;
}

export interface PreferenciaMercadoPago {
  items: Array<{
    title: string;
    unit_price: number;
    quantity: number;
    currency_id: string;
  }>;
  payer: {
    email: string;
    name: string;
  };
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  notification_url: string;
}

export interface WebhookMercadoPago {
  type: string;
  data: {
    id: string;
  };
}

export interface PagoMercadoPago {
  id: string;
  status: 'pending' | 'approved' | 'in_process' | 'rejected' | 'cancelled';
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

// ============================================
// TIPOS PARA RESPUESTAS API
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// TIPOS PARA LA BASE DE DATOS
// ============================================

export interface PagoRow {
  id: string;
  plan_id: number;
  monto: number;
  estado: string;
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  servex_cuenta_id: number | null;
  servex_username: string | null;
  servex_password: string | null;
  servex_categoria: string | null;
  servex_expiracion: string | null;
  servex_connection_limit: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PlanRow {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo: number;
  fecha_creacion: string;
}

// ============================================
// TIPOS PARA CONFIGURACIÓN
// ============================================

export interface AppConfig {
  port: number;
  nodeEnv: string;
  servex: ServexApiConfig;
  mercadopago: MercadoPagoConfig;
  database: {
    path: string;
  };
  cors: {
    origin: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  logLevel: string;
}
