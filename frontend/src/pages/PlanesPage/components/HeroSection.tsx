import { MessageCircle, Signal, Zap } from "lucide-react";
import { PlanStatsConfig } from "../types";
import Lottie from "lottie-react";
import heroAnimation from "../../../assets/lottie/planes-hero.json";
import { protonColors } from "../../../styles/colors";

interface HeroSectionProps {
  config?: PlanStatsConfig | null;
  modoSeleccion: "compra" | "renovacion";
  onActivarModoCompra: () => void;
  onActivarModoRenovacion: () => void;
}

export function HeroSection({ config, modoSeleccion, onActivarModoCompra, onActivarModoRenovacion }: HeroSectionProps) {
  const stats = [
    { value: "99.9%", label: "Uptime", icon: Signal },
    { value: "24/7", label: "Soporte", icon: MessageCircle },
  ];

  return (
    <section className="relative py-12 md:py-16 xl:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16 text-center">
        {/* Badge de oferta */}
        <div 
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider mb-6"
          style={{ 
            backgroundColor: protonColors.green[300],
            color: protonColors.purple[900],
          }}
        >
          <Zap className="h-4 w-4" />
          <span>Oferta Especial</span>
        </div>

        <div className="space-y-4">
          <h1 
            className="text-3xl md:text-4xl xl:text-5xl font-bold"
            style={{ color: protonColors.white }}
          >
            {config?.titulo || "Elige tu Plan VPN"}
          </h1>
          <p 
            className="text-base md:text-lg xl:text-xl max-w-3xl mx-auto"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {config?.descripcion ||
              "Protege todos tus dispositivos con nuestra VPN premium. Sin límites, sin compromisos."}
          </p>
        </div>

        {/* Toggle Compra/Renovación */}
        <div className="flex justify-center mt-8 mb-12">
          <div 
            className="inline-flex items-center gap-1 rounded-full p-1"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <button
              onClick={onActivarModoCompra}
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200"
              style={
                modoSeleccion === "compra"
                  ? { backgroundColor: protonColors.green[300], color: protonColors.purple[900] }
                  : { backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.7)' }
              }
            >
              Comprar
            </button>
            <button
              onClick={onActivarModoRenovacion}
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200"
              style={
                modoSeleccion === "renovacion"
                  ? { backgroundColor: protonColors.green[300], color: protonColors.purple[900] }
                  : { backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.7)' }
              }
            >
              Renovar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl p-5 md:p-6"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Icon 
                  className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3" 
                  style={{ color: protonColors.green[300] }}
                />
                <p 
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: protonColors.white }}
                >
                  {stat.value}
                </p>
                <p 
                  className="text-sm md:text-base"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Lottie Animation */}
        <div className="flex items-center justify-center mt-8 md:mt-10 w-full">
          <div className="w-full max-w-xs mx-auto opacity-90">
            <Lottie animationData={heroAnimation as unknown as object} loop autoplay />
          </div>
        </div>
      </div>
    </section>
  );
}
