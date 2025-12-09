import { PromoConfig, HeroPromoConfig } from "../types";

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
  applyToRenewals: boolean;
  onToggleApplyToRenewals: (value: boolean) => void;
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
  applyToRenewals,
  onToggleApplyToRenewals,
  onActivate,
  onDeactivate,
  onTextoChange,
  onGuardarTexto,
}: PromoPanelProps) {
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

      {/* Controles de activación */}
      {/* Alcance de la promo */}
      <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-800/20 px-3 py-3">
        <div className="flex items-center justify-between text-xs text-neutral-300">
          <div>
            <div className="font-semibold text-neutral-100">Nuevas cuentas</div>
            <p className="text-[11px] text-neutral-500">Siempre incluidas en la promoción.</p>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">Incluidas</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs text-neutral-300">
          <div>
            <div className="font-semibold text-neutral-100">Renovaciones</div>
            <p className="text-[11px] text-neutral-500">
              Define si el descuento global alcanza a cuentas existentes o solo a cuentas nuevas.
            </p>
            {promoConfig?.activa && (
              <p className="mt-1 text-[11px] text-emerald-400">
                Promo actual: {promoConfig.solo_nuevos ? "solo nuevas cuentas" : "incluye renovaciones"}
              </p>
            )}
            <p className="mt-1 text-[11px] text-neutral-400">
              Próximas activaciones: {applyToRenewals ? "incluyen renovaciones" : "solo nuevas cuentas"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-[11px] font-semibold ${
                applyToRenewals ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {applyToRenewals ? "Incluye renovaciones" : "Solo nuevas cuentas"}
            </span>
            <button
              type="button"
              disabled={isSaving || promoConfig?.activa}
              onClick={() => onToggleApplyToRenewals(!applyToRenewals)}
              className={`relative h-6 w-11 rounded-full transition ${
                applyToRenewals ? "bg-violet-500" : "bg-neutral-700"
              } ${promoConfig?.activa ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
              aria-pressed={applyToRenewals}
              aria-label={
                applyToRenewals
                  ? "Desactivar descuento para renovaciones"
                  : "Activar descuento para renovaciones"
              }
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  applyToRenewals ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
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
