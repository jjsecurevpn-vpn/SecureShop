import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import Sidebar from "./Sidebar";
import ContactButton from "./ContactButton";
import { useNoticias } from "../hooks/useNoticias";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noticiasOpen, setNoticiasOpen] = useState(false);
  const location = useLocation();
  const { config: noticiasConfig, loading } = useNoticias();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const getIcon = () => {
    if (!noticiasConfig?.aviso) return <Info className="w-4 h-4" />;

    const texto = noticiasConfig.aviso.texto.toLowerCase();
    if (
      texto.includes("⚠️") ||
      texto.includes("mantenimiento") ||
      texto.includes("temporalmente")
    ) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (
      texto.includes("✅") ||
      texto.includes("activo") ||
      texto.includes("disponible")
    ) {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (
      texto.includes("❌") ||
      texto.includes("desactivado") ||
      texto.includes("error")
    ) {
      return <XCircle className="w-4 h-4" />;
    }
    return <Info className="w-4 h-4" />;
  };

  const hasActiveNoticia = !loading && noticiasConfig?.aviso?.habilitado;

  return (
    <>
      {/* Fixed Header */}
      <header className="sticky top-0 left-0 right-0 bg-neutral-900 text-white text-sm py-3 w-full border-b border-neutral-800 z-[9999] flex items-center justify-between px-4">
        {/* Left side: Menu button and logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="JJSecure VPN"
          >
            <img
              src="/LogoJJSecure.png"
              alt="JJSecure VPN"
              className="h-8 w-auto"
            />
            <span className="hidden md:inline text-lg font-bold text-white">
              JJSecure VPN
            </span>
          </Link>
        </div>

        {/* Right side: Download button, Notifications and user info */}
        <div className="flex items-center gap-3">
          {/* Contact Button */}
          <ContactButton />
          {/* Download Button */}
          <Link
            to="/descargar"
            className="flex items-center justify-center w-8 h-8 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-600 rounded-full transition-colors duration-200"
            aria-label="Descargar aplicación"
          >
            <Download size={16} />
          </Link>
          {/* News Button */}
          <button
            onClick={() => setNoticiasOpen(!noticiasOpen)}
            className={`relative p-2 rounded-xl transition-colors duration-150 ${
              hasActiveNoticia
                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            }`}
            aria-label="Ver noticias"
          >
            <Bell size={20} />
            {hasActiveNoticia && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-900 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* News Popover */}
      {noticiasOpen && (
        <div
          className="fixed inset-0 z-[10000]"
          onClick={() => setNoticiasOpen(false)}
        >
          <div className="absolute top-16 right-4 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-[10001]">
            {/* Arrow pointing up */}
            <div className="absolute -top-2 right-8 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-neutral-900"></div>
            {/* Arrow border for better visibility */}
            <div className="absolute -top-3 right-8 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-neutral-800"></div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  {getIcon()}
                  Noticia Importante
                </h3>
                <button
                  onClick={() => setNoticiasOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {noticiasConfig?.aviso ? (
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-xl text-sm ${
                      noticiasConfig.aviso.bgColor || "bg-neutral-800"
                    } ${noticiasConfig.aviso.textColor || "text-neutral-300"}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
                      <div className="flex-1">
                        <p className="text-xs leading-relaxed">
                          {noticiasConfig.aviso.texto}
                        </p>
                        {noticiasConfig.aviso.subtitulo && (
                          <p className="text-xs opacity-75 mt-1">
                            {noticiasConfig.aviso.subtitulo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Info className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">
                    No hay noticias disponibles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
