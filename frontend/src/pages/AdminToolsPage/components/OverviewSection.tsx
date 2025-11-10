import { Cupon, NoticiaConfig } from "../../../types";

interface OverviewSectionProps {
  cupones: Cupon[];
  loadingCupones: boolean;
  isRefreshingCupones: boolean;
  noticiasConfig: NoticiaConfig | null;
  numberFormatter: Intl.NumberFormat;
  onRefreshCupones: () => void;
}

export function OverviewSection({
  cupones,
  loadingCupones,
  isRefreshingCupones,
  noticiasConfig,
  numberFormatter,
  onRefreshCupones,
}: OverviewSectionProps) {
  const activeCoupons = cupones.filter((c) => c.activo).length;
  const totalUses = cupones.reduce((acc, cupon) => acc + (cupon.usos_actuales ?? 0), 0);

  return (
    <section id="section-overview" className="space-y-4">
      <div className="border border-neutral-800 rounded-2xl bg-neutral-900/50 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel interno</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Ruta /155908348 • Gestiona cupones y avisos sin editar JSON
            </p>
          </div>
          <button
            onClick={onRefreshCupones}
            disabled={loadingCupones || isRefreshingCupones}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-purple-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshingCupones ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 p-4">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              Cupones activos
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{activeCoupons}</div>
            <div className="text-xs text-neutral-500 mt-1">de {cupones.length} totales</div>
          </div>
          <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 p-4">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              Usos acumulados
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{numberFormatter.format(totalUses)}</div>
            <div className="text-xs text-neutral-500 mt-1">en la base de datos</div>
          </div>
          <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 p-4">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              Estado avisos
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              {noticiasConfig?.aviso.habilitado ? "Activos" : "Inactivos"}
            </div>
            <div className="text-xs text-neutral-500 mt-1">en el sitio</div>
          </div>
        </div>
      </div>
    </section>
  );
}
