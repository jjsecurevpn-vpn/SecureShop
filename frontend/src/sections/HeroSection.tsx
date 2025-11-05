import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Users,
} from "lucide-react";
import DemoModal from "../components/DemoModal";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const goToPlans = () => navigate("/planes");
  const goToResellers = () => navigate("/revendedores");

  const goToAbout = () => navigate("/sobre-nosotros");

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <section
        id="hero-section"
        className="relative min-h-screen pt-20 overflow-hidden"
      >
        {/* Efecto de luz sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-3xl rounded-full"></div>

        {/* Contenido principal */}
        <div className="relative container mx-auto px-6 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Contenido textual */}
            <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
              {/* Badge minimalista */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-neutral-400">
                  Protección empresarial
                </span>
              </div>

              {/* Título compacto */}
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  JJSecure VPN
                </h1>
                <p className="text-sm text-neutral-400 max-w-md mx-auto lg:mx-0">
                  Navega libre y seguro. Sin límites, sin rastreos.
                </p>
              </div>

              {/* Features ultra-compactos */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Shield className="w-3.5 h-3.5 text-purple-500" />
                  <span>AES-256</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Zap className="w-3.5 h-3.5 text-green-500" />
                  <span>Alta velocidad</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>+50 países</span>
                </div>
              </div>

              {/* CTA Buttons compactos */}
              <div className="flex flex-col gap-2 justify-center lg:justify-start pt-2 w-48 mx-auto lg:mx-0">
                <button
                  onClick={goToPlans}
                  className="group w-full px-6 py-2.5 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-400/30 rounded-xl text-sm font-medium text-purple-300 hover:text-purple-200 transition-all"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    Ver Planes
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={() => setIsDemoOpen(true)}
                  className="w-full px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all"
                >
                  🎁 Prueba Gratis
                </button>

                <a
                  href="https://play.google.com/store/apps/details?id=com.jjsecure.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-90 transition-opacity"
                >
                  <img 
                    src="/GetItOnGooglePlay_Badge_Web_color_Spanish.svg" 
                    alt="Descargar en Google Play"
                    className="h-16 w-full"
                  />
                </a>
              </div>

              {/* Links secundarios */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 text-xs">
                <button
                  onClick={goToResellers}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Revendedores</span>
                </button>
                <button
                  onClick={goToAbout}
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  ¿Cómo funciona?
                </button>
              </div>
            </div>

            {/* Imagen del dispositivo */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow sutil */}
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />

                {/* Device mockup */}
                <div className="relative z-10">
                  <img
                    src="/MarcoCelularSecure.png"
                    alt="JJSecure VPN"
                    className="w-56 sm:w-64 lg:w-72 h-auto object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
<Globe className="w-3.5 h-3.5 text-purple-400" />;
