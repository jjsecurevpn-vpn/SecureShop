import { Heart, Shield, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800/60 md:ml-14">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex flex-col items-start gap-4">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">JJSecure VPN</h3>
                <p className="text-sm text-gray-400 mt-1">Conexión Segura</p>
              </div>
            </div>

            <p className="text-neutral-400 leading-relaxed text-sm">
              Tu privacidad y seguridad online son nuestra prioridad. Conecta de
              forma rápida y segura con nuestros servidores premium.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Enlaces Rápidos</h4>
            <nav className="space-y-3">
              <Link
                to="/"
                className="block text-neutral-400 hover:text-purple-400 transition-colors duration-200 text-sm"
              >
                Inicio
              </Link>
              <button
                onClick={() => {
                  if (window.location.pathname !== "/") {
                    window.location.href = "/#about-section";
                  } else {
                    const element = document.getElementById("about-section");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="block text-neutral-400 hover:text-purple-400 transition-colors duration-200 text-sm text-left"
              >
                Sobre Nosotros
              </button>
              <Link
                to="/planes"
                className="block text-neutral-400 hover:text-purple-400 transition-colors duration-200 text-sm"
              >
                Planes
              </Link>
              <Link
                to="/revendedores"
                className="block text-neutral-400 hover:text-purple-400 transition-colors duration-200 text-sm"
              >
                Revendedores
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Legal</h4>
            <nav className="space-y-3">
              <Link
                to="/terminos"
                className="block text-neutral-400 hover:text-purple-400 transition-colors duration-200 text-sm"
              >
                Términos de Uso
              </Link>
              <Link
                to="/privacidad"
                className="block text-neutral-400 hover:text-purple-400 transition-colors duration-200 text-sm"
              >
                Política de Privacidad
              </Link>
            </nav>
          </div>

          {/* Contact & Features */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Contacto</h4>
            <div className="space-y-4">
              <a
                href="mailto:jjsecurevpn@gmail.com"
                className="flex items-center gap-3 text-neutral-400 hover:text-purple-400 transition-colors duration-200 group"
              >
                <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm">jjsecurevpn@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-neutral-400">
                <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm">Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-neutral-950 border-t border-neutral-800/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            {/* Copyright */}
            <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm">
              <span>© {new Date().getFullYear()} JJSecure VPN.</span>
              <span className="hidden sm:inline">Hecho con</span>
              <Heart className="w-4 h-4 text-pink-400 fill-current" />
              <span className="hidden sm:inline">para la comunidad</span>
            </div>

            {/* Social/Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacidad"
                className="text-neutral-400 hover:text-purple-400 transition-colors duration-200"
              >
                Privacidad
              </Link>
              <span className="text-neutral-700">•</span>
              <Link
                to="/terminos"
                className="text-neutral-400 hover:text-purple-400 transition-colors duration-200"
              >
                Términos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
