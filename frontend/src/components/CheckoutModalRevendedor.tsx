import React, { useState } from "react";
import { PlanRevendedor, CompraRevendedorRequest } from "../types";
import { X, CreditCard, Shield, Loader2 } from "lucide-react";

interface CheckoutModalRevendedorProps {
  plan: PlanRevendedor | null;
  onClose: () => void;
  onConfirm: (data: CompraRevendedorRequest) => Promise<void>;
  loading: boolean;
}

const CheckoutModalRevendedor: React.FC<CheckoutModalRevendedorProps> = ({
  plan,
  onClose,
  onConfirm,
  loading,
}) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ nombre?: string; email?: string }>({});

  if (!plan) return null;

  const validar = (): boolean => {
    const newErrors: { nombre?: string; email?: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email inválido";
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
      <div className="bg-neutral-900 rounded-lg shadow-2xl max-w-md w-full max-h-[70vh] border border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-neutral-800 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-200">
                Completar compra
              </h2>
              <p className="text-xs text-neutral-500">Plan: {plan.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Plan Summary */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Total a pagar:</span>
              <span className="text-2xl font-bold text-purple-400">
                ${plan.precio.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.nombre
                    ? "border-red-500"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
                placeholder="Juan Pérez"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.email
                    ? "border-red-500"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
              <p className="text-neutral-500 text-xs mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Recibirás tus credenciales de revendedor en este email
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-neutral-300 font-semibold rounded-lg transition-colors border border-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>Ir a pagar</>
                )}
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-4 border-t border-neutral-800">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Pago seguro mediante MercadoPago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModalRevendedor;
