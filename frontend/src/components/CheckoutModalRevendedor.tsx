import React, { useState } from 'react';
import { PlanRevendedor, CompraRevendedorRequest } from '../types';

interface CheckoutModalRevendedorProps {
  plan: PlanRevendedor | null;
  onClose: () => void;
  onConfirm: (data: CompraRevendedorRequest) => Promise<void>;
  loading: boolean;
}

const CheckoutModalRevendedor: React.FC<CheckoutModalRevendedorProps> = ({ plan, onClose, onConfirm, loading }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ nombre?: string; email?: string }>({});

  if (!plan) return null;

  const validar = (): boolean => {
    const newErrors: { nombre?: string; email?: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) return;

    await onConfirm({
      planRevendedorId: plan.id,
      clienteNombre: nombre,
      clienteEmail: email,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-purple-500/20">
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl pointer-events-none" />
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple-400 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 relative">
          <h2 className="text-2xl font-bold text-white mb-2">Completar compra</h2>
          <p className="text-gray-300">Plan seleccionado: <span className="text-purple-400 font-semibold">{plan.nombre}</span></p>
        </div>

        {/* Resumen */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 border border-purple-500/30 rounded-xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent" />
          <div className="flex justify-between items-center relative">
            <span className="text-gray-300 font-medium">Total a pagar:</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
              ${plan.precio} ARS
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.nombre ? 'border-red-500' : 'border-gray-700 hover:border-purple-500/50'
                }`}
                placeholder="Juan Pérez"
              />
              {errors.nombre && <p className="text-red-400 text-sm mt-2">{errors.nombre}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-700 hover:border-purple-500/50'
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
              <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Recibirás tus credenciales de revendedor en este email
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Procesando...' : 'Ir a pagar'}
            </button>
          </div>
        </form>

        {/* Nota de seguridad */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6 pt-6 border-t border-gray-700/50">
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Pago seguro mediante MercadoPago</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModalRevendedor;
