import { useState, useRef, useMemo, useCallback } from "react";
import { Plan, CompraRequest } from "../types";
import { useBodyOverflow } from "../hooks/useBodyOverflow";
import { X, Shield, Tag, Sparkles } from "lucide-react";
import CheckoutForm, { CheckoutFormRef } from "./CheckoutForm";
import MercadoPagoButton from "./MercadoPagoButton";
import { apiService } from "../services/api.service";

interface CheckoutModalProps {
  plan: Plan | null;
  onClose: () => void;
  onConfirm: (data: CompraRequest) => void;
  loading: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  onClose,
  onConfirm,
  loading,
}) => {
  const formRef = useRef<CheckoutFormRef>(null);
  const [descuentoVisual, setDescuentoVisual] = useState(0);

  // Bloquear scroll del body cuando el modal está abierto
  useBodyOverflow(plan !== null);

  console.log("[CheckoutModal] Renderizado - plan:", plan?.id, "descuentoVisual:", descuentoVisual, "plan object:", plan);

  // Función callback memoizada que NO cambia entre renders
  const handleMercadoPagoSubmit = useCallback(async (): Promise<string> => {
    console.log('[CheckoutModal] handleMercadoPagoSubmit EJECUTADO - esta función debería ser estable');

    if (!plan || !formRef.current) {
      console.error('[CheckoutModal] No hay plan o form ref');
      return '';
    }

    // Obtener valores del formulario via ref
    const nombre = formRef.current.getNombre();
    const email = formRef.current.getEmail();
    const cuponData = formRef.current.getCuponData();

    // Validar datos
    if (!nombre.trim()) {
      alert('Por favor ingresa tu nombre');
      throw new Error('Nombre requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      alert('Por favor ingresa un email válido');
      throw new Error('Email inválido');
    }

    try {
      const compraData = {
        planId: plan.id,
        clienteNombre: nombre,
        clienteEmail: email,
        codigoCupon: cuponData?.codigo,
      };

      console.log('[CheckoutModal] Creando preferencia...', compraData);
      const response = await apiService.comprarPlan(compraData);
      console.log('[CheckoutModal] Preferencia creada:', response.preferenceId);
      
      return response.preferenceId;
    } catch (error) {
      console.error('[CheckoutModal] Error:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
      throw error;
    }
  }, [plan]); // SOLO depende de plan

  // Memoizar la ref del callback - SIEMPRE la misma instancia
  const onSubmitRef = useMemo(() => {
    const ref = { current: handleMercadoPagoSubmit };
    console.log('[CheckoutModal] useMemo creó nueva ref del callback');
    return ref;
  }, [handleMercadoPagoSubmit]); // Depende de handleMercadoPagoSubmit

  const handleCuponChange = (descuento: number) => {
    console.log('[CheckoutModal] handleCuponChange llamado con descuento:', descuento);
    setDescuentoVisual(descuento);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    const nombre = formRef.current.getNombre();
    const email = formRef.current.getEmail();
    const cuponData = formRef.current.getCuponData();

    onConfirm({
      planId: plan?.id || 0,
      clienteNombre: nombre,
      clienteEmail: email,
      codigoCupon: cuponData?.codigo,
    });
  };

  if (!plan) return null;

  const precioFinal = plan.precio - descuentoVisual;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-24">
      <div className="bg-neutral-900 rounded-xl shadow-2xl max-w-lg w-full border border-neutral-800 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 overscroll-contain">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-violet-600/10 to-blue-600/10 border-b border-neutral-800 p-4">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-blue-500/5" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-100">Finalizar compra</h2>
                <p className="text-sm text-neutral-400 mt-0.5">Completa tus datos para continuar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Plan Card */}
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Plan Seleccionado</p>
                <h3 className="text-lg font-bold text-neutral-200">{plan.nombre}</h3>
              </div>
              <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                <span className="text-xs font-semibold text-violet-400">{plan.dias} días</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <div className="w-1 h-1 rounded-full bg-violet-400" />
                <span>{plan.connection_limit} {plan.connection_limit === 1 ? 'dispositivo' : 'dispositivos'} simultáneos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <div className="w-1 h-1 rounded-full bg-violet-400" />
                <span>Velocidad ilimitada</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <div className="w-1 h-1 rounded-full bg-violet-400" />
                <span>Activación instantánea</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-neutral-700 pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Subtotal</span>
                <span className="text-neutral-300 font-medium">${plan.precio.toLocaleString("es-AR")}</span>
              </div>
              {descuentoVisual > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Descuento
                  </span>
                  <span className="text-emerald-400 font-medium">-${descuentoVisual.toLocaleString("es-AR")}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-neutral-700">
                <span className="text-base font-semibold text-neutral-200">Total</span>
                <span className="text-2xl font-bold text-violet-400">${precioFinal.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>

          {/* Form - AISLADO del padre */}
          <CheckoutForm
            ref={formRef}
            planId={plan.id}
            planPrecio={plan.precio}
            loading={loading}
            onCuponChange={handleCuponChange}
          />

          {/* Actions */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 font-semibold rounded-xl transition-colors border border-neutral-700"
            >
              Cancelar
            </button>
            {/* MercadoPago button renderiza en el body */}
            <MercadoPagoButton onSubmitRef={onSubmitRef} />
            {/* Espaciador */}
            <div className="flex-1 h-12 md:h-auto" />
          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-neutral-800">
            <Shield className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-neutral-500">Pago seguro mediante <span className="text-neutral-400 font-medium">MercadoPago</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
