import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import {
  DIAS_RENOVACION,
  DISPOSITIVOS_RENOVACION,
  PRECIOS_POR_DIA,
} from "../constants";
import { CuentaRenovacion, PasoRenovacion } from "../types";
import CuponInput from "../../../components/CuponInput";
import type { ValidacionCupon } from "../../../services/api.service";

interface RenovacionPanelProps {
  pasoRenovacion: PasoRenovacion;
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  onBuscarCuenta: () => void;
  buscando: boolean;
  error: string;
  cuenta: CuentaRenovacion | null;
  dias: number;
  onDiasChange: (value: number) => void;
  dispositivosSeleccionados: number | null;
  onDispositivosChange: (value: number | null) => void;
  nombre: string;
  onNombreChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  puedeProcesar: boolean;
  procesando: boolean;
  onProcesar: () => void;
  onCancelar: () => void;
  onVolverBuscar: () => void;
  connectionActual: number;
  connectionDestino: number;
  precioBase: number;
  precioTotal: number;
  precioPorDia: number;
  precioPorDiaBase: number;
  descuentoAplicado: number;
  cuponActual: ValidacionCupon["cupon"] | null;
  onCuponAplicado: (descuento: number, cuponData: ValidacionCupon["cupon"]) => void;
  onCuponRemovido: () => void;
  planId?: number;
}

export function RenovacionPanel({
  pasoRenovacion,
  busqueda,
  onBusquedaChange,
  onBuscarCuenta,
  buscando,
  error,
  cuenta,
  dias,
  onDiasChange,
  dispositivosSeleccionados,
  onDispositivosChange,
  nombre,
  onNombreChange,
  email,
  onEmailChange,
  puedeProcesar,
  procesando,
  onProcesar,
  onCancelar,
  onVolverBuscar,
  connectionActual,
  connectionDestino,
  precioBase,
  precioTotal,
  precioPorDia,
  precioPorDiaBase,
  descuentoAplicado,
  cuponActual,
  onCuponAplicado,
  onCuponRemovido,
  planId,
}: RenovacionPanelProps) {
  const handleBuscar = () => {
    if (!buscando) {
      onBuscarCuenta();
    }
  };

  const hayDescuento = descuentoAplicado > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-50">Renovar plan</h2>
          <p className="text-sm text-neutral-400 mt-2">
            {pasoRenovacion === "buscar"
              ? "Busca tu cuenta existente para renovar"
              : "Personaliza tu renovación antes de confirmar"}
          </p>
        </div>
        <div className="flex gap-2">
          {pasoRenovacion === "configurar" && (
            <button
              onClick={onVolverBuscar}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Buscar otra
            </button>
          )}
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
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
                    handleBuscar();
                  }
                }}
                placeholder="ejemplo@email.com o usuario"
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                disabled={buscando}
              />
            </div>
          </div>

          <button
            onClick={handleBuscar}
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
                Buscar cuenta
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Configuration */}
      {pasoRenovacion === "configurar" && cuenta && (
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-neutral-50">Cuenta encontrada</p>
                <p className="text-neutral-400">
                  {cuenta.tipo === "cliente" ? "VPN" : "Revendedor"} • {cuenta.datos.servex_username}
                </p>
                {cuenta.datos.plan_nombre && (
                  <p className="text-neutral-500 text-xs">
                    Plan actual: <span className="text-neutral-400">{cuenta.datos.plan_nombre}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Content */}
          <div className="space-y-6">
            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-neutral-50 mb-4">
                Días a agregar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {DIAS_RENOVACION.map((opcionDias) => (
                  <button
                    key={opcionDias}
                    onClick={() => onDiasChange(opcionDias)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                      dias === opcionDias
                        ? "bg-violet-600 text-white"
                        : "bg-neutral-800/50 border border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    {opcionDias}d
                  </button>
                ))}
              </div>
            </div>

            {/* Devices - Only for clients */}
            {cuenta.tipo === "cliente" && (
              <div>
                <label className="block text-sm font-semibold text-neutral-50 mb-4">
                  Dispositivos simultáneos
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {DISPOSITIVOS_RENOVACION.map((dispositivos) => {
                    const esActual = dispositivos === connectionActual;
                    const esSeleccionado = dispositivosSeleccionados === dispositivos;
                    return (
                      <button
                        key={dispositivos}
                        onClick={() => onDispositivosChange(dispositivos)}
                        className={`relative p-3 rounded-lg border transition-all ${
                          esSeleccionado
                            ? "border-violet-500 bg-violet-500/10"
                            : esActual
                            ? "border-violet-500/30 bg-violet-500/5"
                            : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800"
                        }`}
                      >
                        {esActual && !esSeleccionado && (
                          <span className="absolute -top-2 -right-2 bg-neutral-700 text-neutral-200 text-[10px] px-2 py-0.5 rounded-full">
                            Actual
                          </span>
                        )}
                        {esSeleccionado && (
                          <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                            Nuevo
                          </span>
                        )}
                        <p className="text-lg font-bold text-neutral-50">{dispositivos}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          ${PRECIOS_POR_DIA[dispositivos] ?? PRECIOS_POR_DIA[1]}/día
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-50 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(event) => onNombreChange(event.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-50 mb-2">
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {cuenta.tipo === "cliente" && (
            <CuponInput
              planId={planId}
              precioPlan={precioBase}
              onCuponValidado={onCuponAplicado}
              onCuponRemovido={onCuponRemovido}
              cuponActual={cuponActual}
              descuentoActual={descuentoAplicado}
              clienteEmail={email}
            />
          )}

          {/* Summary Card - Bottom */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide">
              Resumen de tu renovación
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Duración</p>
                <p className="text-lg font-semibold text-neutral-50">{dias} días</p>
              </div>

              {cuenta.tipo === "cliente" && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Dispositivos</p>
                  <div className="flex items-baseline gap-2">
                    {connectionDestino !== connectionActual && (
                      <span className="text-xs text-neutral-400 line-through">{connectionActual}</span>
                    )}
                    <p className="text-lg font-semibold text-neutral-50">{connectionDestino}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-neutral-500 mb-1">Por día</p>
                {hayDescuento ? (
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-semibold text-neutral-50">
                      ${precioPorDia.toLocaleString("es-AR")}
                    </span>
                    <span className="text-xs text-neutral-500 line-through">
                      ${precioPorDiaBase.toLocaleString("es-AR")}
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-neutral-50">
                    ${precioPorDia.toLocaleString("es-AR")}
                  </p>
                )}
              </div>

              <div className="sm:col-span-3 h-px bg-neutral-800" />

              <div className="sm:col-span-3 space-y-2">
                {hayDescuento && (
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Precio original</span>
                    <span className="line-through">
                      ${precioBase.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}

                {hayDescuento && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>
                      Descuento
                      {cuponActual?.codigo ? ` (${cuponActual.codigo})` : ""}
                    </span>
                    <span>- ${descuentoAplicado.toLocaleString("es-AR")}</span>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <span className="text-neutral-400 font-medium">Monto total a pagar</span>
                  <span className="text-3xl font-bold text-neutral-50">
                    ${precioTotal.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onVolverBuscar}
              className="flex-1 py-2.5 bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-medium rounded-lg transition-colors"
            >
              Buscar otra cuenta
            </button>
            <button
              onClick={onProcesar}
              disabled={procesando || !puedeProcesar}
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