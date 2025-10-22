import { Heart, Wifi, Shield, Globe, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800/60">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Section - Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">JJSecure VPN</h3>
                <p className="text-sm text-gray-400">Conexión Segura</p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Tu privacidad y seguridad online son nuestra prioridad. Conecta de
              forma rápida y segura con nuestros servidores premium optimizados
              para la mejor experiencia.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300 font-medium">
                  jjsecurevpn@gmail.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300 font-medium">Soporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Section - Links & Features */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">
                Enlaces Rápidos
              </h4>
              <nav className="space-y-3">
                <Link
                  to="/"
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
                >
                  Inicio
                </Link>
                <button
                  onClick={() => {
                    if (window.location.pathname !== '/') {
                      window.location.href = '/#about-section';
                    } else {
                      const element = document.getElementById('about-section');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium text-left"
                >
                  Sobre Nosotros
                </button>
                <Link
                  to="/planes"
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
                >
                  Planes
                </Link>
                <Link
                  to="/revendedores"
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
                >
                  Revendedores
                </Link>
                <Link
                  to="/terminos"
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
                >
                  Términos
                </Link>
                <Link
                  to="/privacidad"
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
                >
                  Privacidad
                </Link>
              </nav>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">
                Características
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-gray-300 font-medium">
                    Conexión Segura
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-gray-300 font-medium">
                    Acceso Universal
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-gray-300 font-medium">
                    Siempre Conectado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-300">
              <span>© {new Date().getFullYear()} JJSecure VPN. Hecho con</span>
              <Heart className="w-4 h-4 text-pink-400 fill-current" />
              <span>para la comunidad</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/privacidad"
                className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
              >
                Política de Privacidad
              </Link>
              <Link
                to="/terminos"
                className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
              >
                Términos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
