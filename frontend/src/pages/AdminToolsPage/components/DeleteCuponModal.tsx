import { Cupon } from "../../../types";

interface DeleteCuponModalProps {
  cuponToDelete: Cupon | null;
  isDeletingCupon: boolean;
  onConfirmDelete: () => void;
  onCancel: () => void;
}

export function DeleteCuponModal({
  cuponToDelete,
  isDeletingCupon,
  onConfirmDelete,
  onCancel,
}: DeleteCuponModalProps) {
  if (!cuponToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Eliminar cupón</h3>
        <p className="text-neutral-400 text-sm mb-4">
          ¿Estás seguro de que quieres eliminar permanentemente el cupón <span className="font-mono text-neutral-200">{cuponToDelete.codigo}</span>?
        </p>
        <p className="text-neutral-500 text-xs mb-6 bg-neutral-800/50 p-3 rounded-lg">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeletingCupon}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 border border-neutral-700 transition hover:bg-neutral-800 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmDelete}
            disabled={isDeletingCupon}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeletingCupon ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
