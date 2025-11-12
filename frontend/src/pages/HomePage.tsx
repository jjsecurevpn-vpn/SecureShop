import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Home, BarChart3, Users } from "lucide-react";
import { apiService } from "../services/api.service";
import HeroSection from "../sections/HeroSection";
import ServerStatsSection from "../sections/ServerStatsSection";
import LatestUsersSection from "../sections/LatestUsersSection";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";

interface HomePageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const HomePage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: HomePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
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
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {homeSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-violet-900/20 text-violet-300"
                  : "text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
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
