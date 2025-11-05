import React from 'react';
import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  loading: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, loading }) => {
  const precioMensual = plan.dias === 365 ? (plan.precio / 12).toFixed(0) : plan.precio;
  const esAnual = plan.dias === 365;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-800/60 hover:border-purple-500/50 p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.nombre}</h3>
        <p className="text-gray-400 text-sm">{plan.descripcion}</p>
      </div>

      {/* Precio */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-purple-400">${precioMensual}</span>
          <span className="text-gray-300 ml-2">/mes</span>
        </div>
        {esAnual && (
          <p className="text-sm text-emerald-400 font-semibold mt-2">
            ${plan.precio} ARS al año (ahorras 2 meses)
          </p>
        )}
      </div>

      {/* Características */}
      <div className="flex-grow mb-6">
        <ul className="space-y-3">
          <li className="flex items-center text-gray-300">
            <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{plan.dias} días de acceso</span>
          </li>
          <li className="flex items-center text-gray-300">
            <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{plan.connection_limit} {plan.connection_limit === 1 ? 'conexión' : 'conexiones'} simultáneas</span>
          </li>
          <li className="flex items-center text-gray-300">
            <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Activación inmediata</span>
          </li>
          <li className="flex items-center text-gray-300">
            <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Soporte 24/7</span>
          </li>
        </ul>
      </div>

      {/* Botón */}
      <button
        onClick={() => onSelect(plan)}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
          loading
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5'
        }`}
      >
        {loading ? 'Procesando...' : 'Comprar Ahora'}
      </button>
    </div>
  );
};

export default PlanCard;
