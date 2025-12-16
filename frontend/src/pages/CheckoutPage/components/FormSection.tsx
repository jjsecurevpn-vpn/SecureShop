import { AlertCircle } from "lucide-react";
import CheckoutForm, { CheckoutFormRef } from "../../../components/CheckoutForm";

interface FormSectionProps {
  error: string;
  formRef: React.RefObject<CheckoutFormRef>;
  planId: number;
  planPrecio: number;
  onCuponChange: (descuento: number) => void;
  onEmailChange?: (email: string) => void;
  userEmail?: string;
}

export const FormSection = ({ 
  error, 
  formRef, 
  planId, 
  planPrecio, 
  onCuponChange,
  onEmailChange,
  userEmail
}: FormSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-rose-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <CheckoutForm
        ref={formRef}
        planId={planId}
        planPrecio={planPrecio}
        loading={false}
        onCuponChange={onCuponChange}
        onEmailChange={onEmailChange}
        userEmail={userEmail}
      />
    </div>
  );
};