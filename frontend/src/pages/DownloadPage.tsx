import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Shield,
  Zap,
  Globe,
  Users,
  Smartphone,
  Wifi,
  Lock,
  Cpu,
  BarChart3,
} from "lucide-react";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";

interface DownloadPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const DownloadPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: DownloadPageProps) => {
  const [activeSection, setActiveSection] = useState("descarga");

  const sections = [
    { id: "descarga", label: "Descarga", icon: <Download className="w-4 h-4" /> },
    { id: "caracteristicas", label: "Características", icon: <Wifi className="w-4 h-4" /> },
    { id: "compatibilidad", label: "Compatibilidad", icon: <Smartphone className="w-4 h-4" /> },
    { id: "rendimiento", label: "Rendimiento", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen text-white font-sans">
      {/* Sidebar - Desktop */}
      <NavigationSidebar
        title="Descargar JJSecure"
        subtitle="Obtén la app ahora"
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        <div className="p-6 border-t border-white/5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Información
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Versión</span>
              <span className="font-medium text-emerald-400">3.5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tamaño</span>
              <span className="font-medium text-purple-300">25.4 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rating</span>
              <span className="font-medium text-emerald-400">4.8/5</span>
            </div>
          </div>
        </div>
      </NavigationSidebar>

      {/* Main Content */}
      <main className="md:ml-[312px] pt-4 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Hero */}
          <div className="mb-20 mt-16 md:mt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/20 rounded-full mb-6 border border-emerald-900/30">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-300">
                Disponible Ahora
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 text-center lg:text-left">
              Descarga JJSecure
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-purple-300 to-emerald-400">
                VPN para Android
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed text-center lg:text-left">
              Tu conexión segura en tu bolsillo. Descarga la app y conéctate con privacidad total desde cualquier lugar.
            </p>

            <div className="flex flex-col gap-4 justify-center max-w-xs mx-auto sm:max-w-none sm:flex-row sm:mx-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.jjsecure.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <img 
                  src="/GetItOnGooglePlay_Badge_Web_color_Spanish.svg" 
                  alt="Descargar en Google Play"
                  className="h-12 w-full sm:w-auto"
                />
              </a>
              <Link
                to="/planes"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 px-6 py-3 rounded-xl font-medium transition-all w-full sm:w-auto"
              >
                Ver Planes
              </Link>
            </div>
          </div>

          {/* Download Section */}
          <section
            id="descarga"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "descarga"
                ? "ring-2 ring-emerald-400 bg-emerald-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-emerald-900/20 flex items-center justify-center border border-emerald-400/30">
                <Download className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Descarga Rápida</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold">Android</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Descarga directamente desde Google Play Store. Compatibilidad con Android 7.0 o superior.
                </p>
                <a
                  href="https://play.google.com/store/apps/details?id=com.jjsecure.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-90 transition-opacity"
                >
                  <img 
                    src="/GetItOnGooglePlay_Badge_Web_color_Spanish.svg" 
                    alt="Descargar en Google Play"
                    className="h-8"
                  />
                </a>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-300" />
                  <h3 className="font-semibold">Estadísticas</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Descargas</span>
                    <span className="text-emerald-400 font-medium">100K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating</span>
                    <span className="text-emerald-400 font-medium">4.8/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamaño</span>
                    <span className="text-emerald-400 font-medium">25.4 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Características Section */}
          <section
            id="caracteristicas"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "caracteristicas"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-purple-900/20 flex items-center justify-center border border-purple-400/30">
                <Wifi className="w-4 h-4 text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold">Características Principales</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: "Encriptación AES-256",
                  desc: "Protección de nivel militar para todos tus datos.",
                  color: "purple",
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: "Velocidad Máxima",
                  desc: "Conexiones ultrarrápidas sin limitaciones de ancho de banda.",
                  color: "emerald",
                },
                {
                  icon: <Globe className="w-5 h-5" />,
                  title: "Acceso Global",
                  desc: "Más de 100 servidores en 50+ países alrededor del mundo.",
                  color: "purple",
                },
                {
                  icon: <Lock className="w-5 h-5" />,
                  title: "Kill Switch",
                  desc: "Protección automática si la conexión se cae.",
                  color: "emerald",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded bg-${item.color}-900/20 flex items-center justify-center mb-4 border border-${item.color}-400/30`}
                  >
                    <div className={`text-${item.color}-400`}>{item.icon}</div>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Compatibilidad Section */}
          <section
            id="compatibilidad"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "compatibilidad"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-purple-900/20 flex items-center justify-center border border-purple-400/30">
                <Smartphone className="w-4 h-4 text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold">Compatibilidad</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-emerald-900/20 flex items-center justify-center border border-emerald-400/30">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Android 7.0+</h3>
                    <p className="text-sm text-gray-400">Compatible con la mayoría de dispositivos Android modernos.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-purple-900/20 flex items-center justify-center border border-purple-400/30">
                    <Users className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Múltiples Dispositivos</h3>
                    <p className="text-sm text-gray-400">Usa tu cuenta en hasta 5 dispositivos simultáneamente.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-emerald-900/20 flex items-center justify-center border border-emerald-400/30">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Bajo Consumo</h3>
                    <p className="text-sm text-gray-400">Optimizado para no drenar la batería de tu teléfono.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rendimiento Section */}
          <section
            id="rendimiento"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "rendimiento"
                ? "ring-2 ring-emerald-400 bg-emerald-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-emerald-900/20 flex items-center justify-center border border-emerald-400/30">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Rendimiento</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">99.9%</div>
                <h3 className="font-semibold mb-2">Disponibilidad</h3>
                <p className="text-sm text-gray-400">Servidores confiables y disponibles 24/7.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-300 mb-2">~50ms</div>
                <h3 className="font-semibold mb-2">Latencia</h3>
                <p className="text-sm text-gray-400">Conexiones rápidas sin lag perceptible.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">500+</div>
                <h3 className="font-semibold mb-2">Mbps</h3>
                <p className="text-sm text-gray-400">Velocidad máxima de conexión garantizada.</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <div className="text-center bg-white/5 border border-white/10 rounded-xl p-8 mt-12">
            <h2 className="text-2xl font-bold mb-3">¿Listo para conectar?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Descarga la app ahora y accede a internet con privacidad total.
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <a
                href="https://play.google.com/store/apps/details?id=com.jjsecure.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90 transition-opacity"
              >
                <img 
                  src="/GetItOnGooglePlay_Badge_Web_color_Spanish.svg" 
                  alt="Descargar en Google Play"
                  className="h-12"
                />
              </a>
              <Link
                to="/planes"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 px-6 py-3 rounded-xl font-medium transition-all"
              >
                Ver Planes
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setIsMobileMenuOpen(false);
              setTimeout(() => {
                document
                  .getElementById(section.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
              activeSection === section.id
                ? "bg-emerald-900/20 text-emerald-300"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </BottomSheet>
    </div>
  );
};

export default DownloadPage;
