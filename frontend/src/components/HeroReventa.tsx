import {
  Shield,
  MessageCircle,
  Users,
  CreditCard,
  Calendar,
} from "lucide-react";
import { PromoTimerRevendedores } from "./PromoTimerRevendedores";
import { useHeroConfigRevendedores } from "../hooks/useHeroConfigRevendedores";

export default function HeroReventa() {
  // Configuración del hero
  const { config: heroConfig } = useHeroConfigRevendedores();

  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      {/* Efecto de luz sutil */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-3xl rounded-full"></div>

      {/* Banner de Promoción */}
      {heroConfig?.promocion?.habilitada && (
        <div className="w-full pt-4 pb-2 px-4 text-center">
          <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
            <p className="text-xs text-white">{heroConfig.promocion.texto}</p>
          </div>
        </div>
      )}

      {/* Temporizador de Promoción */}
      <PromoTimerRevendedores />

      {/* Contenido principal */}
      <div className="relative container mx-auto px-6 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Contenido textual */}
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            {/* Badge minimalista */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-neutral-400">
                Programa de Revendedores
              </span>
            </div>

            {/* Título compacto */}
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Conviértete en Revendedor
              </h1>
              <p className="text-sm text-neutral-400 max-w-md mx-auto lg:mx-0">
                Elige tu modelo: Créditos para consistencia o Validez para
                flexibilidad.
              </p>
            </div>

            {/* Features ultra-compactos */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                <span>Sistema de Créditos</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Calendar className="w-3.5 h-3.5 text-green-500" />
                <span>Validez Flexible</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Panel Propio</span>
              </div>
            </div>

            {/* Links secundarios */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Users className="w-3.5 h-3.5" />
                <span>+1000 Revendedores</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Imagen del panel de reventa */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow sutil */}
              <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />

              {/* Panel mockup */}
              <div className="relative z-10">
                <img
                  src="/PanelReventa.png"
                  alt="Panel de Revendedor JJSecure"
                  className="w-72 sm:w-96 lg:w-[28rem] h-auto object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
