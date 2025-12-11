import { Shield, Zap, Clock } from "lucide-react";
import { PlanStatsConfig } from "../types";
import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";

interface HeroSectionProps {
  config?: PlanStatsConfig | null;
  modoSeleccion: "compra" | "renovacion";
  onActivarModoCompra: () => void;
  onActivarModoRenovacion: () => void;
}

export function HeroSection({ config, modoSeleccion, onActivarModoCompra, onActivarModoRenovacion }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white pt-8 md:pt-12 xl:pt-16 pb-8 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16 text-center">
        {/* Badge */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-purple-500 font-semibold mb-4">
          Planes VPN Premium
        </p>

        <div className="space-y-4 mb-8">
          <Title as="h1" center>
            {config?.titulo || "Elige tu Plan Perfecto"}
          </Title>
          <Subtitle center className="max-w-2xl mx-auto">
            {config?.descripcion ||
              "Protección completa para todos tus dispositivos. Sin límites de velocidad, sin compromisos."}
          </Subtitle>
        </div>

        {/* Stats rápidos */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8">
          {[
            { icon: Shield, label: "Cifrado militar", value: "AES-256" },
            { icon: Zap, label: "Velocidad", value: "Ilimitada" },
            { icon: Clock, label: "Soporte", value: "24/7" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 text-sm">
              <stat.icon className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">{stat.label}:</span>
              <span className="font-semibold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Toggle Compra/Renovación */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full p-1.5 bg-gray-100 shadow-inner">
            <button
              onClick={onActivarModoCompra}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                modoSeleccion === "compra"
                  ? "bg-white text-purple-700 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Nueva cuenta
            </button>
            <button
              onClick={onActivarModoRenovacion}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                modoSeleccion === "renovacion"
                  ? "bg-white text-purple-700 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Renovar cuenta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
