import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import type { VentaFiada } from "../hooks/useClientes";
import { formatCurrency } from "../utils/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deudas: VentaFiada[];
  registrarPago: (
    ventaFiadaId: number,
    monto: number,
    metodoPago?: string,
    notas?: string
  ) => Promise<any>;
  onPaid?: () => void;
}

type Item = {
  id: string;
  ventaFiadaId: number;
  ventaId: number;
  productoNombre: string;
  cantidad: number;
  subtotal: number;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  deudas,
  registrarPago,
  onPaid,
}) => {
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    deudas.forEach((d) => {
      d.venta.venta_productos.forEach((vp, idx) => {
        out.push({
          id: `${d.id}-${idx}`,
          ventaFiadaId: d.id,
          ventaId: d.venta.id,
          productoNombre: vp.productos.nombre,
          cantidad: vp.cantidad,
          subtotal: vp.subtotal,
        });
      });
    });
    return out;
  }, [deudas]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const allSelected =
    items.length > 0 && items.every((it) => !!selected[it.id]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const map: Record<string, boolean> = {};
      items.forEach((it) => (map[it.id] = true));
      setSelected(map);
    }
  };

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectedItems = items.filter((it) => selected[it.id]);
  const total = selectedItems.reduce((s, it) => s + it.subtotal, 0);

  const groupedByVenta = useMemo(() => {
    const map = new Map<number, number>();
    selectedItems.forEach((it) => {
      map.set(it.ventaFiadaId, (map.get(it.ventaFiadaId) || 0) + it.subtotal);
    });
    return map;
  }, [selectedItems]);

  const handlePay = async () => {
    if (total <= 0) return;
    setLoading(true);
    try {
      for (const [ventaFiadaId, amount] of groupedByVenta.entries()) {
        await registrarPago(
          ventaFiadaId,
          amount,
          method || undefined,
          notes || undefined
        );
      }
      if (onPaid) onPaid();
      onClose();
    } catch (err) {
      console.error("Error al pagar seleccionados:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago" size="lg">
      <div className="space-y-6">
        {/* Header con instrucciones */}
        <div className="pb-4 border-b border-neutral-700">
          <p className="text-sm text-gray-400 leading-relaxed">
            Selecciona los productos que deseas pagar
          </p>
        </div>

        {/* Lista de productos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Productos ({items.length})
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
            >
              {allSelected ? "Limpiar selección" : "Seleccionar todo"}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay productos adeudados
              </div>
            ) : (
              items.map((it) => (
                <label
                  key={it.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                    ${
                      selected[it.id]
                        ? "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                        : "bg-neutral-800/30 border-neutral-700/50 hover:bg-neutral-800/50 hover:border-neutral-600"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[it.id]}
                    onChange={() => toggle(it.id)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-0 bg-neutral-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="text-sm font-medium text-white truncate">
                        {it.productoNombre}
                      </span>
                      <span className="text-sm font-semibold text-white whitespace-nowrap">
                        {formatCurrency(it.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Venta #{it.ventaId}</span>
                      <span>•</span>
                      <span>Cantidad: {it.cantidad}</span>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Detalles del pago */}
        <div className="space-y-4 pt-4 border-t border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Método de pago
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              >
                <option value="">Seleccionar método</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Notas <span className="text-gray-600">(opcional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar nota..."
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-4 px-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <span className="text-sm font-medium text-gray-400">
              Total a pagar
            </span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white text-sm font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handlePay}
            disabled={total <= 0 || loading}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:text-gray-500 rounded-lg text-white text-sm font-semibold transition-all shadow-lg shadow-green-600/20 disabled:shadow-none"
          >
            {loading ? "Procesando..." : "Confirmar Pago"}
          </button>
        </div>
      </div>

      {/* Usar <style> normal en lugar de styled-jsx (no estamos en Next.js) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }
      `}</style>
    </Modal>
  );
};

export default PaymentModal;
