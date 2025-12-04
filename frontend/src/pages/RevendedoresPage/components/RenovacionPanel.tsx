import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  Search,
  User,
  ChevronRight,
} from "lucide-react";
import CuponInput from "../../../components/CuponInput";
import { Button } from "../../../components/Button";
import { ValidacionCupon } from "../../../services/api.service";
import { PlanRevendedor } from "../../../types";
import { DIAS_POR_CREDITOS } from "../constants";
import { PasoRenovacion, RevendedorEncontrado } from "../types";

type CuponAplicado = NonNullable<ValidacionCupon["cupon"]>;

type RenovacionPanelProps = {
  pasoRenovacion: PasoRenovacion;
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  onBuscar: () => void;
  buscando: boolean;
  error: string;
  revendedor: RevendedorEncontrado | null;
  tipoSeleccionado: "validity" | "credit";
  onTipoChange: (value: "validity" | "credit") => void;
  cantidadSeleccionada: number;
  onCantidadChange: (value: number) => void;
  nombre: string;
  onNombreChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  procesando: boolean;
  puedeProcesar: boolean;
  diasRenovacion: number;
  precioRenovacion: number;
  precioFinal: number;
  planesCredit: PlanRevendedor[];
  planesValidity: PlanRevendedor[];
  onVerPlanes: () => void;
  onVolverBuscar: () => void;
  onProcesar: () => void;
  planSeleccionado: PlanRevendedor | null;
  cuponActual: CuponAplicado | null;
  descuentoAplicado: number;
  onCuponValidado: (descuento: number, cupon: CuponAplicado) => void;
  onCuponRemovido: () => void;
};

