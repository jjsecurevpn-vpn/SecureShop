import { Zap } from "lucide-react";
import Lottie from "lottie-react";
import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import aboutHeroAnimation from "../../../assets/lottie/about-hero.json";

const STATS = [
  { label: "Usuarios Activos", value: "15K+" },
  { label: "Disponibilidad", value: "99.9%" },
  { label: "Soporte", value: "24/7" },
];

export function HeroSection() {
  return (
    <section id="hero-section" className="bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16 pt-8 md:pt-12 xl:pt-16 pb-8 md:pb-12 xl:pb-16">
        {/* Contenido centrado */}
        <div className="flex flex-col items-center text-center gap-6 md:gap-8 min-h-auto justify-center">
          {/* Título */}
          <div className="w-full max-w-3xl space-y-4">
            <Title as="h1">
              Nunca más sin conexión cuando tu operadora te deja afuera
            </Title>
            <Subtitle className="max-w-2xl mx-auto">
              JJSecure es una VPN creada en la región para mantener tu línea activa incluso sin saldo. Nos movemos rápido ante bloqueos de operadoras y compartimos cada iteración con la comunidad.
            </Subtitle>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-sm md:text-base xl:text-lg text-gray-700 justify-center">
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
          <a
            href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-colors"
          >
            Descargar JJSecure
            <Zap className="h-4 w-4" />
          </a>
        </div>

        {/* Imagen - Lottie Animation */}
        <div className="flex items-center justify-center pt-8 md:pt-12 xl:pt-16 w-full">
          <div className="w-full max-w-sm mx-auto">
            <Lottie animationData={aboutHeroAnimation as unknown as object} loop autoplay />
          </div>
        </div>
      </div>
    </section>
  );
}