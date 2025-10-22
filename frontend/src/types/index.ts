export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo?: boolean;
  fecha_creacion?: string;
  popular?: boolean;
}

export interface PlanRevendedor {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number;
  account_type: 'validity' | 'credit';
  dias?: number;
  activo?: boolean;
  fecha_creacion?: string;
  popular?: boolean;
}

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
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CompraRequest {
  planId: number;
  clienteEmail: string;
  clienteNombre: string;
}

export interface CompraRevendedorRequest {
  planRevendedorId: number;
  clienteEmail: string;
  clienteNombre: string;
}

export interface CompraResponse {
  pago: Pago;
  linkPago: string;
}

export interface Usuario {
  id: number;
  username: string;
  category_id: number;
  connection_limit: number;
  duration: number;
  type: 'user' | 'test';
  observation?: string;
  v2ray_uuid?: string;
  owner_id?: number;
  created_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'suspended';
}
