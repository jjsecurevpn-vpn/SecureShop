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
import { PlanRevendedor } from "../../../types";
import { DIAS_POR_CREDITOS } from "../constants";
import { PasoRenovacion, RevendedorEncontrado } from "../types";

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
  planesCredit: PlanRevendedor[];
  planesValidity: PlanRevendedor[];
  onVerPlanes: () => void;
  onVolverBuscar: () => void;
  onProcesar: () => void;
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
  planesCredit,
  planesValidity,
  onVerPlanes,
  onVolverBuscar,
  onProcesar,
}: RenovacionPanelProps) {
  const tipoActual = revendedor?.datos.servex_account_type;
  const planesDisponibles = tipoSeleccionado === "credit" ? planesCredit : planesValidity;
  const fechaExpiracion = revendedor?.datos.expiration_date
    ? new Date(revendedor.datos.expiration_date)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-50">Renovar revendedor</h2>
          <p className="text-sm text-neutral-400 mt-2">
            {pasoRenovacion === "buscar"
              ? "Busca tu cuenta existente para renovar"
              : "Selecciona el plan y completa la información"}
          </p>
        </div>
        <button
          onClick={onVerPlanes}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          Ver todos los planes
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[
          { num: 1, label: "Buscar", paso: "buscar" as const },
          { num: 2, label: "Configurar", paso: "configurar" as const },
        ].map((step, idx) => (
          <div key={step.paso} className="flex items-center gap-4">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                pasoRenovacion === step.paso || (pasoRenovacion === "configurar" && idx === 0)
                  ? "bg-violet-600 text-white"
                  : "bg-neutral-800 text-neutral-500"
              }`}
            >
              {step.num}
            </div>
            <span
              className={`text-sm font-medium ${
                pasoRenovacion === step.paso
                  ? "text-neutral-50"
                  : "text-neutral-500"
              }`}
            >
              {step.label}
            </span>
            {idx === 0 && (
              <div className="w-8 h-px bg-neutral-800 ml-2" />
            )}
          </div>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Step 1: Search */}
      {pasoRenovacion === "buscar" && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-50 mb-3">
              Email o usuario registrado
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={busqueda}
                onChange={(event) => onBusquedaChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onBuscar();
                  }
                }}
                placeholder="ejemplo@email.com o usuario"
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                disabled={buscando}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Usa el mismo correo o usuario que registraste al comprar.
            </p>
          </div>

          <button
            onClick={onBuscar}
            disabled={buscando || !busqueda.trim()}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {buscando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar revendedor
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Configuration */}
      {pasoRenovacion === "configurar" && revendedor && (
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-neutral-50">Cuenta encontrada</p>
                <p className="text-neutral-400">
                  {revendedor.datos.servex_username} • {tipoActual === "credit" ? "Créditos" : "Validez"}
                </p>
                <div className="text-xs text-neutral-500 space-y-0.5 mt-2">
                  <p>Capacidad: {revendedor.datos.max_users} {tipoActual === "credit" ? "créditos" : "usuarios"}</p>
                  {fechaExpiracion && (
                    <p>Vence: {fechaExpiracion.toLocaleDateString("es-AR")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Renewal Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-50 mb-4">
              Tipo de renovación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => tipoActual === "validity" && onTipoChange("validity")}
                disabled={tipoActual !== "validity"}
                className={`p-4 rounded-lg border transition-all ${
                  tipoActual !== "validity"
                    ? "border-neutral-800/40 bg-neutral-900/40 cursor-not-allowed opacity-50"
                    : tipoSeleccionado === "validity"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800"
                }`}
              >
                <Calendar
                  className={`w-5 h-5 mb-2 ${
                    tipoSeleccionado === "validity" ? "text-violet-400" : "text-neutral-500"
                  }`}
                />
                <p className="text-sm font-semibold text-neutral-50">Validez</p>
                <p className="text-xs text-neutral-500 mt-1">Más días de acceso</p>
              </button>
              <button
                onClick={() => tipoActual === "credit" && onTipoChange("credit")}
                disabled={tipoActual !== "credit"}
                className={`p-4 rounded-lg border transition-all ${
                  tipoActual !== "credit"
                    ? "border-neutral-800/40 bg-neutral-900/40 cursor-not-allowed opacity-50"
                    : tipoSeleccionado === "credit"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800"
                }`}
              >
                <CreditCard
                  className={`w-5 h-5 mb-2 ${
                    tipoSeleccionado === "credit" ? "text-violet-400" : "text-neutral-500"
                  }`}
                />
                <p className="text-sm font-semibold text-neutral-50">Créditos</p>
                <p className="text-xs text-neutral-500 mt-1">Más créditos</p>
              </button>
            </div>
          </div>

          {/* Plans Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-50 mb-4">
              {tipoSeleccionado === "credit"
                ? "Selecciona cantidad de créditos"
                : "Selecciona paquete de usuarios"}
            </label>
            {planesDisponibles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {planesDisponibles.map((plan) => {
                  const diasPlan =
                    tipoSeleccionado === "credit" ? DIAS_POR_CREDITOS[plan.max_users] ?? 30 : 30;
                  const precioUnitario = Math.round(plan.precio / Math.max(plan.max_users, 1));
                  const esSeleccionado = cantidadSeleccionada === plan.max_users;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => onCantidadChange(plan.max_users)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        esSeleccionado
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800"
                      }`}
                    >
                      <p className="text-lg font-bold text-neutral-50">
                        {plan.max_users}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {tipoSeleccionado === "credit" ? "créditos" : "usuarios"}
                      </p>
                      {tipoSeleccionado === "credit" && (
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Aproximadamente {diasPlan} días
                        </p>
                      )}
                      <div className="mt-2 pt-2 border-t border-neutral-700/50">
                        <p className="text-sm font-semibold text-neutral-50">
                          ${plan.precio.toLocaleString("es-AR")}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          ${precioUnitario}/u
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-center text-sm text-neutral-500">
                No hay planes disponibles
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-neutral-50">
              Información de contacto
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(event) => onNombreChange(event.target.value)}
                  placeholder="Nombre del responsable"
                  className="w-full pl-11 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="email@empresa.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide">
              Resumen de renovación
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-neutral-500 mb-1">
                  {tipoSeleccionado === "credit" ? "Créditos" : "Usuarios"}
                </p>
                <p className="text-lg font-semibold text-neutral-50">{cantidadSeleccionada}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-1">Duración estimada</p>
                <p className="text-lg font-semibold text-neutral-50">{diasRenovacion} días</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-1">Por unidad</p>
                <p className="text-lg font-semibold text-neutral-50">
                  ${Math.round(precioRenovacion / Math.max(cantidadSeleccionada || 1, 1))}
                </p>
              </div>

              <div className="sm:col-span-3 h-px bg-neutral-800" />

              <div className="sm:col-span-3 flex justify-between items-end">
                <span className="text-neutral-400 font-medium">Monto total</span>
                <span className="text-3xl font-bold text-neutral-50">
                  ${precioRenovacion.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onVolverBuscar}
              className="flex-1 py-2.5 bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-medium rounded-lg transition-colors"
            >
              Buscar otro revendedor
            </button>
            <button
              onClick={onProcesar}
              disabled={!puedeProcesar || procesando}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
