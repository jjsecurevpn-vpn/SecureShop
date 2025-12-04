import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
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
  onVolverBuscar,
  connectionActual,
  connectionDestino,
  precioBase,
  precioTotal,
  precioPorDia,
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
      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 md:p-5 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Step 1: Search */}
      {pasoRenovacion === "buscar" && (
        <div className="space-y-6">
          <div>
            <div className="mb-6">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Paso 1</p>
              <h3 className="text-lg md:text-xl xl:text-2xl font-semibold text-gray-900">Busca tu cuenta</h3>
              <p className="text-xs md:text-sm text-gray-600 mt-2">Ingresa tu nombre de usuario para continuar</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 md:p-5 xl:p-6 shadow-sm shadow-gray-100">
              <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-4">
                Usuario registrado
              </label>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(event) => onBusquedaChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleBuscar();
                    }
                  }}
                  placeholder="tu_usuario"
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  disabled={buscando}
                />
              </div>

              <button
                onClick={handleBuscar}
                disabled={buscando || !busqueda.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-sm md:text-base font-semibold transition-colors disabled:bg-gray-300 disabled:text-gray-500"
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
          </div>
        </div>
      )}

      {/* Step 2: Configuration */}
      {pasoRenovacion === "configurar" && cuenta && (
        <div className="space-y-12">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-6">
              {/* Account Info Card */}
              <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 md:p-5 xl:p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-900">Cuenta encontrada</p>
                    <p className="text-xs md:text-sm text-emerald-700">
                      {cuenta.tipo === "cliente" ? "Cliente VPN" : "Revendedor"} • <span className="font-medium">{cuenta.datos.servex_username}</span>
                    </p>
                    {cuenta.datos.plan_nombre && (
                      <p className="text-[10px] md:text-xs text-emerald-600 mt-2">
                        Plan actual: <span className="font-medium">{cuenta.datos.plan_nombre}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 md:p-5 xl:p-6 shadow-sm shadow-gray-100">
                <div className="mb-6">
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Paso 2</p>
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold text-gray-900">Duración a agregar</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Elige cuántos días deseas renovar tu suscripción</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DIAS_RENOVACION.map((opcionDias) => (
                    <button
                      key={opcionDias}
                      onClick={() => onDiasChange(opcionDias)}
                      className={`rounded-2xl border-2 px-4 py-3 text-xs md:text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                        dias === opcionDias
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      {opcionDias} días
                    </button>
                  ))}
                </div>
              </div>

              {/* Devices Selection - Only for clients */}
              {cuenta.tipo === "cliente" && (
                <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 md:p-5 xl:p-6 shadow-sm shadow-gray-100">
                  <div className="mb-6">
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Paso 3</p>
                    <h3 className="text-base md:text-lg xl:text-xl font-semibold text-gray-900">Dispositivos simultáneos</h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Cambia la cantidad si necesitas más protección</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {DISPOSITIVOS_RENOVACION.map((dispositivos) => {
                      const esActual = dispositivos === connectionActual;
                      const esSeleccionado = dispositivosSeleccionados === dispositivos;
                      return (
                        <button
                          key={dispositivos}
                          onClick={() => onDispositivosChange(dispositivos)}
                          className={`relative rounded-2xl border-2 p-4 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                            esSeleccionado
                              ? "border-emerald-500 bg-emerald-50 shadow-sm"
                              : esActual
                              ? "border-gray-300 bg-gray-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <p className="text-base md:text-lg font-bold text-gray-900">{dispositivos}</p>
                          <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                            ${PRECIOS_POR_DIA[dispositivos] ?? PRECIOS_POR_DIA[1]}/día
                          </p>
                          {esActual && !esSeleccionado && (
                            <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-[8px] md:text-[10px] px-2 py-1 rounded-full font-medium">
                              Actual
                            </span>
                          )}
                          {esSeleccionado && (
                            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] md:text-[10px] px-2 py-1 rounded-full font-medium">
                              Nuevo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 md:p-5 xl:p-6 shadow-sm shadow-gray-100">
                <div className="mb-6">
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Paso 4</p>
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold text-gray-900">Información de contacto</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => onNombreChange(event.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
                      Email de contacto
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
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
            </div>

            {/* Summary Card - Sticky Sidebar */}
            <aside className="rounded-3xl bg-gray-900 p-4 md:p-5 xl:p-6 text-white shadow-xl md:sticky md:top-24 md:h-fit">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200 mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Resumen de renovación</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs md:text-sm text-gray-400 mb-2">Tu renovación</p>
                  <p className="text-xl md:text-2xl xl:text-3xl font-semibold text-white">
                    {dias} días {cuenta.tipo === "cliente" ? `• ${connectionDestino} dispositivos` : ""}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 mt-2">
                    {cuenta.tipo === "cliente"
                      ? connectionDestino !== connectionActual
                        ? `Cambio de ${connectionActual} a ${connectionDestino} dispositivos`
                        : "Sin cambios en dispositivos"
                      : "Renovación de revendedor"}
                  </p>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-300">Precio base</p>
                    <p className="text-base md:text-lg font-semibold">
                      ${precioBase.toLocaleString("es-AR")}
                    </p>
                  </div>

                  {hayDescuento && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <p>
                        Descuento
                        {cuponActual?.codigo ? ` (${cuponActual.codigo})` : ""}
                      </p>
                      <p className="font-semibold">
                        - ${descuentoAplicado.toLocaleString("es-AR")}
                      </p>
                    </div>
                  )}

                  <div className="h-px bg-white/10" />

                  <div className="flex justify-between items-center pt-2">
                    <p className="text-gray-300">Total a pagar</p>
                    <p className="text-2xl md:text-3xl xl:text-4xl font-bold text-white">
                      ${precioTotal.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <p className="text-[10px] md:text-xs text-gray-500">
                    ${precioPorDia.toLocaleString("es-AR")}/día
                  </p>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-3">
                  <button
                    onClick={onVolverBuscar}
                    className="w-full rounded-2xl border border-white/20 px-6 py-3 text-sm md:text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                  >
                    Buscar otra cuenta
                  </button>
                  <button
                    onClick={onProcesar}
                    disabled={procesando || !puedeProcesar}
                    className="w-full rounded-2xl bg-emerald-500 px-6 py-3 text-sm md:text-base font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2"
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

                <p className="text-[10px] md:text-xs text-gray-500 text-center">
                  Pago seguro con Mercado Pago, tarjetas internacionales o criptomonedas.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
