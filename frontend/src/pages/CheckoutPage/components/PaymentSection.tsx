import { Sparkles, Loader2, Wallet } from "lucide-react";
import { motion } from "framer-motion";
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
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onPaymentButtonClick}
          disabled={processingPayment}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-3"
        >
          {processingPayment ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {CHECKOUT_MESSAGES.PAYMENT_PROCESSING}
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Pagar con mi saldo
            </>
          )}
        </button>
        <div className="flex items-center gap-2 justify-center text-sm text-emerald-600 bg-emerald-50 rounded-lg py-2 px-3">
          <Sparkles className="w-4 h-4" />
          <span>Tu saldo cubre el total. No necesitas otro método de pago.</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* MercadoPago Wallet Container */}
      <div id="mp-wallet-container-unique" className="min-h-[56px]" />

      {/* Fallback Button if MercadoPago doesn't load */}
      <button
        onClick={onPaymentButtonClick}
        disabled={processingPayment}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-purple-200/50 hidden flex items-center justify-center gap-2"
        id="fallback-payment-button"
      >
        {processingPayment ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {CHECKOUT_MESSAGES.PAYMENT_PROCESSING}
          </>
        ) : (
          CHECKOUT_MESSAGES.PAYMENT_BUTTON_TEXT
        )}
      </button>
    </motion.div>
  );
};