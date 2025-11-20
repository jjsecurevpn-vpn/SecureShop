import { Zap } from "lucide-react";
import Lottie from "lottie-react";
import aboutHeroAnimation from "../../../assets/lottie/about-hero.json";

const STATS = [
  { label: "Usuarios Activos", value: "15K+" },
  { label: "Disponibilidad", value: "99.9%" },
  { label: "Soporte", value: "24/7" },
];

export function HeroSection() {
  return (
    <div className="bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white w-full">
      <section className="pt-8 sm:pt-10 lg:pt-12 xl:pt-16 pb-8 sm:pb-12 lg:pb-16 xl:pb-20 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full mx-auto">
            {/* Título */}
            <div className="space-y-3 sm:space-y-4 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900 w-full">
                Nunca más sin conexión cuando tu operadora te deja afuera
              </h1>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-700 w-full">
                JJSecure es una VPN creada en la región para mantener tu línea activa incluso sin saldo. Nos movemos rápido ante bloqueos de operadoras y compartimos cada iteración con la comunidad.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 justify-center mt-8">
              {STATS.map((stat) => (
                <span
                  key={stat.label}
                  className="rounded-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm px-4 py-1 text-gray-800 shadow-lg"
                >
                  {stat.label}: <span className="font-semibold text-gray-900">{stat.value}</span>
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 justify-center flex-wrap mt-8">
              <a
                href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-3.5 xl:py-4 text-sm sm:text-base lg:text-lg font-semibold text-white transition hover:bg-indigo-700 whitespace-nowrap"
              >
                Descargar JJSecure
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 transition group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Imagen - Lottie Animation - Abajo */}
          <div className="flex items-center justify-center mt-8 sm:mt-10 lg:mt-12 xl:mt-16 w-full">
            <div className="w-full max-w-sm mx-auto">
              <Lottie animationData={aboutHeroAnimation as unknown as object} loop autoplay />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}