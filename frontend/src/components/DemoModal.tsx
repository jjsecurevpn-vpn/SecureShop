import React, { useState } from "react";
import { apiService } from "../services/api.service";
import { useBodyOverflow } from "../hooks/useBodyOverflow";
import Loading from "./Loading";
import {
  X,
  Gift,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
    horas_validas: number;
  } | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useBodyOverflow(isOpen);

  if (!isOpen) return null;

  const validar = (): boolean => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("El email es requerido");
      return false;
    } else if (!emailRegex.test(email)) {
      setError("Email inválido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validar()) return;

    setLoading(true);

    try {
      const response = await apiService.solicitarDemo(nombre, email);

      if (response.success) {
        setSuccess(true);
        setCredentials({
          ...response.data,
          horas_validas: 2, // 2 horas
        } as any);
        setNombre("");
        setEmail("");

        // Auto-cerrar después de 30 segundos
        setTimeout(() => {
          handleClose();
        }, 30000);
      } else if ((response as any).bloqueado) {
        setBloqueado(true);
        const tiempoTexto = formatearTiempo(
          (response as any).tiempo_restante || 0
        );
        // Mostrar el mensaje del servidor si está disponible, sino usar genérico
        const mensajeBloqueado =
          (response as any).error ||
          `Ya has solicitado una demo recientemente. Podrás solicitar otra en ${tiempoTexto}.`;
        setError(mensajeBloqueado);
      } else {
        setError(response.error || "Error solicitando demostración");
      }
    } catch (err: any) {
      const mensajeError =
        err.mensaje || err.message || "Error al procesar la solicitud";
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre("");
    setEmail("");
    setError(null);
    setSuccess(false);
    setCredentials(null);
    setBloqueado(false);
    onClose();
  };

  const formatearTiempo = (segundos: number): string => {
    const horas = Math.ceil(segundos / 3600);
    if (horas === 1) return "1 hora";
    if (horas < 24) return `${horas} horas`;
    const dias = Math.ceil(horas / 24);
    return dias === 1 ? "1 día" : `${dias} días`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[70vh] border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
              <Gift className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Prueba Gratuita
              </h2>
              <p className="text-xs text-gray-500">
                Acceso completo por 2 horas
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loading />
            </div>
          )}

          {/* Success State - Credenciales */}
          {success && credentials && !loading && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-900 font-semibold text-sm">
                      ¡Demo activa!
                    </p>
                    <p className="text-gray-700 text-xs mt-1">
                      Las credenciales han sido enviadas a tu email. Revisa tu
                      bandeja de entrada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Usuario
                    </p>
                  </div>
                  <p className="text-blue-300 font-mono text-sm break-all font-semibold">
                    {credentials.username}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center">
                      <span className="text-xs">🔑</span>
                    </div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Contraseña
                    </p>
                  </div>
                  <p className="text-blue-300 font-mono text-sm break-all font-semibold">
                    {credentials.password}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Válido por
                    </p>
                  </div>
                  <p className="text-blue-300 font-semibold text-sm">
                    {credentials.horas_validas} horas
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-indigo-900 text-xs leading-relaxed">
                  Descarga la app JJSecure VPN desde Play Store o App Store e
                  ingresa estas credenciales. Acceso válido por 2 horas.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Form State */}
          {!success && !loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div
                  className={`rounded-lg p-4 ${
                    bloqueado
                      ? "bg-orange-50 border border-orange-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {bloqueado ? (
                      <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-semibold text-sm ${
                          bloqueado ? "text-orange-900" : "text-red-900"
                        }`}
                      >
                        {bloqueado ? "Demo bloqueada" : "Error"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          bloqueado ? "text-orange-800" : "text-red-800"
                        }`}
                      >
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nombre Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre o Alias
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50"
                />
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 border border-slate-700/50 rounded-lg p-4 space-y-2">
                <p className="text-gray-100 text-xs font-semibold">
                  ✨ Incluye:
                </p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>✅ 2 horas de acceso completo</li>
                  <li>✅ Todos los servidores disponibles</li>
                  <li>✅ Velocidad sin limitaciones</li>
                </ul>
                <p className="text-gray-400 text-xs mt-3 pt-2 border-t border-slate-700/50">
                  Solo puedes solicitar una demo cada 48 horas por email o IP
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || bloqueado}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {bloqueado ? (
                  <>
                    <Clock className="w-5 h-5" />
                    Bloqueado temporalmente
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Solicitando...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Solicitar Demo
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
