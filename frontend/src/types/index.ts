export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo?: boolean;
  avatarUrl?: string;
  fecha_creacion?: string;
  popular?: boolean;
}

export interface PlanRevendedor {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number;
  account_type: "validity" | "credit";
  dias?: number;
  activo?: boolean;
  avatarUrl?: string;
  fecha_creacion?: string;
  popular?: boolean;
}

export interface Pago {
  id: string;
  plan_id: number;
  monto: number;
  estado: "pendiente" | "aprobado" | "rechazado" | "cancelado";
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
  servex_creditos?: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Donacion {
  id: string;
  monto: number;
  estado: "pendiente" | "aprobado" | "rechazado" | "cancelado";
  metodo_pago: string;
  donante_email?: string;
  donante_nombre?: string;
  mensaje?: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  agradecimiento_enviado: boolean;
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
  codigoCupon?: string;
}

export interface CompraRevendedorRequest {
  planRevendedorId: number;
  clienteEmail: string;
  clienteNombre: string;
  codigoCupon?: string;
}

export interface CompraResponse {
  pago: Pago;
  linkPago: string;
  preferenceId: string;
}

export interface Usuario {
  id: number;
  username: string;
  category_id: number;
  connection_limit: number;
  duration: number;
  type: "user" | "test";
  observation?: string;
  v2ray_uuid?: string;
  owner_id?: number;
  created_at: string;
  expires_at: string;
  status: "active" | "expired" | "suspended";
}

export interface Cupon {
  id: number;
  codigo: string;
  tipo: "porcentaje" | "monto_fijo";
  valor: number;
  limite_uso?: number | null;
  usos_actuales?: number;
  fecha_expiracion?: string | null;
  activo: boolean;
  planes_aplicables?: number[];
  creado_en?: string;
  actualizado_en?: string;
}

export interface NoticiaConfig {
  enabled: boolean;
  version: string;
  ultima_actualizacion: string;
  aviso: {
    habilitado: boolean;
    texto: string;
    bgColor?: string;
    textColor?: string;
    subtitulo?: string;
    variant?: string;
    icon?: string;
  };
  _instrucciones?: Record<string, string>;
}

export interface RenovacionClienteRequest {
  busqueda: string;
  dias: number;
  precio?: number;
  clienteEmail: string;
  clienteNombre: string;
  nuevoConnectionLimit?: number;
  precioOriginal?: number;
  codigoCupon?: string;
  cuponId?: number;
  descuentoAplicado?: number;
  planId?: number;
}

export interface RenovacionRevendedorRequest {
  busqueda: string;
  dias: number;
  clienteEmail: string;
  clienteNombre: string;
  tipoRenovacion?: "validity" | "credit";
  cantidadSeleccionada?: number;
  precio?: number;
  precioOriginal?: number;
  codigoCupon?: string;
  cuponId?: number;
  descuentoAplicado?: number;
  planId?: number;
}

export interface RenovacionResponse {
  renovacion: {
    id: number;
    tipo: "cliente" | "revendedor";
    servex_username: string;
    dias_agregados: number;
    monto: number;
    operacion: string;
    datos_nuevos?: string | null;
    cupon_id?: number | null;
    descuento_aplicado?: number | null;
    [key: string]: any;
  };
  linkPago: string;
  descuentoAplicado?: number;
  cuponAplicado?: {
    id?: number;
    codigo: string;
    tipo: "porcentaje" | "monto_fijo";
    valor: number;
  } | null;
}

export type SponsorCategory = "empresa" | "persona";

export interface Sponsor {
  id: number;
  name: string;
  role: string;
  message: string;
  highlight: boolean;
  link?: string;
  avatarInitials: string;
  avatarClass: string;
  avatarUrl?: string;
  order: number;
  category: SponsorCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CrearSponsorPayload {
  name: string;
  role: string;
  message: string;
  highlight?: boolean;
  link?: string;
  avatarInitials: string;
  avatarClass: string;
  avatarUrl?: string;
  order?: number;
  category: SponsorCategory;
}

export type ActualizarSponsorPayload = Partial<CrearSponsorPayload>;
