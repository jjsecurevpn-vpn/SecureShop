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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
      <div className="bg-neutral-900 rounded-lg shadow-2xl max-w-md w-full max-h-[70vh] border border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-neutral-800 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-200">
                Prueba Gratuita
              </h2>
              <p className="text-xs text-neutral-500">
                Acceso completo por 2 horas
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
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
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-300 font-semibold text-sm">
                      ¡Demo activa!
                    </p>
                    <p className="text-neutral-300 text-xs mt-1">
                      Las credenciales han sido enviadas a tu email. Revisa tu
                      bandeja de entrada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-3">
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-neutral-700 flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    <p className="text-neutral-400 text-xs font-semibold">
                      Usuario
                    </p>
                  </div>
                  <p className="text-blue-400 font-mono text-sm break-all">
                    {credentials.username}
                  </p>
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-neutral-700 flex items-center justify-center">
                      <span className="text-xs">🔑</span>
                    </div>
                    <p className="text-neutral-400 text-xs font-semibold">
                      Contraseña
                    </p>
                  </div>
                  <p className="text-blue-400 font-mono text-sm break-all">
                    {credentials.password}
                  </p>
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <p className="text-neutral-400 text-xs font-semibold">
                      Válido por
                    </p>
                  </div>
                  <p className="text-yellow-400 font-semibold text-sm">
                    {credentials.horas_validas} horas
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <p className="text-blue-300 text-xs">
                  Descarga la app JJSecure VPN desde Play Store o App Store e
                  ingresa estas credenciales. Acceso válido por 2 horas.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
                      ? "bg-orange-900/20 border border-orange-800/50"
                      : "bg-red-900/20 border border-red-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {bloqueado ? (
                      <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-semibold text-sm ${
                          bloqueado ? "text-orange-300" : "text-red-300"
                        }`}
                      >
                        {bloqueado ? "Demo bloqueada" : "Error"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          bloqueado ? "text-orange-200" : "text-red-200"
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
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Nombre o Alias
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 space-y-2">
                <p className="text-neutral-300 text-xs">
                  <span className="font-semibold">✨ Incluye:</span>
                </p>
                <ul className="text-neutral-400 text-xs space-y-1">
                  <li>✅ 2 horas de acceso completo</li>
                  <li>✅ Todos los servidores disponibles</li>
                  <li>✅ Velocidad sin limitaciones</li>
                </ul>
                <p className="text-neutral-400 text-xs mt-3 pt-2 border-t border-blue-800/30">
                  Solo puedes solicitar una demo cada 48 horas por email o IP
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || bloqueado}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
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
