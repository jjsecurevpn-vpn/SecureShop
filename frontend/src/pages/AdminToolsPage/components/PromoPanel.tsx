import { PromoConfig, HeroPromoConfig } from "../types";

type PromoScope = "todos" | "solo_nuevos" | "solo_renovaciones";

interface PromoPanelProps {
  titulo: string;
  icono: string;
  subtitulo: string;
  promoConfig: PromoConfig | null;
  heroPromo: HeroPromoConfig | null;
  durationInput: string;
  discountPercentageInput: string;
  isSaving: boolean;
  onDurationChange: (value: string) => void;
  onDiscountPercentageChange: (value: string) => void;
  promoScope: PromoScope;
  onSetPromoScope: (value: PromoScope) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onTextoChange: (value: string) => void;
  onGuardarTexto: () => void;
}

export function PromoPanel({
  titulo,
  icono,
  subtitulo,
  promoConfig,
  heroPromo,
  durationInput,
  discountPercentageInput,
  isSaving,
  onDurationChange,
  onDiscountPercentageChange,
  promoScope,
  onSetPromoScope,
  onActivate,
  onDeactivate,
  onTextoChange,
  onGuardarTexto,
}: PromoPanelProps) {
  
  // Helper para obtener label del scope actual de la promo activa
  const getActiveScopeLabel = () => {
    if (promoConfig?.solo_nuevos) return "solo nuevas cuentas";
    if (promoConfig?.solo_renovaciones) return "solo renovaciones";
    return "todos";
  };
  
  return (
    <div className="border border-neutral-700 rounded-xl bg-neutral-900/40 p-5 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
          <span>{icono}</span> {titulo}
        </h3>
        <p className="text-xs text-neutral-500 mt-1">{subtitulo}</p>
      </div>

      {/* Estado actual */}
      <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-800/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-300">Estado</div>
            <div className="text-xs text-neutral-500 mt-1">
              {promoConfig?.activa ? (
                <>
                  <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                  Activo
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-neutral-600 rounded-full mr-2"></span>
                  Inactivo
                </>
              )}
            </div>
          </div>
          {promoConfig?.activa && promoConfig?.duracion_horas && (
            <div className="text-right">
              <div className="text-xs text-neutral-400">
                <span className="font-semibold text-neutral-200">{promoConfig.duracion_horas}h</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alcance de la promo */}
      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-800/20 px-3 py-3">
        <div>
          <div className="font-semibold text-neutral-100 text-xs mb-1">Alcance de la promoción</div>
          <p className="text-[11px] text-neutral-500">
            Define a quién aplica el descuento global.
          </p>
          {promoConfig?.activa && (
            <p className="mt-1 text-[11px] text-emerald-400">
              Promo actual: {getActiveScopeLabel()}
            </p>
          )}
        </div>
        
        {/* Selector de scope */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isSaving || promoConfig?.activa}
            onClick={() => onSetPromoScope("todos")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
              promoScope === "todos"
                ? "bg-violet-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            } ${promoConfig?.activa ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            🌐 Todos
          </button>
          <button
            type="button"
            disabled={isSaving || promoConfig?.activa}
            onClick={() => onSetPromoScope("solo_nuevos")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
              promoScope === "solo_nuevos"
                ? "bg-emerald-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            } ${promoConfig?.activa ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            ✨ Solo nuevas cuentas
          </button>
          <button
            type="button"
            disabled={isSaving || promoConfig?.activa}
            onClick={() => onSetPromoScope("solo_renovaciones")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
              promoScope === "solo_renovaciones"
                ? "bg-amber-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            } ${promoConfig?.activa ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            🔄 Solo renovaciones
          </button>
        </div>
        
        {/* Explicación del scope seleccionado */}
        <div className="text-[11px] text-neutral-400 mt-2">
          {promoScope === "todos" && (
            <p>El descuento aplicará tanto a compras de nuevas cuentas como a renovaciones.</p>
          )}
          {promoScope === "solo_nuevos" && (
            <p>El descuento solo aplicará a clientes que compran por primera vez. Las renovaciones mantienen precio normal.</p>
          )}
          {promoScope === "solo_renovaciones" && (
            <p>El descuento solo aplicará a clientes existentes que renuevan. Las compras nuevas mantienen precio normal.</p>
          )}
        </div>
      </div>

      {promoConfig?.activa ? (
        <button
          onClick={onDeactivate}
          disabled={isSaving}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Procesando..." : "Desactivar"}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Descuento (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-2 text-sm text-white placeholder-neutral-500 transition focus:border-violet-500 focus:outline-none"
                value={discountPercentageInput}
                onChange={(e) => onDiscountPercentageChange(e.target.value)}
                placeholder="Ej: 20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Duración (horas)
              </label>
              <input
                type="number"
                min="1"
                max="720"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-2 text-sm text-white placeholder-neutral-500 transition focus:border-violet-500 focus:outline-none"
                value={durationInput}
                onChange={(e) => onDurationChange(e.target.value)}
                placeholder="Horas"
              />
            </div>
          </div>
          <button
            onClick={onActivate}
            disabled={isSaving || !discountPercentageInput}
            className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Activando..." : `Activar ${discountPercentageInput || "0"}% OFF`}
          </button>
        </div>
      )}

      {/* Texto del hero */}
      <div className="pt-2 border-t border-neutral-700">
        <label className="block text-xs font-semibold text-neutral-300 mb-2">Texto del hero</label>
        <div className="mb-2">
          <input
            type="text"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-2 text-sm text-white placeholder-neutral-500 transition focus:border-violet-500 focus:outline-none"
            value={heroPromo?.texto || ""}
            onChange={(e) => onTextoChange(e.target.value)}
            placeholder="Ej: DESCUENTO 20%"
          />
          {/* Preview */}
          {heroPromo?.texto && (
            <div className="mt-2 p-2 rounded-lg bg-neutral-800/50 border border-neutral-700">
              <p className="text-xs text-neutral-300">
                {heroPromo.texto.split(/(\d+%)/g).map((part, idx) => {
                  if (part.match(/\d+%/)) {
                    return (
                      <span key={idx} style={{backgroundColor: '#fbbf24', color: '#059669', fontWeight: 'bold', padding: '2px 4px', borderRadius: '3px'}}>
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onGuardarTexto}
          disabled={isSaving}
          className="w-full rounded-lg bg-neutral-700 px-3 py-1 text-xs font-medium text-neutral-200 transition hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar texto"}
        </button>
      </div>
    </div>
  );
}
