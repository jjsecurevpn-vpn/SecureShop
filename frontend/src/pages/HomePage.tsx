import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "../services/api.service";
import HeroSection from "../sections/HeroSection";
import AppDownloadSection from "../sections/AppDownloadSection";
import ServerStatsSection from "../sections/ServerStatsSection";
import LatestUsersSection from "../sections/LatestUsersSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import AboutSection from "../sections/AboutSection";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* App Download Section */}
      <AppDownloadSection />

      {/* Server Stats - Real Time */}
      <ServerStatsSection />

      {/* Latest Users */}
      <LatestUsersSection />

      {/* Testimonials & Community */}
      <TestimonialsSection />

      {/* About Section */}
      <AboutSection />
    </div>
  );
};

export default HomePage;
