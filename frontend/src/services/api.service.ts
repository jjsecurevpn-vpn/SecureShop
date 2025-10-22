import axios, { AxiosInstance } from 'axios';
import { Plan, PlanRevendedor, Pago, CompraRequest, CompraRevendedorRequest, CompraResponse, ApiResponse, Usuario } from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || '/api';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[API Error]', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Obtiene la lista de planes disponibles
   */
  async obtenerPlanes(): Promise<Plan[]> {
    const response = await this.client.get<ApiResponse<Plan[]>>('/planes');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error obteniendo planes');
    }
    return response.data.data || [];
  }

  /**
   * Inicia el proceso de compra
   */
  async comprarPlan(data: CompraRequest): Promise<CompraResponse> {
    const response = await this.client.post<ApiResponse<CompraResponse>>('/comprar', data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error procesando compra');
    }
    return response.data.data!;
  }

  /**
   * Obtiene información de un pago
   */
  async obtenerPago(pagoId: string): Promise<Pago> {
    const response = await this.client.get<ApiResponse<Pago>>(`/pago/${pagoId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error obteniendo pago');
    }
    return response.data.data!;
  }

  /**
   * Obtiene la lista de planes de revendedores disponibles
   */
  async obtenerPlanesRevendedores(): Promise<PlanRevendedor[]> {
    const response = await this.client.get<ApiResponse<PlanRevendedor[]>>('/planes-revendedores');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error obteniendo planes de revendedores');
    }
    return response.data.data || [];
  }

  /**
   * Inicia el proceso de compra de plan de revendedor
   */
  async comprarPlanRevendedor(data: CompraRevendedorRequest): Promise<CompraResponse> {
    const response = await this.client.post<ApiResponse<CompraResponse>>('/comprar-revendedor', data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error procesando compra de revendedor');
    }
    return response.data.data!;
  }

  /**
   * Obtiene información de un pago de revendedor
   */
  async obtenerPagoRevendedor(pagoId: string): Promise<Pago> {
    const response = await this.client.get<ApiResponse<Pago>>(`/pago-revendedor/${pagoId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error obteniendo pago de revendedor');
    }
    return response.data.data!;
  }

  /**
   * Obtiene los últimos usuarios creados
   */
  async obtenerUltimosUsuarios(limit: number = 10): Promise<Usuario[]> {
    const response = await this.client.get<ApiResponse<Usuario[]>>(`/clients?limit=${limit}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error obteniendo últimos usuarios');
    }
    return response.data.data || [];
  }
}

export const apiService = new ApiService();
