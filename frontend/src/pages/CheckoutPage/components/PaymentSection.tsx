import { CHECKOUT_MESSAGES } from "../constants";

interface PaymentSectionProps {
  processingPayment: boolean;
  onPaymentButtonClick: () => void;
}

export const PaymentSection = ({ processingPayment, onPaymentButtonClick }: PaymentSectionProps) => {
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