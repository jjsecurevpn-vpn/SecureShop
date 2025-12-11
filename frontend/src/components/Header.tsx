import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Home, Users, CreditCard, Store, Heart, Star, Server } from 'lucide-react';
import ContactButton from "./ContactButton";
import NoticiasPopover from "./NoticiasPopover";
import CuponesPopover from "./CuponesPopover";
import { useState, useEffect } from "react";
import { protonColors } from "../styles/colors";

const Header = () => {
  const location = useLocation();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/planes", label: "Planes" },
    { path: "/", label: "Inicio" },
  ];

  return (
    <>
      {/* Overlay cuando el menú está abierto */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[8888]"
          onClick={() => setMobileMenuOpen(false)}
          style={{ top: '0' }}
        />
      )}

      {/* Header - Siempre claro y sticky */}
      <header 
        className="sticky top-0 left-0 right-0 w-full z-[9999] overflow-visible"
        style={{ 
          backgroundColor: '#f4eaff'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between overflow-visible">
          {/* Left side: Logo */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              reloadDocument
              className="flex items-center gap-3 group focus:outline-none"
              aria-label="JJSecure VPN"
            >
              <img
                src="/INTERNET ILIMITADO.avif"
                alt="JJSecure VPN"
                className="h-7 w-auto"
              />
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-0">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  reloadDocument
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ 
                    color: isActive(link.path) ? protonColors.purple[500] : protonColors.purple[800]
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Dropdown Características */}
              <div className="relative">
                <button
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  onBlur={() => setTimeout(() => setFeaturesOpen(false), 150)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: protonColors.purple[800] }}
                >
                  Características
                  <ChevronDown className={`h-4 w-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
                </button>

                {featuresOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 rounded-xl py-2 shadow-lg bg-white ring-1 ring-black/5"
                  >
                    {/* Secciones principales */}
                    <Link
                      to="/"
                      reloadDocument
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Home className="h-4 w-4" />
                      Inicio
                    </Link>
                    <Link
                      to="/sobre-nosotros"
                      reloadDocument
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Users className="h-4 w-4" />
                      Sobre Nosotros
                    </Link>
                    <Link
                      to="/planes"
                      reloadDocument
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <CreditCard className="h-4 w-4" />
                      Planes VPN
                    </Link>
                    <Link
                      to="/revendedores"
                      reloadDocument
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Store className="h-4 w-4" />
                      Revendedores
                    </Link>
                    <Link
                      to="/donaciones"
                      reloadDocument
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Heart className="h-4 w-4" />
                      Donaciones
                    </Link>
                    <Link
                      to="/sponsors"
                      reloadDocument
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Star className="h-4 w-4" />
                      Sponsors
                    </Link>
                    <Link
                      to="/servidores"
                      reloadDocument
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Server className="h-4 w-4" />
                      Servidores
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <CuponesPopover />
              <NoticiasPopover />
              <ContactButton />
            </div>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center gap-2">
              <CuponesPopover />
              <NoticiasPopover />
              <ContactButton />
            </div>

            {/* CTA Button - escondido en /planes */}
            {location.pathname !== '/planes' && (
              <Link
                to="/planes"
                reloadDocument
                className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: protonColors.purple[500],
                  color: 'white'
                }}
              >
                Obtener VPN
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: protonColors.purple[800] }}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Estilo ProtonVPN con fondo blanco */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden w-full border-t border-gray-100 bg-white"
            style={{ 
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <nav className="p-4 space-y-1">
              {[
                { path: '/', label: 'Inicio', icon: Home },
                { path: '/sobre-nosotros', label: 'Sobre Nosotros', icon: Users },
                { path: '/planes', label: 'Planes VPN', icon: CreditCard },
                { path: '/revendedores', label: 'Revendedores', icon: Store },
                { path: '/donaciones', label: 'Donaciones', icon: Heart },
                { path: '/sponsors', label: 'Sponsors', icon: Star },
                { path: '/servidores', label: 'Servidores', icon: Server },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  reloadDocument
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors"
                  style={{ 
                    color: isActive(item.path) ? protonColors.purple[500] : protonColors.purple[800],
                    backgroundColor: isActive(item.path) ? protonColors.purple[50] : 'transparent'
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}

              {/* Separador */}
              <div className="my-3 border-t border-gray-200" />

              {/* CTA - escondido en /planes */}
              {location.pathname !== '/planes' && (
                <div className="p-4">
                  <Link
                    to="/planes"
                    reloadDocument
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full text-base font-semibold transition-all text-white hover:opacity-90"
                    style={{ backgroundColor: protonColors.purple[500] }}
                  >
                    Obtener VPN
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
