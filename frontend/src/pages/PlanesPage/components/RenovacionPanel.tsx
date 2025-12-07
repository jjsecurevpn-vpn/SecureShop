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
import { protonColors } from "../../../styles/colors";

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
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: protonColors.green[300] }}>Paso 1</p>
              <h3 className="text-lg md:text-xl xl:text-2xl font-semibold" style={{ color: protonColors.white }}>Busca tu cuenta</h3>
              <p className="text-xs md:text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Ingresa tu nombre de usuario para continuar</p>
            </div>

            <div className="rounded-3xl border p-4 md:p-5 xl:p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <label className="block text-xs md:text-sm font-semibold mb-4" style={{ color: protonColors.white }}>
                Usuario registrado
              </label>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
                  className="w-full rounded-2xl border py-3 pl-11 pr-4 placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors text-white"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = protonColors.green[300];
                    e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${protonColors.green[300]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  disabled={buscando}
                />
              </div>

              <button
                onClick={handleBuscar}
                disabled={buscando || !busqueda.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl text-white py-3 text-sm md:text-base font-semibold transition-colors"
                style={{
                  backgroundColor: buscando || !busqueda.trim() ? 'rgba(255, 255, 255, 0.2)' : protonColors.green[300],
                  color: buscando || !busqueda.trim() ? 'rgba(255, 255, 255, 0.5)' : protonColors.purple[900],
                }}
                onMouseEnter={(e) => {
                  if (!buscando && busqueda.trim()) {
                    e.currentTarget.style.backgroundColor = protonColors.green[400];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!buscando && busqueda.trim()) {
                    e.currentTarget.style.backgroundColor = protonColors.green[300];
                  }
                }}
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
              <div className="rounded-3xl border p-4 md:p-5 xl:p-6" style={{ backgroundColor: `${protonColors.green[300]}15`, borderColor: `${protonColors.green[300]}40` }}>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 mt-1" style={{ color: protonColors.green[300] }} />
                  <div className="space-y-1">
                    <p className="font-semibold" style={{ color: protonColors.green[300] }}>Cuenta encontrada</p>
                    <p className="text-xs md:text-sm" style={{ color: protonColors.green[300] }}>
                      {cuenta.tipo === "cliente" ? "Cliente VPN" : "Revendedor"} • <span className="font-medium">{cuenta.datos.servex_username}</span>
                    </p>
                    {cuenta.datos.plan_nombre && (
                      <p className="text-[10px] md:text-xs mt-2" style={{ color: protonColors.green[300] }}>
                        Plan actual: <span className="font-medium">{cuenta.datos.plan_nombre}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="rounded-3xl border p-4 md:p-5 xl:p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="mb-6">
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: protonColors.green[300] }}>Paso 2</p>
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold" style={{ color: protonColors.white }}>Duración a agregar</h3>
                  <p className="text-xs md:text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Elige cuántos días deseas renovar tu suscripción</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DIAS_RENOVACION.map((opcionDias) => (
                    <button
                      key={opcionDias}
                      onClick={() => onDiasChange(opcionDias)}
                      className="rounded-2xl border-2 px-4 py-3 text-xs md:text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        borderColor: dias === opcionDias ? protonColors.green[300] : 'rgba(255, 255, 255, 0.2)',
                        backgroundColor: dias === opcionDias ? `${protonColors.green[300]}15` : 'rgba(255, 255, 255, 0.05)',
                        color: dias === opcionDias ? protonColors.green[300] : protonColors.white,
                      }}
                      onMouseEnter={(e) => {
                        if (dias !== opcionDias) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (dias !== opcionDias) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                    >
                      {opcionDias} días
                    </button>
                  ))}
                </div>
              </div>

              {/* Devices Selection - Only for clients */}
              {cuenta.tipo === "cliente" && (
                <div className="rounded-3xl border p-4 md:p-5 xl:p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="mb-6">
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: protonColors.green[300] }}>Paso 3</p>
                    <h3 className="text-base md:text-lg xl:text-xl font-semibold" style={{ color: protonColors.white }}>Dispositivos simultáneos</h3>
                    <p className="text-xs md:text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Cambia la cantidad si necesitas más protección</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {DISPOSITIVOS_RENOVACION.map((dispositivos) => {
                      const esActual = dispositivos === connectionActual;
                      const esSeleccionado = dispositivosSeleccionados === dispositivos;
                      return (
                        <button
                          key={dispositivos}
                          onClick={() => onDispositivosChange(dispositivos)}
                          className="relative rounded-2xl border-2 p-4 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            borderColor: esSeleccionado ? protonColors.green[300] : esActual ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                            backgroundColor: esSeleccionado ? `${protonColors.green[300]}15` : esActual ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                            color: protonColors.white,
                          }}
                          onMouseEnter={(e) => {
                            if (!esSeleccionado) {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!esSeleccionado) {
                              e.currentTarget.style.borderColor = esActual ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)';
                            }
                          }}
                        >
                          <p className="text-base md:text-lg font-bold" style={{ color: protonColors.white }}>{dispositivos}</p>
                          <p className="text-[10px] md:text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            ${PRECIOS_POR_DIA[dispositivos] ?? PRECIOS_POR_DIA[1]}/día
                          </p>
                          {esActual && !esSeleccionado && (
                            <span className="absolute -top-2 -right-2 text-white text-[8px] md:text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                              Actual
                            </span>
                          )}
                          {esSeleccionado && (
                            <span className="absolute -top-2 -right-2 text-[8px] md:text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: protonColors.green[300], color: protonColors.purple[900] }}>
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
              <div className="rounded-3xl border p-4 md:p-5 xl:p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="mb-6">
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: protonColors.green[300] }}>Paso 4</p>
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold" style={{ color: protonColors.white }}>Información de contacto</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2" style={{ color: protonColors.white }}>
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => onNombreChange(event.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-2xl border px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors text-white"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = protonColors.green[300];
                        e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${protonColors.green[300]}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2" style={{ color: protonColors.white }}>
                      Email de contacto
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-2xl border px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors text-white"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = protonColors.green[300];
                        e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${protonColors.green[300]}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
            <aside className="rounded-3xl p-4 md:p-5 xl:p-6 text-white shadow-xl md:sticky md:top-24 md:h-fit" style={{ background: `linear-gradient(135deg, rgb(30, 20, 60) 0%, rgb(20, 12, 45) 100%)` }}>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] mb-6" style={{ backgroundColor: protonColors.green[300], color: protonColors.purple[900] }}>
                <Sparkles className="h-4 w-4" />
                <span>Resumen de renovación</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs md:text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Tu renovación</p>
                  <p className="text-xl md:text-2xl xl:text-3xl font-semibold text-white">
                    {dias} días {cuenta.tipo === "cliente" ? `• ${connectionDestino} dispositivos` : ""}
                  </p>
                  <p className="text-xs md:text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {cuenta.tipo === "cliente"
                      ? connectionDestino !== connectionActual
                        ? `Cambio de ${connectionActual} a ${connectionDestino} dispositivos`
                        : "Sin cambios en dispositivos"
                      : "Renovación de revendedor"}
                  </p>
                </div>

                <div className="h-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Precio base</p>
                    <p className="text-base md:text-lg font-semibold">
                      ${precioBase.toLocaleString("es-AR")}
                    </p>
                  </div>

                  {hayDescuento && (
                    <div className="flex justify-between items-center" style={{ color: protonColors.green[300] }}>
                      <p>
                        Descuento
                        {cuponActual?.codigo ? ` (${cuponActual.codigo})` : ""}
                      </p>
                      <p className="font-semibold">
                        - ${descuentoAplicado.toLocaleString("es-AR")}
                      </p>
                    </div>
                  )}

                  <div className="h-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

                  <div className="flex justify-between items-center pt-2">
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total a pagar</p>
                    <p className="text-2xl md:text-3xl xl:text-4xl font-bold text-white">
                      ${precioTotal.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <p className="text-[10px] md:text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    ${precioPorDia.toLocaleString("es-AR")}/día
                  </p>
                </div>

                <div className="h-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

                <div className="space-y-3">
                  <button
                    onClick={onVolverBuscar}
                    className="w-full rounded-2xl border px-6 py-3 text-sm md:text-base font-semibold text-white transition"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Buscar otra cuenta
                  </button>
                  <button
                    onClick={onProcesar}
                    disabled={procesando || !puedeProcesar}
                    className="w-full rounded-2xl px-6 py-3 text-sm md:text-base font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: procesando || !puedeProcesar ? 'rgba(255, 255, 255, 0.2)' : protonColors.green[300],
                      color: procesando || !puedeProcesar ? 'rgba(255, 255, 255, 0.5)' : protonColors.purple[900],
                    }}
                    onMouseEnter={(e) => {
                      if (!procesando && puedeProcesar) {
                        e.currentTarget.style.backgroundColor = protonColors.green[400];
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!procesando && puedeProcesar) {
                        e.currentTarget.style.backgroundColor = protonColors.green[300];
                      }
                    }}
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
