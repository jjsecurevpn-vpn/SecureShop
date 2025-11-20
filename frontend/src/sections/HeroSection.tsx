import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Gift } from "lucide-react";
import DemoModal from "../components/DemoModal";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const goToPlans = () => navigate("/planes");
  const goToResellers = () => navigate("/revendedores");

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <section id="hero-section" className="bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-8 sm:pb-10 lg:pb-12 xl:pb-16 pt-8 sm:pt-10 lg:pt-12 xl:pt-16">
          {/* Contenido centrado */}
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12 min-h-auto justify-center">
            {/* Badge */}
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-700 font-semibold">
              De los creadores de <span>JJSecure VPN</span>
            </p>

            {/* Título */}
            <div className="w-full space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight w-full text-purple-200">
                VPN Premium. Protege tu Privacidad.
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 w-full font-medium">
                <strong className="font-semibold text-gray-900">Experimenta la verdadera libertad online.</strong> <span className="text-gray-500">Obtenga acceso sin restricciones a contenido global, bloquee anuncios molestos y proteja su privacidad con una VPN rápida y segura.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 justify-center flex-wrap">
              <button
                onClick={goToPlans}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-3.5 xl:py-4 text-sm sm:text-base lg:text-lg font-semibold text-white transition hover:bg-indigo-700 whitespace-nowrap"
              >
                Ver planes
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setIsDemoOpen(true)}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-3.5 xl:py-4 text-sm sm:text-base lg:text-lg font-semibold text-white transition hover:bg-green-700 whitespace-nowrap"
              >
                <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                Prueba Gratuita
              </button>
              <button
                onClick={goToResellers}
                className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-indigo-600 bg-white px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-3.5 xl:py-4 text-sm sm:text-base lg:text-lg font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white whitespace-nowrap"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                Ser revendedor
              </button>
            </div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Garantía de reembolso si no te sirve</p>
          </div>

          {/* Imagen - Mano con teléfono - Abajo */}
          <div className="flex items-center justify-center mt-8 sm:mt-10 lg:mt-12 xl:mt-16 w-full">
            <img
              src="/ManoCyberseguridad.svg"
              alt="JJSecure VPN App"
              className="w-full h-auto drop-shadow-2xl px-4 md:px-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
