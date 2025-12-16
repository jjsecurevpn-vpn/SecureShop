import { Sparkles } from "lucide-react";
import { CHECKOUT_MESSAGES } from "../constants";

interface PaymentSectionProps {
  processingPayment: boolean;
  onPaymentButtonClick: () => void;
  pagoConSaldoCompleto?: boolean;
}

export const PaymentSection = ({ 
  processingPayment, 
  onPaymentButtonClick,
  pagoConSaldoCompleto = false
}: PaymentSectionProps) => {
  // Si el pago es completo con saldo, mostrar botón especial
  if (pagoConSaldoCompleto) {
    return (
      <div className="space-y-3">
        <button
          onClick={onPaymentButtonClick}
          disabled={processingPayment}
          className="w-full py-4 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white text-base font-semibold rounded-lg transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
        >
          {processingPayment ? (
            CHECKOUT_MESSAGES.PAYMENT_PROCESSING
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Pagar con saldo
            </>
          )}
        </button>
        <p className="text-xs text-center text-gray-500">
          Tu saldo cubre el total. No necesitas usar otro método de pago.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* MercadoPago Wallet Container */}
      <div id="mp-wallet-container-unique" className="min-h-[56px]" />

      {/* Fallback Button if MercadoPago doesn't load */}
      <button
        onClick={onPaymentButtonClick}
        disabled={processingPayment}
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors hidden shadow-md shadow-indigo-100"
        id="fallback-payment-button"
      >
        {processingPayment ? CHECKOUT_MESSAGES.PAYMENT_PROCESSING : CHECKOUT_MESSAGES.PAYMENT_BUTTON_TEXT}
      </button>
    </div>
  );
};