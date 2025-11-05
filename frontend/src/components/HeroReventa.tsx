import { Shield, MessageCircle, Users, Sparkles, Signal } from "lucide-react";
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

  return (
    <section className="relative pt-4 md:pt-12 pb-16 md:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Contenido de texto */}
          <div className="max-w-3xl text-center lg:text-left px-2 md:px-0">
            {/* Banner de Promoción - Más prominente */}
            {heroConfig?.promocion?.habilitada && (
              <div className="mb-8 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 rounded-full px-6 py-3 shadow-lg shadow-blue-500/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-semibold">
                    {heroConfig.promocion.texto}
                  </span>
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Programa de Revendedores
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-neutral-200 mb-6 break-words px-2 lg:px-0">
              {heroConfig?.titulo || "Sé Revendedor VPN"}
            </h1>

            <p className="text-base md:text-lg text-neutral-400 mb-8 break-words px-2 lg:px-0">
              {heroConfig?.descripcion ||
                "Gana dinero vendiendo acceso VPN premium a tus clientes"}
            </p>

            {/* Temporizador de Promoción - Más prominente */}
            <div className="mb-8">
              <PromoTimerRevendedores />
            </div>

            {/* Stats */}
            <div className="grid gap-2 md:gap-3 mb-12 w-full" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))" }}>
              {[
                {
                  value: "99.9%",
                  label: "Uptime",
                  icon: <Signal className="w-4 h-4 md:w-5 md:h-5" />,
                },
                {
                  value: "24/7",
                  label: "Soporte",
                  icon: <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />,
                },
                {
                  value: totalRevendedores > 0 ? `${totalRevendedores}+` : "...",
                  label: "Revendedores",
                  icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
                },
                {
                  value: "Premium",
                  label: "Calidad",
                  icon: <Shield className="w-4 h-4 md:w-5 md:h-5" />,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all group min-h-[100px]"
                >
                  <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-all mb-1.5">
                    <div className="text-blue-400">{stat.icon}</div>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white text-center">
                    {stat.value}
                  </div>
                  <div className="text-xs text-neutral-400 text-center font-medium mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start px-4 lg:px-0">
              <button
                onClick={handleComenzarAhora}
                className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white transition-colors w-full sm:w-auto"
              >
                <Users className="w-4 h-4" />
                <span className="break-words">Comenzar ahora</span>
              </button>
              <button
                onClick={handleContactarSoporte}
                className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-sm font-semibold text-neutral-200 transition-colors w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="break-words">Contactar soporte</span>
              </button>
            </div>
          </div>

          {/* Imagen del Panel */}
          <div className="flex justify-center mt-8 md:mt-0 lg:justify-end">
            <div className="relative w-full md:w-auto">
              {/* Glow sutil */}
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full" />
              
              {/* Imagen */}
              <div className="relative z-10 px-4 md:px-0">
                <img
                  src="/PanelReventa.png"
                  alt="Panel de Revendedores"
                  className="w-full md:max-w-lg h-auto object-contain drop-shadow-xl rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
