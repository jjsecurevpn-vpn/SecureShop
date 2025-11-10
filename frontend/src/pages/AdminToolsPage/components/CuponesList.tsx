import { Cupon } from "../../../types";

// ============================================================================
// TIPOS
// ============================================================================

interface CouponStatusInfo {
  status: string;
  class: string;
}

interface CuponesListProps {
  cupones: Cupon[];
  loading?: boolean;
  onDesactivar: (cuponId: number) => void;
  onDelete: (cupon: Cupon) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
});

const COUPON_STATUS_STYLES = {
  activo: {
    status: "Activo",
    class: "bg-emerald-500/10 text-emerald-400",
  },
  inactivo: {
    status: "Inactivo",
    class: "bg-neutral-700/30 text-neutral-400",
  },
  expirado: {
    status: "Expirado",
    class: "bg-red-500/10 text-red-400",
  },
  agotado: {
    status: "Agotado",
    class: "bg-yellow-500/10 text-yellow-400",
  },
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getCouponStatus(cupon: Cupon): CouponStatusInfo {
  if (!cupon.activo) {
    return COUPON_STATUS_STYLES.inactivo;
  }

  if (cupon.fecha_expiracion && new Date(cupon.fecha_expiracion) < new Date()) {
    return COUPON_STATUS_STYLES.expirado;
  }

  if (cupon.limite_uso && (cupon.usos_actuales ?? 0) >= cupon.limite_uso) {
    return COUPON_STATUS_STYLES.agotado;
  }

  return COUPON_STATUS_STYLES.activo;
}

function formatCouponValue(tipo: string, valor: number): string {
  return tipo === "porcentaje" ? `${valor}%` : `$${CURRENCY_FORMATTER.format(valor)}`;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function TableHeader() {
  return (
    <thead className="border-b border-neutral-800">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Código
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Tipo
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Valor
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Límite de Usos
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Usos Actuales
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Estado
        </th>
        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Acciones
        </th>
      </tr>
    </thead>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
        No hay cupones registrados aún
      </td>
    </tr>
  );
}

function CouponRow({
  cupon,
  onDesactivar,
  onDelete,
}: {
  cupon: Cupon;
  onDesactivar: (id: number) => void;
  onDelete: (cupon: Cupon) => void;
}) {
  const { status, class: statusClass } = getCouponStatus(cupon);
  const currentUsos = cupon.usos_actuales ?? 0;
  const canDelete = true;

  return (
    <tr key={cupon.id} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition">
      <td className="px-4 py-3 font-mono text-xs uppercase text-neutral-200">
        {cupon.codigo}
      </td>
      <td className="px-4 py-3 capitalize text-neutral-300">
        {cupon.tipo.replace("_", " ")}
      </td>
      <td className="px-4 py-3 text-neutral-300 font-medium">
        {formatCouponValue(cupon.tipo, cupon.valor)}
      </td>
      <td className="px-4 py-3 text-neutral-400">
        {cupon.limite_uso ?? "Sin límite"}
      </td>
      <td className="px-4 py-3 text-neutral-400">
        {currentUsos} {cupon.limite_uso && `/ ${cupon.limite_uso}`}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <ActionButtons
          cupon={cupon}
          canDelete={canDelete}
          onDesactivar={onDesactivar}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function ActionButtons({
  cupon,
  canDelete,
  onDesactivar,
  onDelete,
}: {
  cupon: Cupon;
  canDelete: boolean;
  onDesactivar: (id: number) => void;
  onDelete: (cupon: Cupon) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={() => onDesactivar(cupon.id)}
        disabled={!cupon.activo}
        className="text-xs font-medium text-neutral-400 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Desactivar cupón ${cupon.codigo}`}
      >
        Desactivar
      </button>

      {canDelete && (
        <>
          <span className="text-neutral-600">•</span>
          <button
            onClick={() => onDelete(cupon)}
            className="text-xs font-medium text-white bg-red-600 px-3 py-1 rounded transition hover:bg-red-700"
            aria-label={`Eliminar cupón ${cupon.codigo}`}
          >
            Eliminar
          </button>
        </>
      )}
    </div>
  );
}

function TableStats({ cupones, loading }: { cupones: Cupon[]; loading: boolean }) {
  return (
    <div className="mb-6">
      <p className="text-sm text-neutral-400">
        {loading ? (
          <>
            <span className="inline-block animate-pulse">Cargando cupones...</span>
          </>
        ) : (
          <>
            <span className="font-medium text-neutral-300">{cupones.length}</span>{" "}
            cupones {cupones.length === 1 ? "registrado" : "registrados"}
          </>
        )}
      </p>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CuponesList({
  cupones,
  loading = false,
  onDesactivar,
  onDelete,
}: CuponesListProps) {
  return (
    <div className="space-y-4">
      <TableStats cupones={cupones} loading={loading} />

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-200">
          <TableHeader />
          <tbody className="divide-y divide-neutral-800">
            {cupones.length === 0 && !loading ? (
              <EmptyState />
            ) : (
              cupones.map((cupon) => (
                <CouponRow
                  key={cupon.id}
                  cupon={cupon}
                  onDesactivar={onDesactivar}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
