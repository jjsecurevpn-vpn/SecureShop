import { RefreshCw } from "lucide-react";
import { ModoSeleccion } from "../types";

interface ModeSelectorProps {
  mode: ModoSeleccion;
  onSelectCompra: () => void;
  onSelectRenovacion: () => void;
}

export function ModeSelector({ mode, onSelectCompra, onSelectRenovacion }: ModeSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={onSelectCompra}
        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors border ${
          mode === "compra"
            ? "bg-violet-600 text-white border-violet-500"
            : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
        }`}
      >
        Comprar nuevo plan
      </button>
      <button
        onClick={onSelectRenovacion}
        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors border inline-flex items-center justify-center gap-2 ${
          mode === "renovacion"
            ? "bg-violet-600 text-white border-violet-500"
            : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
        }`}
      >
        <RefreshCw className="w-4 h-4" />
        Renovar plan existente
      </button>
    </div>
  );
}
