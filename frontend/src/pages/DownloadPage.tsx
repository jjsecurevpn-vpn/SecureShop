import { Link } from "react-router-dom";
import {
  Download,
  Shield,
  Zap,
  Globe,
  Users,
  ExternalLink,
  Code,
  Database,
  Lock,
  Cloud,
  Activity,
} from "lucide-react";

interface DownloadPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const DownloadPage = ({ isMobileMenuOpen: _, setIsMobileMenuOpen: __ }: DownloadPageProps) => {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Hero Section - Supabase Welcome Style */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/20 border border-purple-900/30 rounded-full mb-6">
            <Download className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-medium text-purple-300">
              JJSecure VPN
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight mb-4 text-white">
            Descarga JJSecure VPN
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Tu conexión segura está lista. Descarga la app y conéctate con
            privacidad total.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="https://play.google.com/store/apps/details?id=com.jjsecure.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-emerald-900/20 text-white hover:text-emerald-400 border border-white/10 hover:border-emerald-400/30 rounded-xl font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Descargar en Play Store
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              to="/planes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-purple-900/20 text-white hover:text-purple-300 border border-white/10 hover:border-purple-400/30 rounded-xl font-medium transition-all"
            >
              Ver Planes
            </Link>
          </div>
        </div>

        {/* Quick Start / Features Grid - Like Supabase Templates */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8 text-white">
            Comienza rápidamente
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-400/30 transition-all">
              <Shield className="w-8 h-8 text-purple-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-center text-white">
                Seguridad Total
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Encriptación AES-256 para datos seguros.
              </p>
            </div>
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-emerald-400/30 transition-all">
              <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-center text-white">
                Velocidad Máxima
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Conexiones ultrarrápidas sin límites.
              </p>
            </div>
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-400/30 transition-all">
              <Globe className="w-8 h-8 text-purple-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-center text-white">
                Acceso Global
              </h3>
              <p className="text-sm text-gray-400 text-center">
                +100 servidores en todo el mundo.
              </p>
            </div>
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-emerald-400/30 transition-all">
              <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-center text-white">
                Fácil de Usar
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Interfaz intuitiva para todos.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer - Two Column like Supabase Products */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8 text-white">
            Lo que ofrecemos
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-300" />
                Características Principales
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                  Conexión automática a servidores optimizados
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                  Bloqueo de anuncios y malware integrado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                  Modo kill switch para máxima seguridad
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                  Soporte para múltiples dispositivos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                  Actualizaciones automáticas y silenciosas
                </li>
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Planes Flexibles
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Plan mensual: $9.99/mes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Plan anual: $49.99/año (ahorra 58%)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Plan de por vida: $99.99 (una sola vez)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Garantía de devolución de 30 días
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Soporte técnico 24/7
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Explore Other Products - Like Supabase Cards */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8 text-white">
            Explora más
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <Lock className="w-8 h-8 text-purple-300 mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-white">Autenticación</h3>
              <p className="text-sm text-gray-500">
                Gestión de usuarios segura.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <Cloud className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-white">Almacenamiento</h3>
              <p className="text-sm text-gray-500">
                Archivos ilimitados y rápidos.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <Activity className="w-8 h-8 text-purple-300 mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-white">Realtime</h3>
              <p className="text-sm text-gray-500">
                Conexiones en tiempo real.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <Code className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-white">Funciones</h3>
              <p className="text-sm text-gray-500">
                Código serverless escalable.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action - Supabase CTA Style */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4 text-white">
            ¡Comienza a proteger tu privacidad hoy!
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Descarga la aplicación y disfruta de una experiencia segura y fluida
            en línea.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://play.google.com/store/apps/details?id=com.jjsecure.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900/20 hover:bg-purple-900/20 text-emerald-400 hover:text-purple-300 border border-emerald-900/30 hover:border-purple-900/30 rounded-xl font-medium transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Descargar para Android
            </a>
            <Link
              to="/planes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl font-medium transition-all"
            >
              Ver Planes de Suscripción
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/planes"
              className="text-purple-300 hover:text-emerald-400 transition-colors"
            >
              Ver planes
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
