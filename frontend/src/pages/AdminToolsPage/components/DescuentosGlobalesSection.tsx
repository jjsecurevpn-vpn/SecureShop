import { PromoConfig, HeroPromoConfig } from "../types";
import { PromoPanel } from "./PromoPanel";

interface DescuentosGlobalesSectionProps {
  promoConfigPlanes: PromoConfig | null;
  promoConfigRevendedores: PromoConfig | null;
  heroPromoPlanes: HeroPromoConfig | null;
  heroPromoRevendedores: HeroPromoConfig | null;
  promoSuccess: string | null;
  promoError: string | null;
  isLoadingPromo: boolean;
  isSavingPromo: boolean;
  durationInputPlanes: string;
  durationInputRevendedores: string;
  discountPercentagePlanes: string;
  discountPercentageRevendedores: string;
  onSetDurationInputPlanes: (value: string) => void;
  onSetDurationInputRevendedores: (value: string) => void;
  onSetDiscountPercentagePlanes: (value: string) => void;
  onSetDiscountPercentageRevendedores: (value: string) => void;
  applyRenewalsPlanes: boolean;
  applyRenewalsRevendedores: boolean;
  onToggleApplyRenewalsPlanes: (value: boolean) => void;
  onToggleApplyRenewalsRevendedores: (value: boolean) => void;
  onActivatePromo: (tipo: "planes" | "revendedores") => void;
  onDeactivatePromo: (tipo: "planes" | "revendedores") => void;
  onSetHeroPromoPlanes: (config: HeroPromoConfig | null) => void;
  onSetHeroPromoRevendedores: (config: HeroPromoConfig | null) => void;
  onGuardarTextoHero: (tipo: "planes" | "revendedores") => void;
}

export function DescuentosGlobalesSection({
  promoConfigPlanes,
  promoConfigRevendedores,
  heroPromoPlanes,
  heroPromoRevendedores,
  promoSuccess,
  promoError,
  isLoadingPromo,
  isSavingPromo,
  durationInputPlanes,
  durationInputRevendedores,
  discountPercentagePlanes,
  discountPercentageRevendedores,
  onSetDurationInputPlanes,
  onSetDurationInputRevendedores,
  onSetDiscountPercentagePlanes,
  onSetDiscountPercentageRevendedores,
  applyRenewalsPlanes,
  applyRenewalsRevendedores,
  onToggleApplyRenewalsPlanes,
  onToggleApplyRenewalsRevendedores,
  onActivatePromo,
  onDeactivatePromo,
  onSetHeroPromoPlanes,
  onSetHeroPromoRevendedores,
  onGuardarTextoHero,
}: DescuentosGlobalesSectionProps) {
  return (
    <section id="section-descuentos-globales" className="space-y-4 pb-10">
      <div className="border border-neutral-800 rounded-2xl bg-neutral-900/50 p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Descuentos globales</h2>
            <p className="text-neutral-400 text-sm mt-1">
              Controla las promociones globales de forma independiente para cada categoría
            </p>
          </div>
          {(promoSuccess || promoError) && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                promoSuccess ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              {promoSuccess ?? promoError}
            </span>
          )}
        </div>

        {isLoadingPromo ? (
          <div className="text-center py-8 text-neutral-400">Cargando configuración...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Planes normales */}
            <PromoPanel
              titulo="Planes normales"
              icono="📊"
              subtitulo="Descuentos para clientes directos"
              promoConfig={promoConfigPlanes}
              heroPromo={heroPromoPlanes}
              durationInput={durationInputPlanes}
              discountPercentageInput={discountPercentagePlanes}
              isSaving={isSavingPromo}
              onDurationChange={onSetDurationInputPlanes}
              onDiscountPercentageChange={onSetDiscountPercentagePlanes}
              applyToRenewals={applyRenewalsPlanes}
              onToggleApplyToRenewals={onToggleApplyRenewalsPlanes}
              onActivate={() => onActivatePromo("planes")}
              onDeactivate={() => onDeactivatePromo("planes")}
              onTextoChange={(e) => onSetHeroPromoPlanes({ 
                habilitada: true, 
                texto: e,
                textColor: heroPromoPlanes?.textColor,
                bgColor: heroPromoPlanes?.bgColor,
                borderColor: heroPromoPlanes?.borderColor,
                iconColor: heroPromoPlanes?.iconColor,
                shadowColor: heroPromoPlanes?.shadowColor,
              })}
              onGuardarTexto={() => onGuardarTextoHero("planes")}
            />

            {/* Planes de revendedores */}
            <PromoPanel
              titulo="Planes de revendedores"
              icono="💼"
              subtitulo="Descuentos para revendedores"
              promoConfig={promoConfigRevendedores}
              heroPromo={heroPromoRevendedores}
              durationInput={durationInputRevendedores}
              discountPercentageInput={discountPercentageRevendedores}
              isSaving={isSavingPromo}
              onDurationChange={onSetDurationInputRevendedores}
              onDiscountPercentageChange={onSetDiscountPercentageRevendedores}
              applyToRenewals={applyRenewalsRevendedores}
              onToggleApplyToRenewals={onToggleApplyRenewalsRevendedores}
              onActivate={() => onActivatePromo("revendedores")}
              onDeactivate={() => onDeactivatePromo("revendedores")}
              onTextoChange={(e) => onSetHeroPromoRevendedores({ 
                habilitada: true, 
                texto: e,
                textColor: heroPromoRevendedores?.textColor,
                bgColor: heroPromoRevendedores?.bgColor,
                borderColor: heroPromoRevendedores?.borderColor,
                iconColor: heroPromoRevendedores?.iconColor,
                shadowColor: heroPromoRevendedores?.shadowColor,
              })}
              onGuardarTexto={() => onGuardarTextoHero("revendedores")}
            />
          </div>
        )}

        {/* Información */}
        <div className="mt-6 p-4 rounded-lg bg-neutral-800/30 border border-neutral-700">
          <div className="text-xs text-neutral-400 space-y-2">
            <p><span className="font-semibold">📋 Información:</span></p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Controla <strong>planes normales</strong> y <strong>planes de revendedores</strong> de forma independiente</li>
              <li>Cada categoría define si la promo también aplica a renovaciones</li>
              <li>Los precios con descuento están precargados en las configuraciones</li>
              <li>El banner de promoción se muestra automáticamente en el sitio</li>
              <li>Se desactiva automáticamente después de la duración especificada si está configurado</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
