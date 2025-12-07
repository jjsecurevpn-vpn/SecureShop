import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Gift } from "lucide-react";
import DemoModal from "../components/DemoModal";
import { Button } from "../components/Button";
import { Title } from "../components/Title";
import { Subtitle } from "../components/Subtitle";
import { protonColors } from "../styles/colors";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const goToPlans = () => navigate("/planes");
  const goToResellers = () => navigate("/revendedores");

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <section id="hero-section" className="bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16 pt-8 md:pt-12 xl:pt-16 pb-8 md:pb-12 xl:pb-16">
          {/* Contenido centrado */}
          <div className="flex flex-col items-center text-center gap-6 md:gap-8 min-h-auto justify-center">
            {/* Badge */}
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-500 font-semibold">
              De los creadores de JJSecure VPN
            </p>

            {/* Título */}
            <div className="w-full max-w-3xl space-y-4">
              <Title as="h1">
                VPN Premium. Protege tu Privacidad.
              </Title>
              <Subtitle className="max-w-2xl mx-auto">
                <strong className="font-semibold" style={{ color: protonColors.gray[800] }}>Experimenta la verdadera libertad online.</strong>{" "}
                Obtenga acceso sin restricciones a contenido global, bloquee anuncios molestos y proteja su privacidad con una VPN rápida y segura.
              </Subtitle>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center flex-wrap">
              <Button
                onClick={goToPlans}
                variant="primary"
                size="md"
                fullWidthMobile
                className="group"
              >
                Ver planes
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => setIsDemoOpen(true)}
                variant="success"
                size="md"
                fullWidthMobile
              >
                <Gift className="h-4 w-4" />
                Prueba Gratuita
              </Button>
              <Button
                onClick={goToResellers}
                variant="secondary"
                size="md"
                fullWidthMobile
              >
                <Users className="h-4 w-4" />
                Ser revendedor
              </Button>
            </div>
            <p className="text-xs text-gray-500">Garantía de reembolso si no te sirve</p>
          </div>
        </div>

        {/* Imagen - Desktop y Móvil - Fuera del contenedor max-w-7xl */}
        <div className="w-full px-4 md:px-8 pb-8 md:pb-12 xl:pb-16">
          {/* Imagen para móvil */}
          <img
            src="/SecureVPNMovil.avif"
            alt="JJSecure VPN App"
            className="md:hidden w-full h-auto drop-shadow-2xl"
          />
          {/* Imagen para desktop */}
          <img
            src="/SecureVPN.avif"
            alt="JJSecure VPN App"
            className="hidden md:block w-full h-auto drop-shadow-2xl"
          />
        </div>
      </section>
    </>
  );
}