export function RenovacionPanel({
  pasoRenovacion,
  busqueda,
  onBusquedaChange,
  onBuscar,
  buscando,
  error,
  revendedor,
  tipoSeleccionado,
  onTipoChange,
  cantidadSeleccionada,
  onCantidadChange,
  nombre,
  onNombreChange,
  email,
  onEmailChange,
  procesando,
  puedeProcesar,
  diasRenovacion,
  precioRenovacion,
  precioFinal,
  planesCredit,
  planesValidity,
  onVolverBuscar,
  onProcesar,
  planSeleccionado,
  cuponActual,
  descuentoAplicado,
  onCuponValidado,
  onCuponRemovido,
}: RenovacionPanelProps) {
  const tipoActual = revendedor?.datos.servex_account_type;
  const planesDisponibles = tipoSeleccionado === "credit" ? planesCredit : planesValidity;
  const fechaExpiracion = revendedor?.datos.expiration_date
    ? new Date(revendedor.datos.expiration_date)
    : null;
  const hayDescuento = Boolean(descuentoAplicado && descuentoAplicado > 0);

  return (
    <div className="space-y-4 md:space-y-6 xl:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Renovar revendedor</h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          {pasoRenovacion === "buscar"
            ? "Busca tu cuenta existente para renovarla"
            : "Completa la información y elige tu plan"}
        </p>
      </div>

      {/* Main Container - Centered */}
      <div className="mx-auto w-full max-w-2xl">
        {/* Left Column: Form */}
        <div className="space-y-4 md:space-y-5 xl:space-y-6">
          {/* Error State */}
          {error && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Step 1: Search */}
          {pasoRenovacion === "buscar" && (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-5 lg:p-6">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 sm:mb-5">
                Buscar tu cuenta
              </h3>

              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-gray-400" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(event) => onBusquedaChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          onBuscar();
                        }
                      }}
                      placeholder="Tu nombre de usuario"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg text-gray-900 placeholder-gray-400 transition-colors outline-none"
                      disabled={buscando}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 mt-1 sm:mt-2 lg:mt-3 xl:mt-4">
                    Ingresa el nombre de usuario de tu cuenta de revendedor.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={onBuscar}
                  disabled={buscando || !busqueda.trim()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {buscando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar cuenta
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}          {/* Step 2: Configuration */}
          {pasoRenovacion === "configurar" && revendedor && (
            <>
              {/* Account Info Card */}
              <div className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-7">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="font-semibold text-gray-900">✓ Cuenta encontrada</p>
                    <p className="text-gray-600">
                      {revendedor.datos.servex_username} • {tipoActual === "credit" ? "Créditos" : "Validez"}
                    </p>
                    {fechaExpiracion && (
                      <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 mt-2">
                        Vence el {fechaExpiracion.toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Renewal Type Selection */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                  Sistema de renovación
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
                  <button
                    onClick={() => tipoActual === "validity" && onTipoChange("validity")}
                    disabled={tipoActual !== "validity"}
                    className={`group p-3 sm:p-4 lg:p-5 xl:p-6 rounded-lg border-2 transition-all ${
                      tipoActual !== "validity"
                        ? "border-gray-200/40 bg-gray-50/40 cursor-not-allowed opacity-50"
                        : tipoSeleccionado === "validity"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Calendar
                      className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mb-2 ${
                        tipoSeleccionado === "validity" ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600"
                      }`}
                    />
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Validez</p>
                    <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">Días de acceso</p>
                  </button>
                  <button
                    onClick={() => tipoActual === "credit" && onTipoChange("credit")}
                    disabled={tipoActual !== "credit"}
                    className={`group p-3 sm:p-4 lg:p-5 xl:p-6 rounded-lg border-2 transition-all ${
                      tipoActual !== "credit"
                        ? "border-gray-200/40 bg-gray-50/40 cursor-not-allowed opacity-50"
                        : tipoSeleccionado === "credit"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard
                      className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mb-2 ${
                        tipoSeleccionado === "credit" ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600"
                      }`}
                    />
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Créditos</p>
                    <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">Más créditos</p>
                  </button>
                </div>
              </div>

              {/* Plans Selection */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                  {tipoSeleccionado === "credit"
                    ? "Selecciona cantidad de créditos"
                    : "Selecciona cantidad de usuarios"}
                </h3>
                {planesDisponibles.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
                    {planesDisponibles.map((plan) => {
                      const diasPlan =
                        tipoSeleccionado === "credit" ? DIAS_POR_CREDITOS[plan.max_users] ?? 30 : 30;
                      const esSeleccionado = cantidadSeleccionada === plan.max_users;

                      return (
                        <button
                          key={plan.id}
                          onClick={() => onCantidadChange(plan.max_users)}
                          className={`p-3 sm:p-4 lg:p-5 xl:p-6 rounded-lg border-2 transition-all text-left ${
                            esSeleccionado
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">{plan.max_users}</p>
                          <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">
                            {tipoSeleccionado === "credit" ? "créditos" : "usuarios"}
                          </p>
                          {tipoSeleccionado === "credit" && (
                            <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">
                              ≈ {diasPlan} días
                            </p>
                          )}
                          <div className="mt-2 sm:mt-3 lg:mt-4 xl:mt-5 pt-2 sm:pt-3 lg:pt-4 xl:pt-5 border-t border-gray-200/50">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">
                              ${plan.precio.toLocaleString("es-AR")}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-5 xl:p-6 text-center text-xs sm:text-sm text-gray-600">
                    No hay planes disponibles
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                  Información de contacto
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-gray-400" />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => onNombreChange(event.target.value)}
                      placeholder="Nombre del responsable"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg text-gray-900 placeholder-gray-400 transition-colors outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg text-gray-900 placeholder-gray-400 transition-colors outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                  Código de descuento
                </h3>
                <CuponInput
                  planId={planSeleccionado?.id}
                  precioPlan={precioRenovacion}
                  clienteEmail={email.trim()}
                  cuponActual={cuponActual || undefined}
                  descuentoActual={descuentoAplicado}
                  onCuponValidado={onCuponValidado}
                  onCuponRemovido={onCuponRemovido}
                />
              </div>

              {/* Action Buttons - Mobile */}
              <div className="lg:hidden flex flex-col gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onVolverBuscar}
                  fullWidthMobile
                >
                  Buscar otro
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onProcesar}
                  disabled={!puedeProcesar || procesando || precioFinal <= 0}
                  className="flex items-center justify-center gap-2"
                  fullWidthMobile
                >
                  {procesando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Continuar al pago
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Renewal Summary - Below Form */}
        {pasoRenovacion === "configurar" && revendedor && (
          <>
            {/* Renewal Summary */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5 sm:mb-6 lg:mb-7 xl:mb-8">
                  Resumen de renovación
                </h3>

                <div className="space-y-5 sm:space-y-6 lg:space-y-7 xl:space-y-8">
                  {/* Plan Details */}
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4 xl:space-y-5">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        {tipoSeleccionado === "credit" ? "Créditos" : "Usuarios"}
                      </span>
                      <span className="font-semibold text-gray-900">{cantidadSeleccionada}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Duración</span>
                      <span className="font-semibold text-gray-900">{diasRenovacion} días</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Precio por unidad</span>
                      <span className="font-semibold text-gray-900">
                        ${Math.round(precioRenovacion / Math.max(cantidadSeleccionada || 1, 1))}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* Pricing */}
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4 xl:space-y-5">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Subtotal</span>
                      <span className="text-gray-900">${precioRenovacion.toLocaleString("es-AR")}</span>
                    </div>

                    {hayDescuento && (
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-emerald-600">
                          Descuento {cuponActual?.codigo ? `(${cuponActual.codigo})` : ""}
                        </span>
                        <span className="text-emerald-600 font-medium">
                          -${descuentoAplicado.toLocaleString("es-AR")}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-gray-200" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 font-medium">Monto final</span>
                      <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-indigo-600">
                        ${precioFinal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 lg:pt-5 xl:pt-6 flex flex-col gap-1 sm:gap-2 lg:gap-3 xl:gap-4">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={onVolverBuscar}
                    >
                      Buscar otro
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onProcesar}
                      disabled={!puedeProcesar || procesando || precioFinal <= 0}
                      className="flex items-center justify-center gap-2"
                    >
                      {procesando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Ir al pago
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Security Info */}
                <div className="mt-5 sm:mt-6 lg:mt-7 xl:mt-8 pt-5 sm:pt-6 lg:pt-7 xl:pt-8 border-t border-gray-200">
                  <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 leading-relaxed">
                    🔒 <span className="text-gray-700 font-medium">Seguro y privado.</span> Procesado con MercadoPago encriptado.
                  </p>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
