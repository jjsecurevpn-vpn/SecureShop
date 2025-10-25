import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Play,
  Users,
} from 'lucide-react';
import { useNoticias } from '../hooks/useNoticias';

export default function HeroSection() {
  const navigate = useNavigate();
  const { config } = useNoticias();

  const goToPlans = () => {
    navigate('/planes');
  };

  const goToResellers = () => {
    navigate('/revendedores');
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 pt-16"
    >
      {/* Aviso Global */}
      {config?.aviso?.habilitado && (
        <div className={`w-full py-3 text-center ${config.aviso.bgColor}`}>
          <p className={`font-bold text-sm md:text-base ${config.aviso.textColor}`}>
            {config.aviso.texto}
          </p>
        </div>
      )}
      
        {/* Contenido principal */}
        <div className="relative container mx-auto px-4 pt-8 sm:pt-16 lg:pt-24 pb-16 sm:pb-20 flex flex-col lg:flex-row items-center justify-between min-h-screen">
        {/* Lado izquierdo - Contenido textual */}
        <div className="flex-1 text-center lg:text-left lg:pr-12 mb-8 lg:mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            JJSecure VPN
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-purple-300 mb-4 sm:mb-6 font-medium">
            Tu conexión segura y privada
          </p>
          <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Protege tu privacidad en línea con la VPN más confiable. Navega sin
            restricciones, accede a contenido global y mantén tus datos seguros
            con nuestra tecnología de cifrado avanzada.
          </p>

          {/* Características destacadas */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-purple-300">
              <Shield className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                Cifrado Militar
              </span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <Zap className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                Ultra Rápido
              </span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <Globe className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                Servidores Globales
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <button
              onClick={goToPlans}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
            >
              <Shield className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-sm sm:text-base">Ver Planes</span>
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            <button
              onClick={goToResellers}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/30"
            >
              <Users className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-sm sm:text-base">Revendedores</span>
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            <button
              onClick={scrollToAbout}
              className="bg-white/10 hover:bg-white/20 border border-gray-800/60 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:border-purple-500/30"
            >
              <Play className="w-4 sm:w-5 h-4 sm:h-5 text-purple-300" />
              <span className="text-sm sm:text-base">¿Cómo funciona?</span>
            </button>
          </div>
        </div>

        {/* Lado derecho - Marco del celular */}
        <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative">
            {/* Imagen de la aplicación */}
            <img 
              src="/MarcoCelularSecure.png" 
              alt="JJSecure VPN App" 
              className="w-64 sm:w-72 md:w-80 lg:w-72 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
