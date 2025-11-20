import { MessageCircle, Signal } from "lucide-react";
import { PlanStatsConfig } from "../types";
import Lottie from "lottie-react";
import heroAnimation from "../../../assets/lottie/planes-hero.json";

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
    <section className="bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white py-8 sm:py-12 lg:py-16 xl:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        {config?.promocion?.habilitada && config.promocion.texto && (
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-700 font-semibold mb-6">
            {config.promocion.texto}
          </p>
        )}

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-indigo-700 mb-6">
          <span>Planes VPN</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900">
            {config?.titulo || "Planes VPN"}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600">
            {config?.descripcion ||
              "Selecciona la duración y cantidad de dispositivos que necesitas. Sin sorpresas, sin compromisos ocultos."}
          </p>
        </div>

        {/* Toggle Compra/Renovación */}
        <div className="flex justify-center mt-8 mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={onActivarModoCompra}
              className={`px-6 py-2 rounded-full font-medium transition ${
                modoSeleccion === "compra"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Comprar
            </button>
            <button
              onClick={onActivarModoRenovacion}
              className={`px-6 py-2 rounded-full font-medium transition ${
                modoSeleccion === "renovacion"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Renovar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10"
              >
                <Icon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 text-indigo-600 mx-auto mb-4" />
                <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Lottie Animation */}
        <div className="flex items-center justify-center mt-8 sm:mt-10 lg:mt-12 xl:mt-16 w-full">
          <div className="w-full max-w-sm mx-auto">
            <Lottie animationData={heroAnimation as unknown as object} loop autoplay />
          </div>
        </div>
      </div>
    </section>
  );
}
