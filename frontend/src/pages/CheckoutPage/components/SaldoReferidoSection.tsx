import { useState, useEffect } from 'react';
import { Wallet, Gift, Check, X, Loader2, Info, Sparkles } from 'lucide-react';
import { useReferralCode, useUserSaldo } from '../../../hooks/useReferralCode';
import { referidosService } from '../../../services/api.service';

interface SaldoReferidoSectionProps {
  userEmail?: string;
  precioTotal: number;
  onSaldoChange: (saldoUsado: number, montoAPagar: number) => void;
  onReferidoChange: (codigo: string | null, descuento: number) => void;
}

export function SaldoReferidoSection({
  userEmail,
  precioTotal,
  onSaldoChange,
  onReferidoChange,
}: SaldoReferidoSectionProps) {
  const { saldo } = useUserSaldo(userEmail);
  const {
    referralCode,
    referralValidation,
    isValidating,
    descuentoReferido,
    validateCode,
    clearReferralCode,
  } = useReferralCode(userEmail);

  const [usarSaldo, setUsarSaldo] = useState(false);
  const [saldoAUsar, setSaldoAUsar] = useState(0);
  const [codigoManual, setCodigoManual] = useState('');
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);
  const [programaActivo, setProgramaActivo] = useState(true);

  // Verificar si el programa está activo
  useEffect(() => {
    referidosService.getSettings()
      .then(settings => setProgramaActivo(settings.activo))
      .catch(() => setProgramaActivo(false));
  }, []);

  // Calcular descuento por referido
  const descuentoPorReferido = referralValidation?.valido 
    ? Math.round(precioTotal * descuentoReferido / 100) 
    : 0;

  // Precio después de descuento por referido
  const precioConDescuentoReferido = precioTotal - descuentoPorReferido;

  // Calcular cuánto saldo se puede usar
  useEffect(() => {
    if (usarSaldo && saldo > 0) {
      const maxSaldo = Math.min(saldo, precioConDescuentoReferido);
      setSaldoAUsar(maxSaldo);
    } else {
      setSaldoAUsar(0);
    }
  }, [usarSaldo, saldo, precioConDescuentoReferido]);

  // Notificar cambios de saldo
  useEffect(() => {
    const montoFinal = precioConDescuentoReferido - saldoAUsar;
    onSaldoChange(saldoAUsar, Math.max(0, montoFinal));
  }, [saldoAUsar, precioConDescuentoReferido, onSaldoChange]);

  // Notificar cambios de referido
  useEffect(() => {
    onReferidoChange(
      referralValidation?.valido ? referralCode : null,
      descuentoPorReferido
    );
  }, [referralCode, referralValidation, descuentoPorReferido, onReferidoChange]);

  const handleValidarCodigo = async () => {
    if (codigoManual.trim()) {
      await validateCode(codigoManual.trim(), userEmail);
      setMostrarInputCodigo(false);
      setCodigoManual('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Si el programa no está activo y no hay saldo, no mostrar nada
  if (!programaActivo && (!userEmail || saldo === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Sección de Saldo - Solo si el usuario tiene email y saldo */}
      {userEmail && saldo > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Tu saldo disponible</span>
            </div>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(saldo)}
            </span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={usarSaldo}
                onChange={(e) => setUsarSaldo(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                usarSaldo 
                  ? 'bg-green-600 border-green-600' 
                  : 'bg-white border-gray-300 group-hover:border-green-400'
              }`}>
                {usarSaldo && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-700">
              Usar saldo para pagar
              {usarSaldo && saldoAUsar > 0 && (
                <span className="ml-1 font-medium text-green-700">
                  (-{formatCurrency(saldoAUsar)})
                </span>
              )}
            </span>
          </label>

          {usarSaldo && saldoAUsar >= precioConDescuentoReferido && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-100 rounded-lg px-3 py-2">
              <Sparkles className="w-4 h-4" />
              <span>¡Tu saldo cubre el total! No necesitas pagar.</span>
            </div>
          )}
        </div>
      )}

      {/* Sección de Código de Referido */}
      {programaActivo && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-800">Código de referido</span>
          </div>

          {referralCode && referralValidation?.valido ? (
            // Código válido aplicado
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="font-mono font-medium text-purple-800">{referralCode}</span>
                <span className="text-sm text-green-600">
                  -{descuentoReferido}% aplicado
                </span>
              </div>
              <button
                onClick={clearReferralCode}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Quitar código"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : referralValidation && !referralValidation.valido ? (
            // Código inválido
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                <X className="w-4 h-4" />
                <span>{referralValidation.mensaje}</span>
              </div>
              <button
                onClick={() => setMostrarInputCodigo(true)}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Probar otro código
              </button>
            </div>
          ) : mostrarInputCodigo ? (
            // Input para ingresar código
            <div className="flex gap-2">
              <input
                type="text"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
                placeholder="Ingresa el código"
                className="flex-1 px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono uppercase"
                maxLength={10}
              />
              <button
                onClick={handleValidarCodigo}
                disabled={!codigoManual.trim() || isValidating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Aplicar'
                )}
              </button>
              <button
                onClick={() => {
                  setMostrarInputCodigo(false);
                  setCodigoManual('');
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Botón para mostrar input
            <button
              onClick={() => setMostrarInputCodigo(true)}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <Gift className="w-4 h-4" />
              ¿Tienes un código de referido?
            </button>
          )}

          {descuentoPorReferido > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-purple-700 bg-purple-100 rounded-lg px-3 py-2">
              <Info className="w-4 h-4" />
              <span>
                Ahorras <strong>{formatCurrency(descuentoPorReferido)}</strong> con este código
              </span>
            </div>
          )}
        </div>
      )}

      {/* Resumen de descuentos si hay alguno aplicado */}
      {(descuentoPorReferido > 0 || saldoAUsar > 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Resumen de descuentos</div>
          
          {descuentoPorReferido > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Descuento por referido ({descuentoReferido}%)</span>
              <span className="text-green-600">-{formatCurrency(descuentoPorReferido)}</span>
            </div>
          )}
          
          {saldoAUsar > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saldo utilizado</span>
              <span className="text-green-600">-{formatCurrency(saldoAUsar)}</span>
            </div>
          )}
          
          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total a pagar</span>
            <span className="text-lg">
              {formatCurrency(Math.max(0, precioConDescuentoReferido - saldoAUsar))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
