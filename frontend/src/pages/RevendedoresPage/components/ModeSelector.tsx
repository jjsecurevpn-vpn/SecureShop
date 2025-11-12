import { RefreshCw, Zap } from "lucide-react";
import { ModoSeleccion } from "../types";

type ModeSelectorProps = {
  mode: ModoSeleccion;
  onSelectCompra: () => void;
  onSelectRenovacion: () => void;
};

export function ModeSelector({ mode, onSelectCompra, onSelectRenovacion }: ModeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
      <button
        onClick={onSelectCompra}
        className={`p-4 rounded-2xl border transition-all text-left ${
          mode === "compra"
            ? "border-violet-500 bg-violet-500/10 text-neutral-100 shadow-[0_0_0_1px_rgba(168,85,247,0.15)]"
            : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">Comprar nuevo plan</p>
            <p className="text-xs text-neutral-500 mt-1">
              Elige entre sistemas de créditos o validez según tu estrategia.
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={onSelectRenovacion}
        className={`p-4 rounded-2xl border transition-all text-left ${
          mode === "renovacion"
            ? "border-violet-500 bg-violet-500/10 text-neutral-100 shadow-[0_0_0_1px_rgba(168,85,247,0.15)]"
            : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">Renovación de revendedor</p>
            <p className="text-xs text-neutral-500 mt-1">
              Busca tu cuenta y renueva con checkout automático de Mercado Pago.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
