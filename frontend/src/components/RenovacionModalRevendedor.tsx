import { useState, useEffect } from "react";
import {
  X,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Calendar,
  CreditCard,
} from "lucide-react";
import { apiService } from "../services/api.service";

interface RenovacionModalRevendedorProps {
  isOpen: boolean;
  onClose: () => void;
}

type Paso = "buscar" | "seleccionar";

interface RevendedorEncontrado {
  datos: {
    servex_revendedor_id: number;
    servex_username: string;
    servex_account_type: "validity" | "credit";
    max_users: number;
    expiration_date?: string;
    cliente_nombre: string;
    cliente_email: string;
  };
}

export default function RenovacionModalRevendedor({
  isOpen,
  onClose,
}: RenovacionModalRevendedorProps) {
  const [paso, setPaso] = useState<Paso>("buscar");
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [revendedor, setRevendedor] = useState<RevendedorEncontrado | null>(
    null
  );
  const [tipoRenovacion, setTipoRenovacion] = useState<"validity" | "credit">(
    "validity"
  );
  const [creditosSeleccionados, setCreditosSeleccionados] = useState(5);
  const [procesando, setProcesando] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  // Planes cargados desde backend
  const [planesCredit, setPlanesCredit] = useState<any[]>([]);
  const [planesValidity, setPlanesValidity] = useState<any[]>([]);
  const [planesLoading, setPlanesLoading] = useState(false);

  useEffect(() => {
    if (tipoRenovacion === "validity" && planesValidity.length > 0) {
      setCreditosSeleccionados(planesValidity[0].max_users);
    } else if (tipoRenovacion === "credit" && planesCredit.length > 0) {
      setCreditosSeleccionados(planesCredit[0].max_users);
    }
  }, [tipoRenovacion]);

  useEffect(() => {
    if (isOpen) {
      cargarPlanes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const cargarPlanes = async () => {
    try {
      setPlanesLoading(true);
      const planos = await apiService.obtenerPlanesRevendedores();
      setPlanesCredit(planos.filter((p: any) => p.account_type === "credit"));
      setPlanesValidity(
        planos.filter((p: any) => p.account_type === "validity")
      );
    } catch (err: any) {
      console.error("Error cargando planes de revendedor:", err);
    } finally {
      setPlanesLoading(false);
    }
  };

  if (!isOpen) return null;

  const buscarRevendedor = async () => {
    if (!busqueda.trim()) {
      setError("Ingresa un email o username");
      return;
    }

    setBuscando(true);
    setError("");

    try {
      const response = await fetch("/api/renovacion/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: busqueda.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al buscar la cuenta");
      }

      if (!data.encontrado || data.tipo !== "revendedor") {
        setError(
          "No se encontró ninguna cuenta de revendedor con ese email o username"
        );
        return;
      }

      setRevendedor(data as RevendedorEncontrado);
      setTipoRenovacion(data.datos.servex_account_type);
      setNombreCliente(data.datos.cliente_nombre || "");
      setEmailCliente(data.datos.cliente_email || "");
      setPaso("seleccionar");
    } catch (err: any) {
      setError(err.message || "Error al buscar el revendedor");
    } finally {
      setBuscando(false);
    }
  };

  const procesarRenovacion = async () => {
    if (!revendedor || !nombreCliente.trim() || !emailCliente.trim()) {
      setError("Completa todos los campos");
      return;
    }

    setProcesando(true);
    setError("");

    try {
      let dias = 30;

      if (tipoRenovacion === "credit") {
        const diasPorCreditos: Record<number, number> = {
          5: 30,
          10: 60,
          20: 90,
          30: 120,
          40: 150,
          50: 150,
          60: 150,
          80: 150,
          100: 150,
          150: 150,
          200: 150,
        };
        dias = diasPorCreditos[creditosSeleccionados] || 30;
      }

      const body: any = {
        busqueda: busqueda.trim(),
        dias,
        tipoRenovacion,
        cantidadSeleccionada: creditosSeleccionados,
        clienteEmail: emailCliente.trim(),
        clienteNombre: nombreCliente.trim(),
      };

      const response = await fetch("/api/renovacion/revendedor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la renovación");
      }

      if (data.linkPago) {
        window.location.href = data.linkPago;
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar la renovación");
      setProcesando(false);
    }
  };

  const calcularPrecio = () => {
    if (tipoRenovacion === "validity") {
      const plan = planesValidity.find(
        (p) => p.max_users === creditosSeleccionados
      );
      return plan?.precio || 0;
    } else {
      const plan = planesCredit.find(
        (p) => p.max_users === creditosSeleccionados
      );
      return plan?.precio || 0;
    }
  };

  const resetear = () => {
    setPaso("buscar");
    setBusqueda("");
    setError("");
    setRevendedor(null);
    setTipoRenovacion("validity");
    setCreditosSeleccionados(5);
    setNombreCliente("");
    setEmailCliente("");
  };

  const cerrar = () => {
    resetear();
    onClose();
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
                Renovar Revendedor
              </h2>
              <p className="text-xs text-neutral-500">
                {paso === "buscar"
                  ? "Busca tu cuenta de revendedor"
                  : "Configura tu renovación"}
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
                  Email o Username del Revendedor
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && buscarRevendedor()}
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
                onClick={buscarRevendedor}
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
                    Buscar Revendedor
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Select */}
          {paso === "seleccionar" && revendedor && (
            <div className="space-y-6">
              {/* Account Found */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-purple-300">
                      ¡Revendedor encontrado!
                    </p>
                    <div className="text-sm text-neutral-300 space-y-1">
                      <div>
                        <span className="text-neutral-500">Username:</span>{" "}
                        <span className="font-medium">
                          {revendedor.datos.servex_username}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Tipo:</span>{" "}
                        <span className="font-medium">
                          {revendedor.datos.servex_account_type === "validity"
                            ? "Validez"
                            : "Créditos"}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Usuarios máx.:</span>{" "}
                        <span className="font-medium">
                          {revendedor.datos.max_users}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Tipo de Renovación
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      revendedor?.datos.servex_account_type === "validity" &&
                      setTipoRenovacion("validity")
                    }
                    disabled={
                      revendedor?.datos.servex_account_type !== "validity"
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      revendedor?.datos.servex_account_type !== "validity"
                        ? "border-neutral-700/30 bg-neutral-800/20 cursor-not-allowed opacity-50"
                        : tipoRenovacion === "validity"
                        ? "border-purple-500 bg-purple-500/10 text-neutral-200"
                        : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <Calendar
                      className={`w-6 h-6 mx-auto mb-2 ${
                        tipoRenovacion === "validity"
                          ? "text-purple-400"
                          : "text-neutral-500"
                      }`}
                    />
                    <p
                      className={`font-semibold text-sm ${
                        tipoRenovacion === "validity"
                          ? "text-purple-300"
                          : "text-neutral-400"
                      }`}
                    >
                      Validez
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">+30 días</p>
                  </button>

                  <button
                    onClick={() =>
                      revendedor?.datos.servex_account_type === "credit" &&
                      setTipoRenovacion("credit")
                    }
                    disabled={
                      revendedor?.datos.servex_account_type !== "credit"
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      revendedor?.datos.servex_account_type !== "credit"
                        ? "border-neutral-700/30 bg-neutral-800/20 cursor-not-allowed opacity-50"
                        : tipoRenovacion === "credit"
                        ? "border-purple-500 bg-purple-500/10 text-neutral-200"
                        : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <CreditCard
                      className={`w-6 h-6 mx-auto mb-2 ${
                        tipoRenovacion === "credit"
                          ? "text-purple-400"
                          : "text-neutral-500"
                      }`}
                    />
                    <p
                      className={`font-semibold text-sm ${
                        tipoRenovacion === "credit"
                          ? "text-purple-300"
                          : "text-neutral-400"
                      }`}
                    >
                      Créditos
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Variable</p>
                  </button>
                </div>
              </div>

              {/* Plans Selector */}
              {tipoRenovacion === "validity" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Plan de Validez (30 días)
                  </label>
                  {planesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    </div>
                  ) : planesValidity.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {planesValidity.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() =>
                            setCreditosSeleccionados(plan.max_users)
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            creditosSeleccionados === plan.max_users
                              ? "border-purple-500 bg-purple-500/10 text-neutral-200"
                              : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                          }`}
                        >
                          <p className="text-2xl font-bold mb-1">
                            {plan.max_users}
                          </p>
                          <p className="text-xs text-neutral-500">
                            ${(plan.precio / 1000).toFixed(1)}K
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      No hay planes disponibles
                    </div>
                  )}
                </div>
              )}

              {tipoRenovacion === "credit" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Plan de Créditos
                  </label>
                  {planesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    </div>
                  ) : planesCredit.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {planesCredit.map((plan) => {
                        const meses = Math.ceil(plan.dias / 30);
                        return (
                          <button
                            key={plan.id}
                            onClick={() =>
                              setCreditosSeleccionados(plan.max_users)
                            }
                            className={`p-4 rounded-lg border-2 transition-all ${
                              creditosSeleccionados === plan.max_users
                                ? "border-purple-500 bg-purple-500/10 text-neutral-200"
                                : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                            }`}
                          >
                            <p className="text-2xl font-bold mb-1">
                              {plan.max_users}
                            </p>
                            <p className="text-xs text-neutral-500">
                              ${(plan.precio / 1000).toFixed(1)}K / {meses}m
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      No hay planes disponibles
                    </div>
                  )}
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
                  <span className="text-neutral-400">
                    {tipoRenovacion === "validity" ? "Usuarios:" : "Créditos:"}
                  </span>
                  <span className="text-neutral-200 font-semibold">
                    {creditosSeleccionados}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Duración:</span>
                  <span className="text-neutral-200 font-semibold">
                    {tipoRenovacion === "validity"
                      ? "30 días"
                      : (() => {
                          const diasPorCreditos: Record<number, number> = {
                            5: 30,
                            10: 60,
                            20: 90,
                            30: 120,
                            40: 150,
                            50: 150,
                            60: 150,
                            80: 150,
                            100: 150,
                            150: 150,
                            200: 150,
                          };
                          const dias =
                            diasPorCreditos[creditosSeleccionados] || 30;
                          return `${dias} días`;
                        })()}
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
