import { useState, useRef, useEffect } from "react";
import { CuponIcon } from "./Icons";
import { useCuponesActivos } from "../hooks/useCuponesActivos";
import DropdownPopover from "./DropdownPopover";

export default function CuponesPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cupones: cuponesActivos } = useCuponesActivos();

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cupones Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Cupones Popover */}
      {isOpen && (
        <DropdownPopover
          isOpen={true}
          onClose={() => setIsOpen(false)}
          title="Cupones Activos"
          icon={<CuponIcon className="w-4 h-4 text-green-400" />}
          width="w-72 md:w-96"
          arrowPosition="right-12"
          position="right-2 md:right-4"
        >
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
        </DropdownPopover>
      )}
    </div>
  );
}
