import { Zap } from "lucide-react";
import { PlanStatsConfig } from "../types";
import { protonColors } from "../../../styles/colors";
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
          <Title as="h1" center className="!text-white">
            {config?.titulo || "Elige tu Plan VPN"}
          </Title>
          <Subtitle center className="max-w-3xl mx-auto !text-white/70">
            {config?.descripcion ||
              "Protege todos tus dispositivos con nuestra VPN premium. Sin límites, sin compromisos."}
          </Subtitle>
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
        {/* Removed stats cards for 2026 */}
      </div>
    </section>
  );
}
