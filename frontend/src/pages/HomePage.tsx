import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Home, BarChart3, Users } from "lucide-react";
import { apiService } from "../services/api.service";
import HeroSection from "../sections/HeroSection";
import ServerStatsSection from "../sections/ServerStatsSection";
import LatestUsersSection from "../sections/LatestUsersSection";
import MobilePageHeader from "../components/MobilePageHeader";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";

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
      <MobilePageHeader
        title="JJSecure VPN"
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Sidebar */}
      <NavigationSidebar
        title="JJSecure VPN"
        subtitle="Navega por la página"
        sections={homeSections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sectionIdPrefix="section-"
      />

      {/* Mobile Bottom Sheet Navigation */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
      >
        {homeSections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setIsMobileMenuOpen(false);
              const element = document.getElementById(`section-${section.id}`);
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
      </BottomSheet>

      {/* Main Content */}
      <main className="md:ml-[312px]">
        {/* Hero Section */}
        <div id="section-hero">
          <HeroSection />
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
