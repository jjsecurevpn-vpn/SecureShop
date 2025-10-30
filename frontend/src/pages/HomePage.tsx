import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Home, Download, BarChart3, Users, Menu } from "lucide-react";
import { apiService } from "../services/api.service";
import HeroSection from "../sections/HeroSection";
import AppDownloadSection from "../sections/AppDownloadSection";
import ServerStatsSection from "../sections/ServerStatsSection";
import LatestUsersSection from "../sections/LatestUsersSection";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Verificar si el usuario vuelve de MercadoPago
  useEffect(() => {
    const status = searchParams.get("status");
    const pagoId = searchParams.get("pago_id");

    if (status && pagoId) {
      verificarPago(pagoId);
      // Limpiar los parámetros de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const verificarPago = async (pagoId: string) => {
    try {
      const pago = await apiService.obtenerPago(pagoId);

      if (pago.estado === "aprobado" && pago.servex_username) {
        // Redirigir a página de éxito con las credenciales
        window.location.href = `/success?pago_id=${pagoId}`;
      }
    } catch (err) {
      console.error("Error verificando pago:", err);
    }
  };

  const homeSections = [
    {
      id: "hero",
      label: "Inicio",
      subtitle: "Bienvenido",
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: "app-download",
      label: "Aplicación",
      subtitle: "Descarga la app",
      icon: <Download className="w-4 h-4" />,
    },
    {
      id: "server-stats",
      label: "Estadísticas",
      subtitle: "Servidores en tiempo real",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "latest-users",
      label: "Usuarios",
      subtitle: "Últimos registrados",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Mobile Header */}
      <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between fixed top-12 left-0 right-0 z-30">
        <h1 className="text-lg font-semibold text-white">JJSecure VPN</h1>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-neutral-800 bg-neutral-900/50 fixed left-14 top-12 bottom-0 overflow-y-auto z-20 transition-all duration-300">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-2">JJSecure VPN</h2>
          <p className="text-sm text-neutral-400">Navega por la página</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {homeSections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => {
                    setActiveSection(section.id);
                    const element = document.getElementById(
                      `section-${section.id}`
                    );
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50 border border-transparent"
                  }`}
                >
                  {section.icon}
                  <div className="text-left">
                    <div>{section.label}</div>
                    <div className="text-xs opacity-70">{section.subtitle}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Bottom Sheet Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 rounded-t-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Navegación</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-2">
              {homeSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsMobileMenuOpen(false);
                    const element = document.getElementById(
                      `section-${section.id}`
                    );
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  }`}
                >
                  {section.icon}
                  <div className="text-left">
                    <div>{section.label}</div>
                    <div className="text-xs opacity-70">{section.subtitle}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72">
        {/* Hero Section */}
        <div id="section-hero">
          <HeroSection />
        </div>

        {/* App Download Section */}
        <div id="section-app-download">
          <AppDownloadSection />
        </div>

        {/* Server Stats - Real Time */}
        <div id="section-server-stats">
          <ServerStatsSection />
        </div>

        {/* Latest Users */}
        <div id="section-latest-users">
          <LatestUsersSection />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
