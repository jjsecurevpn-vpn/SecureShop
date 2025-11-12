import { PlanRevendedor } from '../types';
import { Check, Users, Calendar, Zap } from 'lucide-react';

interface PlanRevendedorCardProps {
  plan: PlanRevendedor;
  onSelect: (plan: PlanRevendedor) => void;
}

export function PlanRevendedorCard({ plan, onSelect }: PlanRevendedorCardProps) {
  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const isValidity = plan.account_type === 'validity';
  const isCredit = plan.account_type === 'credit';

  return (
    <div
      className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20 ${
        plan.popular
          ? 'border-violet-500 shadow-lg shadow-violet-500/50'
          : 'border-gray-700 hover:border-violet-400'
      }`}
    >
      {/* Badge Popular */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
            MÁS POPULAR
          </span>
        </div>
      )}

      {/* Badge Tipo de Cuenta */}
      <div className="absolute -top-3 right-4">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg ${
            isValidity
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          }`}
        >
          {isValidity ? 'POR TIEMPO' : 'POR CRÉDITOS'}
        </span>
      </div>

      {/* Nombre */}
      <h3 className="text-2xl font-bold text-white mb-2 mt-4">{plan.nombre}</h3>

      {/* Descripción */}
      <p className="text-gray-400 text-sm mb-6">{plan.descripcion}</p>

      {/* Precio */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            {formatPrecio(plan.precio)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">Pago único</p>
      </div>

      {/* Características */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-300">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Users className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-sm">
            Hasta <strong className="text-white">{plan.max_users} usuarios</strong>
          </span>
        </div>

        {isValidity && plan.dias && (
          <div className="flex items-center gap-3 text-gray-300">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-sm">
              <strong className="text-white">{plan.dias} días</strong> de validez
            </span>
          </div>
        )}

        {isCredit && (
          <div className="flex items-center gap-3 text-gray-300">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <Zap className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-sm">
              <strong className="text-white">{plan.max_users} créditos</strong> disponibles
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-gray-300">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-sm">Panel de administración</span>
        </div>

        <div className="flex items-center gap-3 text-gray-300">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-sm">Soporte técnico</span>
        </div>

        <div className="flex items-center gap-3 text-gray-300">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-sm">Gestión de subcuentas</span>
        </div>
      </div>

      {/* Botón */}
      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
          plan.popular
            ? 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-lg shadow-violet-500/50'
            : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
        }`}
      >
        Contratar Plan
      </button>
    </div>
  );
}
