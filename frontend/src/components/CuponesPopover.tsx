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
    <div className="relative overflow-visible" ref={dropdownRef}>
      {/* Cupones Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors duration-150 ${
          cuponesActivos.length > 0
            ? "text-green-600 hover:text-green-700 hover:bg-green-100"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Ver cupones activos"
      >
        <CuponIcon className="w-5 h-5" />
        {cuponesActivos.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
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
          icon={<CuponIcon className="w-4 h-4 text-green-600" />}
          width="w-72"
          arrowPosition="left-1/2 -translate-x-1/2 hidden md:block"
          position="fixed md:absolute top-14 md:top-full left-1/2 -translate-x-1/2 md:mt-2"
        >
          {cuponesActivos.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cuponesActivos.map((cupon) => (
                <div
                  key={cupon.id}
                  className="p-3 rounded-lg bg-green-50/50 hover:bg-green-100/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono bg-green-100 px-2 py-1 rounded text-green-700">
                          {cupon.codigo}
                        </code>
                        <span className="text-xs font-semibold text-green-800">
                          {cupon.tipo === "porcentaje"
                            ? `${cupon.valor}%`
                            : `$${cupon.valor.toLocaleString()}`}
                        </span>
                      </div>
                      {cupon.limite_uso && (
                        <p className="text-xs text-gray-600">
                          Usos: {cupon.usos_actuales || 0} / {cupon.limite_uso}
                        </p>
                      )}
                      {cupon.fecha_expiracion && (
                        <p className="text-xs text-gray-500">
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
              <CuponIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                No hay cupones activos disponibles.
              </p>
            </div>
          )}
        </DropdownPopover>
      )}
    </div>
  );
}
