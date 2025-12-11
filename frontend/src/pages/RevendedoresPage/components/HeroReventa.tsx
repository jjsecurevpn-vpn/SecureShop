import React from "react";
import { ArrowRight, MessageCircle, Shield, Signal, Sparkles, Users } from "lucide-react";
import { useHeroConfigRevendedores } from "../../../hooks/useHeroConfigRevendedores";
import { useRevendedoresCount } from "../../../hooks/useRevendedoresCount";
import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { Button } from "../../../components/Button";

export default function HeroReventa() {
  // Configuración del hero
  const { config: heroConfig } = useHeroConfigRevendedores();
  // Conteo de revendedores
  const { totalRevendedores } = useRevendedoresCount();

  const handleComenzarAhora = () => {
    // Scroll to plans section
    const plansSection = document.getElementById("planes-section");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactarSoporte = () => {
    // Open WhatsApp support
    window.open("https://wa.me/5493812531123", "_blank");
  };

  const stats = [
    { value: "99.9%", label: "Uptime", icon: <Signal className="w-4 h-4" /> },
    { value: "24/7", label: "Soporte", icon: <MessageCircle className="w-4 h-4" /> },
    { value: totalRevendedores > 0 ? `${totalRevendedores}+` : "...", label: "Revendedores", icon: <Users className="w-4 h-4" /> },
    { value: "Premium", label: "Calidad", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <section className="relative bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white py-8 md:py-12 xl:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16">
        <div className="w-full space-y-4 md:space-y-6 xl:space-y-8 text-center">
            {heroConfig?.promocion?.habilitada && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300 bg-emerald-50 px-4 sm:px-5 lg:px-6 xl:px-7 py-2 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] sm:text-sm">
                    {heroConfig.promocion.texto}
                  </span>
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-700 sm:text-xs">
              <Sparkles className="h-3 w-3 sm:w-4 sm:h-4" />
              Programa de Revendedores
            </div>

            <div className="space-y-4">
              <Title as="h1">
                {heroConfig?.titulo || "Sé Revendedor VPN"}
              </Title>
              <Subtitle className="max-w-2xl mx-auto">
                {heroConfig?.descripcion || "Gana dinero vendiendo acceso VPN premium a tus clientes"}
              </Subtitle>
            </div>

            <div className="grid gap-2 sm:gap-3 lg:gap-4 xl:gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center rounded-2xl px-4 py-3 shadow-[2px_4px_8px_-3px_rgba(0,0,0,0.08),-2px_4px_8px_-3px_rgba(0,0,0,0.08)]"
                >
                  <div className="mb-1 text-emerald-600">{React.cloneElement(stat.icon, { className: "w-3 h-3 sm:w-4 sm:h-4" })}</div>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg">{stat.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-600 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center flex-wrap">
              <Button
                onClick={handleComenzarAhora}
                variant="primary"
                size="md"
                fullWidthMobile
                className="group"
              >
                Comenzar ahora
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={handleContactarSoporte}
                variant="secondary"
                size="md"
                fullWidthMobile
              >
                <MessageCircle className="h-4 w-4" />
                Contactar soporte
              </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
