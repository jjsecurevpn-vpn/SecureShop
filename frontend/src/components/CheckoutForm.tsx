import { forwardRef, useImperativeHandle, useRef } from "react";
import { Mail, User, Shield } from "lucide-react";
import CuponInput from "./CuponInput";
import { ValidacionCupon } from "../services/api.service";

export interface CheckoutFormRef {
  getNombre: () => string;
  getEmail: () => string;
  getCuponData: () => ValidacionCupon["cupon"] | null;
  getDescuento: () => number;
  validate: () => boolean;
}

interface CheckoutFormProps {
  planId: number;
  planPrecio: number;
  loading?: boolean;
  onCuponChange?: (descuento: number) => void;
}

/**
 * Formulario NO CONTROLADO - accede directamente al DOM.
 * NUNCA se re-renderiza después del primer montaje.
 * Los inputs mantienen su valor en el DOM, no en state.
 */
const CheckoutForm = forwardRef<CheckoutFormRef, CheckoutFormProps>(
  ({ planId, planPrecio, loading = false, onCuponChange }, ref) => {
    const nombreInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const errorNombreRef = useRef<HTMLParagraphElement>(null);
    const errorEmailRef = useRef<HTMLParagraphElement>(null);
    const cuponDataRef = useRef<ValidacionCupon["cupon"] | null>(null);
    const descuentoRef = useRef(0);

    console.log("[CheckoutForm] RENDER - esto NO debería aparecer en cada keystroke");

    // Exponer métodos al padre vía ref - acceden directamente al DOM
    useImperativeHandle(ref, () => ({
      getNombre: () => nombreInputRef.current?.value || "",
      getEmail: () => emailInputRef.current?.value || "",
      getCuponData: () => cuponDataRef.current,
      getDescuento: () => descuentoRef.current,
      validate: () => {
        const nombre = nombreInputRef.current?.value || "";
        const email = emailInputRef.current?.value || "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let valid = true;

        // Validar nombre
        if (!nombre.trim()) {
          if (errorNombreRef.current) {
            errorNombreRef.current.textContent = "Ingresa tu nombre";
            errorNombreRef.current.style.display = "block";
          }
          valid = false;
        } else {
          if (errorNombreRef.current) {
            errorNombreRef.current.style.display = "none";
          }
        }

        // Validar email
        if (!email.trim() || !emailRegex.test(email)) {
          if (errorEmailRef.current) {
            errorEmailRef.current.textContent = email.trim()
              ? "Email inválido"
              : "Ingresa tu email";
            errorEmailRef.current.style.display = "block";
          }
          valid = false;
        } else {
          if (errorEmailRef.current) {
            errorEmailRef.current.style.display = "none";
          }
        }

        return valid;
      },
    }));

    const handleCuponValidado = (descuento: number, cupon: ValidacionCupon["cupon"]) => {
      console.log("[CheckoutForm] Cupón aplicado:", descuento);
      cuponDataRef.current = cupon;
      descuentoRef.current = descuento;
      if (onCuponChange) {
        onCuponChange(descuento);
      }
    };

    const handleCuponRemovido = () => {
      console.log("[CheckoutForm] Cupón removido");
      cuponDataRef.current = null;
      descuentoRef.current = 0;
      if (onCuponChange) {
        onCuponChange(0);
      }
    };

    return (
      <form className="space-y-3">
        {/* Nombre - NO CONTROLADO */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Nombre completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              ref={nombreInputRef}
              type="text"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Juan Pérez"
            />
          </div>
          <p
            ref={errorNombreRef}
            className="text-red-400 text-xs mt-1.5 gap-1"
            style={{ display: "none" }}
          >
            <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
          </p>
        </div>

        {/* Email - NO CONTROLADO */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              ref={emailInputRef}
              type="email"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
          </div>
          <p
            ref={errorEmailRef}
            className="text-red-400 text-xs mt-1.5 gap-1"
            style={{ display: "none" }}
          >
            <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
          </p>
          <p className="text-neutral-500 text-xs mt-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Recibirás tus credenciales VPN en este email
          </p>
        </div>

        {/* Cupón */}
        <div>
          <CuponInput
            planId={planId}
            precioPlan={planPrecio}
            onCuponValidado={handleCuponValidado}
            onCuponRemovido={handleCuponRemovido}
            cuponActual={cuponDataRef.current}
            descuentoActual={descuentoRef.current}
            clienteEmail={emailInputRef.current?.value}
          />
        </div>
      </form>
    );
  }
);

CheckoutForm.displayName = "CheckoutForm";

export default CheckoutForm;
