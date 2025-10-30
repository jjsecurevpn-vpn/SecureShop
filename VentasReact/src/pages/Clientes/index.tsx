import React, { useState, useEffect } from "react";
import { useClientes } from "../../hooks/useClientes";
import { useNotification } from "../../hooks/useNotification";
// import { formatCurrency } from "../../utils/api";
import type { Cliente, VentaFiada, PagoFiado } from "../../hooks/useClientes";
import ClienteSidebar from "./ClienteSidebar";
import ClienteForm from "../../components/ClienteForm";
import { supabase } from "../../lib/supabase";
import Modal from "../../components/Modal";
import PaymentModal from "../../components/PaymentModal";
import ClienteHeader from "./ClienteHeader";
import ClienteDetails from "./ClienteDetails";
import ClientListBottomSheet from "./ClientListBottomSheet";

const Clientes: React.FC = () => {
  // Estado para mostrar el modal de 'Pagar Productos' (selección)
  const [showPayProductsModal, setShowPayProductsModal] = useState(false);
  // notification state removed because it's unused; notifications handled by context
  const [clientePendienteEliminar, setClientePendienteEliminar] =
    useState<Cliente | null>(null);
  const {
    clientes,
    loading,
    error,
    cargarClientes,
    cargarDeudasCliente,
    cargarPagosCliente,
    registrarPago,
  } = useClientes();
  const { showNotification } = useNotification();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [deudas, setDeudas] = useState<VentaFiada[]>([]);
  const [pagos, setPagos] = useState<PagoFiado[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activePaymentDebt, setActivePaymentDebt] = useState<VentaFiada | null>(
    null
  );
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | undefined>(
    undefined
  );

  // Calcular deuda total del cliente seleccionado
  const calcularDeudaTotal = (clienteDeudas: VentaFiada[]) => {
    return clienteDeudas.reduce((total, deuda) => total + deuda.venta.total, 0);
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Cuando se solicita registrar pago para UNA deuda, abrimos el modal de selección
  const handleOpenPaymentForDebt = (deuda: VentaFiada) => {
    setActivePaymentDebt(deuda);
    setShowPayProductsModal(true);
  };

  // Cargar detalles del cliente seleccionado
  const loadClienteDetails = async (clienteId: number) => {
    setLoadingDetails(true);
    try {
      const deudasData = await cargarDeudasCliente(clienteId);
      const pagosData = await cargarPagosCliente(clienteId);
      setDeudas(deudasData);
      setPagos(pagosData);
    } catch (error) {
      console.error("Error loading client details:", error);
      showNotification("Error al cargar detalles del cliente", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Auto-seleccionar el primer cliente si hay clientes y ninguno está seleccionado
  useEffect(() => {
    if (clientes.length > 0 && !selectedCliente) {
      setSelectedCliente(clientes[0]);
    }
  }, [clientes, selectedCliente]);

  // Editar cliente
  const handleEditCliente = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setShowClienteForm(true);
  };

  // Eliminar cliente
  const handleDeleteCliente = (cliente: Cliente) => {
    setClientePendienteEliminar(cliente);
    showNotification(
      `¿Seguro que deseas eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`,
      "warning",
      10000
    );
  };

  const confirmarEliminarCliente = async () => {
    if (!clientePendienteEliminar) return;
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", clientePendienteEliminar.id);
      if (error) throw error;
      showNotification(`Cliente eliminado exitosamente`, "success", 4000);
      cargarClientes();
      if (selectedCliente?.id === clientePendienteEliminar.id)
        setSelectedCliente(null);
    } catch (error) {
      console.error("Error deleting client:", error);
      showNotification("Error al eliminar el cliente", "error", 4000);
    } finally {
      setClientePendienteEliminar(null);
    }
  };

  const handleCloseNotification = () => {
    // hideNotification is not exported from this file; using showNotification with empty duration 0 to clear
    // but we can directly call showNotification('', 'info', 0) to clear; instead call hideNotification if available
    // However useNotification hook provides hideNotification; get it from hook above.
    // For simplicity, we'll call showNotification with duration 0 to immediately clear.
    // (If hideNotification is available via hook, prefer that.)
    setClientePendienteEliminar(null);
    // no-op: notifications are managed by useNotification; modal close will hide UI
  };

  // Abrir modal para agregar cliente
  const handleAddCliente = () => {
    setClienteToEdit(undefined);
    setShowClienteForm(true);
  };

  const handleCloseForm = () => {
    setShowClienteForm(false);
    setClienteToEdit(undefined);
  };

  // Cargar detalles cuando cambia el cliente seleccionado
  useEffect(() => {
    if (selectedCliente) {
      loadClienteDetails(selectedCliente.id);
    }
  }, [selectedCliente]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Cargando clientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-900 text-white">
      {/* Modal de confirmación para eliminar cliente */}
      <Modal
        isOpen={!!clientePendienteEliminar}
        onClose={handleCloseNotification}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-lg text-center text-red-300 font-semibold">
            ¿Seguro que deseas eliminar a{" "}
            <span className="text-white">
              {clientePendienteEliminar?.nombre}
            </span>
            ?<br />
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={confirmarEliminarCliente}
              className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
            <button
              onClick={handleCloseNotification}
              className="px-5 py-2 bg-neutral-700 text-white rounded-lg font-semibold shadow hover:bg-neutral-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
      {/* Modal de confirmación para eliminar cliente */}
      <Modal
        isOpen={!!clientePendienteEliminar}
        onClose={handleCloseNotification}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-lg text-center text-red-300 font-semibold">
            ¿Seguro que deseas eliminar a{" "}
            <span className="text-white">
              {clientePendienteEliminar?.nombre}
            </span>
            ?<br />
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={confirmarEliminarCliente}
              className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
            <button
              onClick={handleCloseNotification}
              className="px-5 py-2 bg-neutral-700 text-white rounded-lg font-semibold shadow hover:bg-neutral-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
      <ClienteHeader
        selectedCliente={selectedCliente}
        onOpenBottomSheet={() => setIsBottomSheetOpen(true)}
        onAddCliente={handleAddCliente}
        onPayAll={() => setShowPayProductsModal(true)}
      />
      {/* Modal para pagar productos seleccionados */}
      {showPayProductsModal && selectedCliente && (
        <PaymentModal
          isOpen={showPayProductsModal}
          onClose={() => {
            setShowPayProductsModal(false);
            setActivePaymentDebt(null);
          }}
          deudas={activePaymentDebt ? [activePaymentDebt] : deudas}
          registrarPago={registrarPago}
          onPaid={() => {
            showNotification("Pago(s) registrado(s) exitosamente", "success");
            setShowPayProductsModal(false);
            setActivePaymentDebt(null);
            if (selectedCliente) loadClienteDetails(selectedCliente.id);
          }}
        />
      )}

      <div className="flex">
        <ClienteSidebar
          clientes={clientes}
          selectedCliente={selectedCliente}
          onSelectCliente={setSelectedCliente}
          onAddCliente={handleAddCliente}
          onEditCliente={handleEditCliente}
          onDeleteCliente={handleDeleteCliente}
        />

        <ClienteDetails
          selectedCliente={selectedCliente}
          deudas={deudas}
          pagos={pagos}
          loadingDetails={loadingDetails}
          calcularDeudaTotal={calcularDeudaTotal}
          onRegisterPayment={(deuda) => {
            handleOpenPaymentForDebt(deuda);
          }}
          onPayAll={() => setShowPayProductsModal(true)}
        />
      </div>

      {/* Bottom Sheet para móvil */}
      <ClientListBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        clientes={clientes}
        selectedCliente={selectedCliente}
        onSelectCliente={setSelectedCliente}
      />

      {/* (El modal de pago por venta individual fue reemplazado por PaymentModal seleccional) */}

      {/* Modal para agregar/editar cliente */}
      <ClienteForm
        isOpen={showClienteForm}
        onClose={handleCloseForm}
        cliente={clienteToEdit}
        onSave={cargarClientes}
      />
    </div>
  );
};

export default Clientes;
