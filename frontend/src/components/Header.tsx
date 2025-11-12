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
  HandHeart,
} from "lucide-react";
import Sidebar from "./Sidebar";
import ContactButton from "./ContactButton";
import { CuponIcon } from "./Icons";
import { useNoticias } from "../hooks/useNoticias";
import { useCuponesActivos } from "../hooks/useCuponesActivos";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noticiasOpen, setNoticiasOpen] = useState(false);
  const [cuponesOpen, setCuponesOpen] = useState(false);
  const location = useLocation();
  const { config: noticiasConfig, loading } = useNoticias();
    const { cupones: cuponesActivos } = useCuponesActivos();

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
      <header className="sticky top-0 left-0 right-0 bg-neutral-900 text-white text-sm py-3 w-full z-[9999] flex items-center justify-between px-4">
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
          <Link
            to="/donaciones"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-200 text-sm font-medium hover:bg-rose-500/20 transition-colors"
          >
            <HandHeart className="w-4 h-4" />
            <span className="hidden sm:inline">Donar</span>
          </Link>
          {/* Contact Button */}
          <ContactButton />
          {/* Cupones Button */}
          <button
            onClick={() => setCuponesOpen(!cuponesOpen)}
            className={`relative p-2 rounded-xl transition-colors duration-150 ${
              cuponesActivos.length > 0
                ? "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            }`}
            aria-label="Ver cupones activos"
          >
            <CuponIcon className="w-5 h-5" />
            {cuponesActivos.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{cuponesActivos.length}</span>
              </div>
            )}
          </button>
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
          <div className="absolute top-16 right-4 w-80 bg-neutral-900 rounded-xl shadow-xl z-[10001]">
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

      {/* Cupones Popover */}
      {cuponesOpen && (
        <div
          className="fixed inset-0 z-[10000]"
          onClick={() => setCuponesOpen(false)}
        >
          <div className="absolute top-16 right-4 w-96 bg-neutral-900 rounded-xl shadow-xl z-[10001]">
            {/* Arrow pointing up */}
            <div className="absolute -top-2 right-12 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-neutral-900"></div>
            {/* Arrow border for better visibility */}
            <div className="absolute -top-3 right-12 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-neutral-800"></div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CuponIcon className="w-4 h-4 text-green-400" />
                  Cupones Activos
                </h3>
                <button
                  onClick={() => setCuponesOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {cuponesActivos.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cuponesActivos.map((cupon) => (
                    <div
                      key={cupon.id}
                      className="p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs font-mono bg-neutral-700 px-2 py-1 rounded text-green-400">
                              {cupon.codigo}
                            </code>
                            <span className="text-xs font-semibold text-neutral-300">
                              {cupon.tipo === "porcentaje"
                                ? `${cupon.valor}%`
                                : `$${cupon.valor.toLocaleString()}`}
                            </span>
                          </div>
                          {cupon.limite_uso && (
                            <p className="text-xs text-neutral-400">
                              Usos: {cupon.usos_actuales || 0} / {cupon.limite_uso}
                            </p>
                          )}
                          {cupon.fecha_expiracion && (
                            <p className="text-xs text-neutral-500">
                              Expira: {new Date(cupon.fecha_expiracion).toLocaleDateString("es-ES")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CuponIcon className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">
                    No hay cupones activos disponibles.
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
