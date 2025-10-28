import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    // Si no estamos en la home, navegar primero
    if (location.pathname !== "/") {
      window.location.href = "/#" + sectionId;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full py-4 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-sm shadow-lg shadow-purple-500/10"
          : "bg-gray-900/90 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6">
        <nav className="flex justify-between items-center relative">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="JJSecure VPN"
          >
            <img
              src="/LogoJJSecure.png"
              alt="JJSecure VPN"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-white">JJSecure VPN</span>
          </Link>

          {/* Desktop Navigation - Now also uses hamburger menu */}
          <div className="hidden md:block">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg transition-all duration-200"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="block md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg transition-all duration-200"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile and Desktop Navigation Menu */}
        {menuOpen && (
          <div className="mt-4 py-4 border-t border-gray-800/60">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-left text-gray-300 hover:text-purple-400 font-medium transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                Inicio
              </Link>
              <button
                onClick={() => scrollToSection("about-section")}
                className="text-left text-gray-300 hover:text-purple-400 font-medium transition-colors py-2"
              >
                Sobre Nosotros
              </button>
              <Link
                to="/planes"
                className="text-left text-gray-300 hover:text-purple-400 font-medium transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                Planes
              </Link>
              <Link
                to="/revendedores"
                className="text-left text-gray-300 hover:text-purple-400 font-medium transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                Revendedores
              </Link>
              <Link
                to="/terminos"
                className="text-gray-300 hover:text-purple-400 font-medium transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                Términos y Condiciones
              </Link>
              <Link
                to="/privacidad"
                className="text-gray-300 hover:text-purple-400 font-medium transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                Políticas de Privacidad
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
