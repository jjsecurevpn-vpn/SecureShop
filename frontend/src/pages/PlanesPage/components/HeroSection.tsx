import { Shield, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PlanStatsConfig } from "../types";
import { HeroTitle, LeadText } from "../../../components/Typography";

interface HeroSectionProps {
  config?: PlanStatsConfig | null;
  modoSeleccion: "compra" | "renovacion";
  onActivarModoCompra: () => void;
  onActivarModoRenovacion: () => void;
}

export function HeroSection({ config, modoSeleccion, onActivarModoCompra, onActivarModoRenovacion }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge animado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm border border-purple-200/60 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-purple-700">Planes VPN Premium</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <HeroTitle as="h1" className="mb-4 sm:mb-6">
            {config?.titulo || "Elige tu Plan Perfecto"}
          </HeroTitle>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LeadText as="p" className="max-w-2xl mx-auto mb-8 text-base sm:text-lg lg:text-xl">
            {config?.descripcion ||
              "Protección completa para todos tus dispositivos. Sin límites de velocidad, sin compromisos."}
          </LeadText>
        </motion.div>

        {/* Stats rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8"
        >
          {[
            { icon: Shield, label: "Cifrado AES-256" },
            { icon: Zap, label: "Velocidad ilimitada" },
            { icon: Clock, label: "Soporte 24/7" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/70 backdrop-blur-sm border border-purple-200/60 text-gray-700"
            >
              <stat.icon className="w-4 h-4 text-purple-500" />
              {stat.label}
            </div>
          ))}
        </motion.div>

        {/* Toggle Compra/Renovación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-full p-1.5 bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg shadow-purple-500/5">
            <button
              onClick={onActivarModoCompra}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                modoSeleccion === "compra"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : "text-gray-600 hover:text-purple-800 hover:bg-purple-50"
              }`}
            >
              Nueva cuenta
            </button>
            <button
              onClick={onActivarModoRenovacion}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                modoSeleccion === "renovacion"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : "text-gray-600 hover:text-purple-800 hover:bg-purple-50"
              }`}
            >
              Renovar cuenta
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
