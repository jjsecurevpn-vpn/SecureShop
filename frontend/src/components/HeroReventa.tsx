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
    // Open Telegram support
    window.open("https://t.me/+rAuU1_uHGZthMWZh", "_blank");
  };

  return (
    <section className="relative pt-32 md:pt-36 pb-16 md:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center px-2 md:px-0">
          {/* Banner de Promoción - Más prominente */}
          {heroConfig?.promocion?.habilitada && (
            <div className="mb-8">
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

          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-neutral-200 mb-6 break-words px-2">
            {heroConfig?.titulo || "Sé Revendedor VPN"}
          </h1>

          <p className="text-base md:text-lg text-neutral-400 mb-8 break-words px-2">
            {heroConfig?.descripcion ||
              "Gana dinero vendiendo acceso VPN premium a tus clientes"}
          </p>

          {/* Temporizador de Promoción - Más prominente */}
          <div className="mb-8">
            <PromoTimerRevendedores />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-12 max-w-2xl mx-auto">
            {[
              {
                value: "99.9%",
                label: "Uptime",
                icon: <Signal className="w-4 h-4" />,
              },
              {
                value: "24/7",
                label: "Soporte",
                icon: <MessageCircle className="w-4 h-4" />,
              },
              {
                value: totalRevendedores > 0 ? `${totalRevendedores}+` : "...",
                label: "Revendedores",
                icon: <Users className="w-4 h-4" />,
              },
              {
                value: "Premium",
                label: "Calidad",
                icon: <Shield className="w-4 h-4" />,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 md:p-4 hover:border-neutral-700 transition-colors min-h-[80px] md:min-h-[100px] flex flex-col justify-center"
              >
                <div className="flex justify-center mb-2 text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-lg md:text-2xl font-bold text-neutral-200 mb-1 text-center break-words">
                  {stat.value}
                </div>
                <div className="text-xs md:text-xs text-neutral-500 text-center break-words">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <button
              onClick={handleComenzarAhora}
              className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white transition-colors w-full sm:w-auto"
            >
              <Users className="w-4 h-4" />
              <span className="break-words">Comenzar ahora</span>
            </button>
            <button
              onClick={handleContactarSoporte}
              className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-semibold text-neutral-200 transition-colors w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="break-words">Contactar soporte</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
