import React, { useState } from "react";
import { apiService } from "../services/api.service";
import Loading from "./Loading";

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-blue-500/20">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            🎁 Prueba Gratuita
          </h2>
          <p className="text-gray-300 text-sm">
            Acceso completo por 2 horas sin costo
          </p>
        </div>

        {/* Loading */}
        {loading && <Loading />}

        {/* Success State - Credenciales */}
        {success && credentials && !loading && (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm font-semibold mb-2">
                ✅ ¡Demo activa!
              </p>
              <p className="text-gray-300 text-xs">
                Las credenciales han sido enviadas a tu email. Revisa tu bandeja
                de entrada.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-xs font-semibold mb-1">
                  👤 Usuario
                </p>
                <p className="text-blue-400 font-mono text-sm break-all">
                  {credentials.username}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-xs font-semibold mb-1">
                  🔑 Contraseña
                </p>
                <p className="text-blue-400 font-mono text-sm break-all">
                  {credentials.password}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-400 text-xs font-semibold mb-1">
                  ⏱️ Válido por
                </p>
                <p className="text-yellow-400 font-semibold text-sm">
                  {credentials.horas_validas} horas
                </p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-400 text-xs">
                💡 Descarga la app JJSecure VPN desde Play Store o App Store e
                ingresa estas credenciales. Acceso válido por 2 horas.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Form State */}
        {!success && !loading && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div
                className={`rounded-lg p-4 text-sm ${
                  bloqueado
                    ? "bg-orange-500/15 border border-orange-500/40 text-orange-300"
                    : "bg-red-500/15 border border-red-500/40 text-red-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">
                    {bloqueado ? "⏳" : "❌"}
                  </span>
                  <div>
                    <p className="font-semibold mb-1">
                      {bloqueado ? "Demo bloqueada" : "Error"}
                    </p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nombre Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nombre o Alias
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                placeholder="Tu nombre"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="tu@email.com"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 space-y-2">
              <p className="text-gray-300 text-xs">
                <span className="font-semibold">✨ Incluye:</span>
              </p>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>✅ 2 horas de acceso completo</li>
                <li>✅ Todos los servidores disponibles</li>
                <li>✅ Velocidad sin limitaciones</li>
              </ul>
              <p className="text-gray-400 text-xs mt-3 pt-2 border-t border-blue-500/10">
                ⚠️ Solo puedes solicitar una demo cada 48 horas por email o IP
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || bloqueado}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {bloqueado ? "🔒 Bloqueado temporalmente" : "🎁 Solicitar Demo"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DemoModal;
