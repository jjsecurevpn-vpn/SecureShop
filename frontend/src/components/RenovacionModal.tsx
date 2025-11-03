import { useState, useEffect } from "react";
import {
  X,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Plan } from "../types";
import { useBodyOverflow } from "../hooks/useBodyOverflow";
import { apiService } from "../services/api.service";

interface RenovacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Paso = "buscar" | "seleccionar";

interface CuentaEncontrada {
  tipo: "cliente" | "revendedor";
  datos: {
    id?: string;
    servex_cuenta_id?: number;
    servex_revendedor_id?: number;
    servex_username: string;
    connection_limit?: number;
    cliente_nombre: string;
    cliente_email: string;
    plan_nombre?: string;
    servex_account_type?: "validity" | "credit";
  };
}

export default function RenovacionModal({
  isOpen,
  onClose,
}: RenovacionModalProps) {
  const [paso, setPaso] = useState<Paso>("buscar");
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [cuenta, setCuenta] = useState<CuentaEncontrada | null>(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState(7);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState<
    number | null
  >(null);
  const [procesando, setProcesando] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [planes, setPlanes] = useState<Plan[]>([]);

  // Bloquear scroll del body cuando el modal está abierto
  useBodyOverflow(isOpen);

  useEffect(() => {
    if (isOpen) {
      cargarPlanes();
    }
  }, [isOpen]);

  const cargarPlanes = async () => {
    try {
      const p = await apiService.obtenerPlanes();
      setPlanes(p);
    } catch (err) {
      console.error("Error obteniendo planes:", err);
      setPlanes([]);
    }
  };

  if (!isOpen) return null;

  const buscarCuenta = async () => {
    if (!busqueda.trim()) {
      setError("Ingresa un email o username");
      return;
    }

    setBuscando(true);
    setError("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: busqueda.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al buscar la cuenta");
      }

      if (!data.encontrado) {
        setError("No se encontró ninguna cuenta con ese email o username");
        return;
      }

      setCuenta(data as CuentaEncontrada);
      setNombreCliente(data.datos.cliente_nombre || "");
      setEmailCliente(data.datos.cliente_email || "");
      setPaso("seleccionar");
    } catch (err: any) {
      setError(err.message || "Error al buscar la cuenta");
    } finally {
      setBuscando(false);
    }
  };

  const procesarRenovacion = async () => {
    if (!cuenta || !nombreCliente.trim() || !emailCliente.trim()) {
      setError("Completa todos los campos");
      return;
    }

    setProcesando(true);
    setError("");

    try {
      const endpoint =
        cuenta.tipo === "cliente"
          ? "/api/renovacion/cliente"
          : "/api/renovacion/revendedor";
      const body: any = {
        busqueda: busqueda.trim(),
        dias: diasSeleccionados,
        precio: calcularPrecio(),
        clienteEmail: emailCliente.trim(),
        clienteNombre: nombreCliente.trim(),
      };

      if (cuenta.tipo === "cliente" && dispositivosSeleccionados !== null) {
        const limiteActual = cuenta.datos.connection_limit || 1;
        if (dispositivosSeleccionados !== limiteActual) {
          body.nuevoConnectionLimit = dispositivosSeleccionados;
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la renovación");
      }

      window.location.href = data.linkPago;
    } catch (err: any) {
      setError(err.message || "Error al procesar la renovación");
      setProcesando(false);
    }
  };

  const calcularPrecio = () => {
    if (!cuenta) return 0;
    const connectionLimit =
      dispositivosSeleccionados || cuenta.datos.connection_limit || 1;
    const planEncontrado = planes.find(
      (plan) =>
        plan.dias === diasSeleccionados &&
        plan.connection_limit === connectionLimit
    );
    if (planEncontrado) return planEncontrado.precio;
    const precioBase = connectionLimit * 1000;
    const factorDias = diasSeleccionados / 7;
    return Math.round(precioBase * factorDias);
  };

  const resetear = () => {
    setPaso("buscar");
    setBusqueda("");
    setError("");
    setCuenta(null);
    setDiasSeleccionados(7);
    setDispositivosSeleccionados(null);
    setNombreCliente("");
    setEmailCliente("");
  };

  const cerrar = () => {
    resetear();
    onClose();
  };

  const preciosPorDia: { [key: number]: number } = {
    1: 500,
    2: 833,
    3: 1166,
    4: 1500,
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
      <div className="bg-neutral-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[70vh] border border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-neutral-800 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-200">
                Renovar o Actualizar
              </h2>
              <p className="text-xs text-neutral-500">
                {paso === "buscar"
                  ? "Busca tu cuenta por email o username"
                  : "Selecciona los días a agregar"}
              </p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Step 1: Search */}
          {paso === "buscar" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email o Username
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && buscarCuenta()}
                    placeholder="ejemplo@email.com o username123"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={buscando}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Ingresa el email o username que usaste al comprar
                </p>
              </div>

              <button
                onClick={buscarCuenta}
                disabled={buscando || !busqueda.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {buscando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Buscar Cuenta
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Select */}
          {paso === "seleccionar" && cuenta && (
            <div className="space-y-6">
              {/* Account Found */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-purple-300">
                      ¡Cuenta encontrada!
                    </p>
                    <div className="text-sm text-neutral-300 space-y-1">
                      <div>
                        <span className="text-neutral-500">Tipo:</span>{" "}
                        <span className="font-medium">
                          {cuenta.tipo === "cliente"
                            ? "Cliente VPN"
                            : "Revendedor"}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Username:</span>{" "}
                        <span className="font-medium">
                          {cuenta.datos.servex_username}
                        </span>
                      </div>
                      {cuenta.tipo === "cliente" &&
                        cuenta.datos.connection_limit && (
                          <div>
                            <span className="text-neutral-500">
                              Dispositivos:
                            </span>{" "}
                            <span className="font-medium">
                              {cuenta.datos.connection_limit}
                            </span>
                          </div>
                        )}
                      {cuenta.datos.plan_nombre && (
                        <div>
                          <span className="text-neutral-500">Plan actual:</span>{" "}
                          <span className="font-medium">
                            {cuenta.datos.plan_nombre}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Days Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Días a agregar:{" "}
                  <span className="text-purple-400 font-bold text-lg">
                    {diasSeleccionados}
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[3, 7, 15, 20, 25, 30].map((dias) => (
                    <button
                      key={dias}
                      onClick={() => setDiasSeleccionados(dias)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        diasSeleccionados === dias
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700"
                      }`}
                    >
                      {dias}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Devices Selector */}
              {cuenta.tipo === "cliente" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Dispositivos simultáneos
                  </label>
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 mb-3">
                    <p className="text-sm text-neutral-400">
                      Actual:{" "}
                      <span className="text-neutral-200 font-semibold">
                        {cuenta.datos.connection_limit || 1}
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((dispositivos) => {
                      const esActual =
                        dispositivos === cuenta.datos.connection_limit;
                      const esSeleccionado =
                        dispositivosSeleccionados === dispositivos;
                      return (
                        <button
                          key={dispositivos}
                          onClick={() =>
                            setDispositivosSeleccionados(dispositivos)
                          }
                          className={`p-4 rounded-lg border-2 transition-all relative ${
                            esSeleccionado
                              ? "border-purple-500 bg-purple-500/10 text-neutral-200"
                              : esActual
                              ? "border-purple-500/30 bg-purple-500/5 text-neutral-200"
                              : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                          }`}
                        >
                          {esActual && !esSeleccionado && (
                            <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                              Actual
                            </span>
                          )}
                          {esSeleccionado && (
                            <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                              Nuevo
                            </span>
                          )}
                          <p className="text-2xl font-bold mb-1">
                            {dispositivos}
                          </p>
                          <p className="text-xs text-neutral-500">
                            ${preciosPorDia[dispositivos]}/día
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Días a agregar:</span>
                  <span className="text-neutral-200 font-semibold">
                    {diasSeleccionados} días
                  </span>
                </div>
                {cuenta.tipo === "cliente" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Dispositivos:</span>
                    <span className="text-neutral-200 font-semibold">
                      {dispositivosSeleccionados ||
                        cuenta.datos.connection_limit ||
                        1}
                      {dispositivosSeleccionados &&
                        dispositivosSeleccionados !==
                          cuenta.datos.connection_limit && (
                          <span className="ml-2 text-xs text-purple-400">
                            (cambio)
                          </span>
                        )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Precio por día:</span>
                  <span className="text-neutral-200 font-semibold">
                    $
                    {
                      preciosPorDia[
                        dispositivosSeleccionados ||
                          cuenta.datos.connection_limit ||
                          1
                      ]
                    }
                  </span>
                </div>
                <div className="border-t border-neutral-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-200 font-bold">Total:</span>
                    <span className="text-2xl font-bold text-purple-400">
                      ${calcularPrecio().toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaso("buscar")}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-lg transition-colors border border-neutral-700"
                >
                  Volver
                </button>
                <button
                  onClick={procesarRenovacion}
                  disabled={
                    procesando || !nombreCliente.trim() || !emailCliente.trim()
                  }
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Continuar al Pago
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
