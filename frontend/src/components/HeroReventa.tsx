import React from "react";
import { ArrowRight, MessageCircle, Shield, Signal, Sparkles, Users } from "lucide-react";
import { PromoTimerRevendedores } from "./PromoTimerRevendedores";
import { useHeroConfigRevendedores } from "../hooks/useHeroConfigRevendedores";
import { useRevendedoresCount } from "../hooks/useRevendedoresCount";

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
    <section className="bg-white py-12 sm:py-16 lg:py-20 xl:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-center">
          <div className="w-full space-y-6 sm:space-y-7 lg:space-y-8 xl:space-y-10 text-center">
            {heroConfig?.promocion?.habilitada && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300 bg-emerald-50 px-4 sm:px-5 lg:px-6 xl:px-7 py-2 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] sm:text-sm lg:text-base xl:text-lg">
                    {heroConfig.promocion.texto}
                  </span>
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-700 sm:text-xs lg:text-sm xl:text-base">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
              Programa de Revendedores
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900">
                {heroConfig?.titulo || "Sé Revendedor VPN"}
              </h1>
              <p className="text-sm text-gray-600 sm:text-base lg:text-lg xl:text-xl">
                {heroConfig?.descripcion || "Gana dinero vendiendo acceso VPN premium a tus clientes"}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-5 lg:p-6 xl:p-7 shadow-sm shadow-gray-100">
              <PromoTimerRevendedores />
            </div>

            <div className="grid gap-2 sm:gap-3 lg:gap-4 xl:gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center rounded-2xl px-4 py-3 shadow-[2px_4px_8px_-3px_rgba(0,0,0,0.08),-2px_4px_8px_-3px_rgba(0,0,0,0.08)]"
                >
                  <div className="mb-1 text-emerald-600">{React.cloneElement(stat.icon, { className: "w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" })}</div>
                  <p className="text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl xl:text-3xl">{stat.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-600 sm:text-xs lg:text-sm xl:text-base">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleComenzarAhora}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 sm:px-8 lg:px-10 xl:px-12 py-3 sm:py-3.5 lg:py-4 xl:py-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 sm:text-base lg:text-lg xl:text-xl"
              >
                Comenzar ahora
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
              </button>
              <button
                onClick={handleContactarSoporte}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-indigo-600 bg-white px-6 sm:px-8 lg:px-10 xl:px-12 py-3 sm:py-3.5 lg:py-4 xl:py-5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white sm:text-base lg:text-lg xl:text-xl"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                Contactar soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
