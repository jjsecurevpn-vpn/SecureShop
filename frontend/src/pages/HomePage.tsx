import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "../services/api.service";
import { PromoHeader } from "../components/PromoHeader";
import HeroSection from "../sections/HeroSection";
import AppDownloadSection from "../sections/AppDownloadSection";
import InfrastructureFeaturesSection from "../sections/InfrastructureFeaturesSection";

interface HomePageProps {
  // Props vacío - HomePage no necesita parámetros
}

const HomePage = ({}: HomePageProps) => {
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
    <div className="bg-white text-neutral-900">
      {/* Main Content */}
      <main className="md:ml-14">
        {/* Promo Banner Header */}
        <PromoHeader />

        {/* Hero Section */}
        <div id="section-hero">
          <HeroSection />
        </div>

        {/* App Download Section */}
        <div id="section-app">
          <AppDownloadSection />
        </div>

        {/* Infrastructure highlights section */}
        <InfrastructureFeaturesSection />
      </main>
    </div>
  );
};

export default HomePage;
