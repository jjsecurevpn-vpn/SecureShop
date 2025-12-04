import { RefreshCw, ShoppingCart } from "lucide-react";
import { ModoSeleccion } from "../types";

type ModeSelectorProps = {
  mode: ModoSeleccion;
  onSelectCompra: () => void;
  onSelectRenovacion: () => void;
};

export function ModeSelector({ mode, onSelectCompra, onSelectRenovacion }: ModeSelectorProps) {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-7 xl:space-y-8">
      {/* Tab Container */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 rounded-2xl p-2 sm:p-3 lg:p-4 xl:p-5">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
          <button
            onClick={onSelectCompra}
            className={`group flex flex-col items-center gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 xl:py-5 rounded-xl transition-all ${
              mode === "compra"
                ? "bg-white text-gray-900 shadow-lg"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 items-center justify-center rounded-xl transition-all ${
                mode === "compra"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-indigo-50/80 text-gray-600 group-hover:text-gray-900"
              }`}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold sm:text-sm ${mode === "compra" ? "text-gray-900" : "text-gray-700"}`}>
                Comprar Plan
              </p>
              <p className="text-[10px] text-gray-600 sm:text-xs mt-1">Adquiere nuevos planes</p>
            </div>
          </button>

          <button
            onClick={onSelectRenovacion}
            className={`group flex flex-col items-center gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 xl:py-5 rounded-xl transition-all ${
              mode === "renovacion"
                ? "bg-white text-gray-900 shadow-lg"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 items-center justify-center rounded-xl transition-all ${
                mode === "renovacion"
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-indigo-50/80 text-gray-600 group-hover:text-gray-900"
              }`}
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold sm:text-sm ${mode === "renovacion" ? "text-gray-900" : "text-gray-700"}`}>
                Renovar Plan
              </p>
              <p className="text-[10px] text-gray-600 sm:text-xs mt-1">Renueva tu plan existente</p>
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm text-gray-700 text-center">
        {mode === "compra" ? (
          <span>
            <span className="font-semibold text-emerald-600">Modo compra:</span> Combina Créditos y Validez para armar planes flexibles según tu estrategia.
          </span>
        ) : (
          <span>
            <span className="font-semibold text-indigo-600">Modo renovación:</span> Busca tu cuenta, confirma datos y procesa el pago con un par de clics.
          </span>
        )}
      </div>
    </div>
  );
}
