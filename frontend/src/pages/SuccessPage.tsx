import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Copy,
  Check,
  Download,
  Home,
  Mail,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { apiService } from "../services/api.service";
import { Pago } from "../types";
import Loading from "../components/Loading";

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [pago, setPago] = useState<Pago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    const pagoId = searchParams.get("pago_id");
    const tipo = searchParams.get("tipo"); // 'cliente' o 'revendedor'
    const esRenovacion = searchParams.get("renovacion"); // 'true' si es renovación

    if (pagoId) {
      if (esRenovacion === "true") {
        cargarRenovacion(pagoId);
      } else {
        cargarPago(pagoId, tipo || "cliente");
      }
    } else {
      setError("ID de pago no encontrado");
      setLoading(false);
    }
  }, [searchParams, reintentos]);

  const cargarRenovacion = async (renovacionId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Crear objeto compatible con la interfaz Pago
      const renovacionData = {
        id: renovacionId,
        tipo: "cliente",
        estado: "aprobado",
        monto: parseFloat(searchParams.get("monto") || "0"),
        servex_username: searchParams.get("username") || "",
        servex_password: "", // No hay password en renovación
        servex_categoria:
          searchParams.get("operacion") === "upgrade"
            ? "Upgrade aplicado"
            : "Renovación aplicada",
        servex_connection_limit: parseInt(
          searchParams.get("connection_limit") || "0"
        ),
        servex_expiracion: searchParams.get("fecha_expiracion") || "N/A",
        cliente_email: searchParams.get("email") || "",
        cliente_nombre: "",
      };

      setPago(renovacionData as any);
    } catch (err: any) {
      setError(
        err.message || "Error al cargar la información de la renovación"
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarPago = async (pagoId: string, tipo: string = "cliente") => {
    try {
      setLoading(true);
      setError(null);
      const data =
        tipo === "revendedor"
          ? await apiService.obtenerPagoRevendedor(pagoId)
          : await apiService.obtenerPago(pagoId);
      setPago(data);

      // ✅ MEJORADO: Verificar tanto el estado como que los datos estén completos
      const datosIncompletos = !data.servex_username || !data.servex_password;
      
      if (data.estado !== "aprobado" || datosIncompletos) {
        // 🔴 MEJORADO: Aumentar a 30 reintentos = 90+ segundos con backoff
        if (reintentos < 30) {
          // Estrategia de backoff: esperar más tiempo después de varios reintentos
          const delay = reintentos < 5 ? 500 : reintentos < 10 ? 1000 : 2000;

          setTimeout(() => {
            setReintentos((prev) => prev + 1);
          }, delay);
        } else {
          setError(
            "El pago aún no ha sido procesado después de 90+ segundos. Por favor, verifica tu email o contacta a soporte."
          );
        }
      }
    } catch (err: any) {
      // Si hay un error HTTP y aún podemos reintentar, volver a intentar
      if (reintentos < 30) {
        const delay = reintentos < 5 ? 500 : reintentos < 10 ? 1000 : 2000;

        setTimeout(() => {
          setReintentos((prev) => prev + 1);
        }, delay);
      } else {
        setError(
          err.message ||
            "Error al cargar la información del pago. Por favor, verifica tu email."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <Loading
        message={
          reintentos > 0
            ? `Procesando tu pago... (${reintentos}/30)`
            : "Verificando tu compra..."
        }
      />
    );
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-200 mb-2">
            Verificando pago
          </h2>
          <p className="text-neutral-400 mb-6">
            {error || "No se encontró información del pago"}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition-colors border border-neutral-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-16 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-200 mb-2">
            ¡Pago completado!
          </h1>
          <p className="text-neutral-400">
            {searchParams.get("renovacion") === "true"
              ? "Tu renovación ha sido procesada exitosamente"
              : "Tu servicio VPN está listo para usar"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
          {/* Credentials */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Usuario
              </label>
              <div className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3">
                <span className="font-mono text-sm text-neutral-200 flex-1">
                  {pago.servex_username || "Generando..."}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(pago.servex_username || "", "username")
                  }
                  className="p-2 hover:bg-neutral-700 rounded-md transition-colors text-neutral-400 hover:text-neutral-200"
                >
                  {copiedField === "username" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {pago.servex_password && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Contraseña
                </label>
                <div className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3">
                  <span className="font-mono text-sm text-neutral-200 flex-1">
                    {pago.servex_password}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(pago.servex_password || "", "password")
                    }
                    className="p-2 hover:bg-neutral-700 rounded-md transition-colors text-neutral-400 hover:text-neutral-200"
                  >
                    {copiedField === "password" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {searchParams.get("renovacion") === "true" && (
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-300 text-sm">
                    {searchParams.get("operacion") === "upgrade"
                      ? "Upgrade procesado exitosamente"
                      : "Renovación procesada exitosamente"}
                    . Se agregaron {searchParams.get("dias")} días a tu cuenta.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Servidor
              </div>
              <div className="text-neutral-200 font-medium">
                {pago.servex_categoria || "N/A"}
              </div>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Dispositivos
              </div>
              <div className="text-neutral-200 font-medium">
                {pago.servex_connection_limit || "N/A"}
              </div>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Válido hasta
              </div>
              <div className="text-neutral-200 font-medium">
                {(() => {
                  if (
                    !pago.servex_expiracion ||
                    pago.servex_expiracion === "N/A"
                  )
                    return "N/A";
                  const fecha = new Date(pago.servex_expiracion);
                  return isNaN(fecha.getTime())
                    ? "N/A"
                    : fecha.toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      });
                })()}
              </div>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Referencia
              </div>
              <div className="text-neutral-200 font-mono font-medium text-xs break-all">
                {pago.id}
              </div>
            </div>
          </div>

          {/* Email notification */}
          <div className="flex items-center gap-3 text-sm text-neutral-400 bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-4">
            <Mail className="w-5 h-5 text-neutral-500 flex-shrink-0" />
            <span>
              Credenciales enviadas a{" "}
              <span className="text-neutral-200 font-medium">
                {pago.cliente_email}
              </span>
            </span>
          </div>
        </div>

        {/* Panel de Gestión - Solo para Revendedores */}
        {searchParams.get("tipo") === "revendedor" && (
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-1">
                  Panel de Gestión
                </h3>
                <p className="text-neutral-400 text-sm">
                  Accede a tu panel de administración para gestionar tus cuentas
                </p>
              </div>
            </div>

            <a
              href="https://servex.ws"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <span>Ir al Panel de Gestión</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <p className="text-neutral-500 text-xs mt-3">
              <span className="text-blue-400 font-medium">URL:</span>{" "}
              https://servex.ws
            </p>
          </div>
        )}

        {/* Instructions Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-200 mb-4">
            {searchParams.get("tipo") === "revendedor"
              ? "Próximos pasos"
              : "Cómo conectarte"}
          </h3>

          {searchParams.get("tipo") === "revendedor" ? (
            <ol className="space-y-3 text-sm text-neutral-300">
              <li className="flex gap-3">
                <span className="text-neutral-500 font-mono text-xs bg-neutral-800 px-2 py-1 rounded">
                  1
                </span>
                <span>
                  Accede a tu panel en{" "}
                  <span className="text-blue-400 font-medium">
                    https://servex.ws
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-neutral-500 font-mono text-xs bg-neutral-800 px-2 py-1 rounded">
                  2
                </span>
                <span>Consulta tus credenciales y configura tus cuentas</span>
              </li>
              <li className="flex gap-3">
                <span className="text-neutral-500 font-mono text-xs bg-neutral-800 px-2 py-1 rounded">
                  3
                </span>
                <span>Distribuye accesos a tus clientes finales</span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-3 text-sm text-neutral-300">
              <li className="flex gap-3">
                <span className="text-neutral-500 font-mono text-xs bg-neutral-800 px-2 py-1 rounded">
                  1
                </span>
                <span>
                  Descarga{" "}
                  <span className="text-blue-400 font-medium">
                    JJSecure VPN
                  </span>{" "}
                  desde Play Store o App Store
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-neutral-500 font-mono text-xs bg-neutral-800 px-2 py-1 rounded">
                  2
                </span>
                <span>Ingresa tu usuario y contraseña</span>
              </li>
              <li className="flex gap-3">
                <span className="text-neutral-500 font-mono text-xs bg-neutral-800 px-2 py-1 rounded">
                  3
                </span>
                <span>Elige cualquier servidor disponible y ¡conéctate!</span>
              </li>
            </ol>
          )}
        </div>

        {/* Security Warning */}
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium text-sm mb-1">
                Importante
              </p>
              <p className="text-amber-200 text-sm">
                Guarda estas credenciales en lugar seguro. No las compartas con
                nadie.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors border border-neutral-700"
            title="Imprimir"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={() =>
              copyToClipboard(
                `${pago.servex_username}\n${pago.servex_password}`,
                "all"
              )
            }
            className="flex items-center justify-center gap-2 px-3 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors border border-neutral-700"
            title="Copiar todo"
          >
            {copiedField === "all" ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </button>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-3 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors border border-neutral-700"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
        </div>

        {/* Support link */}
        <div className="text-center">
          <p className="text-neutral-500 text-sm">
            ¿Problemas?{" "}
            <a
              href="#"
              className="text-neutral-400 hover:text-neutral-300 transition-colors"
            >
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
