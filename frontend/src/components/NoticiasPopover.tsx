import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { useNoticias } from "../hooks/useNoticias";
import DropdownPopover from "./DropdownPopover";

export default function NoticiasPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { config: noticiasConfig, loading } = useNoticias();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
    <div className="relative overflow-visible" ref={dropdownRef}>
      {/* News Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors duration-150 ${
          hasActiveNoticia
            ? "text-red-600 hover:text-red-700 hover:bg-red-100"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Ver noticias"
      >
        <Bell size={20} />
        {hasActiveNoticia && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* News Popover */}
      {isOpen && (
        <DropdownPopover
          isOpen={true}
          onClose={() => setIsOpen(false)}
          title="Noticia Importante"
          icon={<span className="text-gray-700">{getIcon()}</span>}
          arrowPosition="left-1/2 -translate-x-1/2 hidden md:block"
          position="fixed md:absolute top-14 md:top-full left-1/2 -translate-x-1/2 md:mt-2"
          width="w-72"
        >
          {noticiasConfig?.aviso ? (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-lg text-sm ${
                  noticiasConfig.aviso.bgColor || "bg-gray-100"
                } ${noticiasConfig.aviso.textColor || "text-gray-800"}`}
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
              <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                No hay noticias disponibles.
              </p>
            </div>
          )}
        </DropdownPopover>
      )}
    </div>
  );
}
