import React from "react";
import { ArrowRight, MessageCircle, Shield, Signal, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useHeroConfigRevendedores } from "../../../hooks/useHeroConfigRevendedores";
import { useRevendedoresCount } from "../../../hooks/useRevendedoresCount";
import { HeroTitle, LeadText, SmallText } from "../../../components/Typography";

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
    { value: "99.9%", label: "Uptime", icon: Signal },
    { value: "24/7", label: "Soporte", icon: MessageCircle },
    { value: totalRevendedores > 0 ? `${totalRevendedores}+` : "...", label: "Revendedores", icon: Users },
    { value: "Premium", label: "Calidad", icon: Shield },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge animado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm border border-purple-200/60 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-700" />
          <SmallText className="text-gray-700">Programa de Revendedores</SmallText>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <HeroTitle className="mb-4 sm:mb-6">
            {heroConfig?.titulo || "Sé Revendedor VPN"}
          </HeroTitle>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <LeadText className="text-base sm:text-lg lg:text-xl">
            {heroConfig?.descripcion || "Gana dinero vendiendo acceso VPN premium a tus clientes"}
          </LeadText>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 px-4 py-4 shadow-sm"
            >
              <div className="mb-2 text-purple-600">
                {React.createElement(stat.icon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
              <SmallText className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">{stat.label}</SmallText>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center gap-3 justify-center"
        >
          <button
            onClick={handleComenzarAhora}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold text-sm hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-500/25"
          >
            Comenzar ahora
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
          <button
            onClick={handleContactarSoporte}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-purple-300 hover:text-purple-600 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar soporte
          </button>
        </motion.div>
      </div>
    </section>
  );
}
