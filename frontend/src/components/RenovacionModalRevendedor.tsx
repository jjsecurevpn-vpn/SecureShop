import { useState } from 'react';
import { X, Search, RefreshCw, AlertCircle, CheckCircle, Loader2, Calendar, CreditCard } from 'lucide-react';
import { useEffect } from 'react';

interface RenovacionModalRevendedorProps {
  isOpen: boolean;
  onClose: () => void;
}

type Paso = 'buscar' | 'seleccionar' | 'checkout';

interface RevendedorEncontrado {
  datos: {
    servex_revendedor_id: number;
    servex_username: string;
    servex_account_type: 'validity' | 'credit';
    max_users: number;
    expiration_date?: string;
    cliente_nombre: string;
    cliente_email: string;
  };
}

export default function RenovacionModalRevendedor({ isOpen, onClose }: RenovacionModalRevendedorProps) {
  const [paso, setPaso] = useState<Paso>('buscar');
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [revendedor, setRevendedor] = useState<RevendedorEncontrado | null>(null);
  const [tipoRenovacion, setTipoRenovacion] = useState<'validity' | 'credit'>('validity');
  const [creditosSeleccionados, setCreditosSeleccionados] = useState(5);
  const [procesando, setProcesando] = useState(false);
  const [nombreCliente, setNombreCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const buscarRevendedor = async () => {
    if (!busqueda.trim()) {
      setError('Por favor ingresa un email o username');
      return;
    }

    setBuscando(true);
    setError('');

    try {
      const response = await fetch('/api/renovacion/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busqueda: busqueda.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al buscar la cuenta');
      }

      if (!data.encontrado || data.tipo !== 'revendedor') {
        setError('No se encontró ninguna cuenta de revendedor con ese email o username');
        return;
      }

      setRevendedor(data as RevendedorEncontrado);
      setTipoRenovacion(data.datos.servex_account_type);
      setNombreCliente(data.datos.cliente_nombre || '');
      setEmailCliente(data.datos.cliente_email || '');
      setPaso('seleccionar');
    } catch (err: any) {
      setError(err.message || 'Error al buscar el revendedor');
    } finally {
      setBuscando(false);
    }
  };

  const procesarRenovacion = async () => {
    if (!revendedor || !nombreCliente.trim() || !emailCliente.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setProcesando(true);
    setError('');

    try {
      // Calcular días según el tipo y la cantidad seleccionada
      let dias = 30; // Por defecto 30 días para validez
      
      if (tipoRenovacion === 'credit') {
        // Para créditos, los días varían según el plan
        const diasPorCreditos: Record<number, number> = {
          5: 30,   // 1 mes
          10: 60,  // 2 meses
          20: 90,  // 3 meses
          30: 120, // 4 meses
          40: 150, // 5 meses
          50: 150, // 5 meses
          60: 150, // 5 meses
          80: 150, // 5 meses
          100: 150, // 5 meses
          150: 150, // 5 meses
          200: 150, // 5 meses
        };
        dias = diasPorCreditos[creditosSeleccionados] || 30;
      }

      const body: any = {
        busqueda: busqueda.trim(),
        dias,
        tipoRenovacion,
        cantidadSeleccionada: creditosSeleccionados, // usuarios o créditos
        clienteEmail: emailCliente.trim(),
        clienteNombre: nombreCliente.trim()
      };

      console.log('[RenovacionRevendedor] Enviando datos:', body);

      const response = await fetch('/api/renovacion/revendedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la renovación');
      }

      if (data.linkPago) {
        window.location.href = data.linkPago;
      } else {
        throw new Error('No se recibió el enlace de pago');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la renovación');
      setProcesando(false);
    }
  };

  const calcularPrecio = () => {
    if (tipoRenovacion === 'validity') {
      // Planes de validez (30 días)
      const preciosValidez: Record<number, number> = {
        5: 10000,
        10: 18000,
        20: 32000,
        30: 42000,
        50: 60000,
        75: 78000,
        100: 90000,
      };
      return preciosValidez[creditosSeleccionados] || 0;
    } else {
      // Planes de créditos
      const preciosCreditos: Record<number, number> = {
        5: 12000,
        10: 20000,
        20: 36000,
        30: 51000,
        40: 64000,
        50: 75000,
        60: 84000,
        80: 104000,
        100: 110000,
        150: 150000,
        200: 190000,
      };
      return preciosCreditos[creditosSeleccionados] || 0;
    }
  };

  const handleClose = () => {
    setPaso('buscar');
    setBusqueda('');
    setRevendedor(null);
    setError('');
    setTipoRenovacion('validity');
    setCreditosSeleccionados(5);
    setNombreCliente('');
    setEmailCliente('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] border border-gray-800/60 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-900 border-b border-gray-800/60 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Renovar Revendedor</h2>
              <p className="text-xs text-gray-400">
                {paso === 'buscar' && 'Busca tu cuenta de revendedor'}
                {paso === 'seleccionar' && 'Configura tu renovación'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Paso 1: Buscar */}
          {paso === 'buscar' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Email o Username del Revendedor
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarRevendedor()}
                    placeholder="ejemplo@email.com o username123"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20"
                    disabled={buscando}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Ingresa el email o username que usaste al comprar
                </p>
              </div>

              <button
                onClick={buscarRevendedor}
                disabled={buscando || !busqueda.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {buscando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar Revendedor
                  </>
                )}
              </button>
            </div>
          )}

          {/* Paso 2: Seleccionar opciones */}
          {paso === 'seleccionar' && revendedor && (
            <div className="space-y-4">
              {/* Info del revendedor */}
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="text-pink-300 font-semibold">¡Revendedor encontrado!</p>
                    <div className="text-gray-300 space-y-0.5">
                      <div>
                        <span className="text-gray-500">Username:</span>{' '}
                        <span className="font-medium">{revendedor.datos.servex_username}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tipo de cuenta:</span>{' '}
                        <span className="font-medium">
                          {revendedor.datos.servex_account_type === 'validity' ? 'Validez' : 'Créditos'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Usuarios máx.:</span>{' '}
                        <span className="font-medium">{revendedor.datos.max_users}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selector de tipo de renovación */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Tipo de Renovación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => revendedor?.datos.servex_account_type === 'validity' && setTipoRenovacion('validity')}
                    disabled={revendedor?.datos.servex_account_type !== 'validity'}
                    className={`p-3 rounded-lg border-2 transition-all text-xs ${
                      revendedor?.datos.servex_account_type !== 'validity'
                        ? 'border-gray-700/30 bg-gray-800/20 cursor-not-allowed opacity-50'
                        : tipoRenovacion === 'validity'
                        ? 'border-pink-500 bg-pink-500/10 hover:border-pink-400 cursor-pointer'
                        : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600 cursor-pointer'
                    }`}
                    title={revendedor?.datos.servex_account_type !== 'validity' ? 'Esta cuenta es de créditos' : ''}
                  >
                    <Calendar className={`w-5 h-5 mx-auto mb-1.5 ${
                      tipoRenovacion === 'validity' ? 'text-pink-400' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium ${
                      tipoRenovacion === 'validity' ? 'text-pink-300' : 'text-gray-400'
                    }`}>
                      Validez
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">+30 días</p>
                  </button>

                  <button
                    onClick={() => revendedor?.datos.servex_account_type === 'credit' && setTipoRenovacion('credit')}
                    disabled={revendedor?.datos.servex_account_type !== 'credit'}
                    className={`p-3 rounded-lg border-2 transition-all text-xs ${
                      revendedor?.datos.servex_account_type !== 'credit'
                        ? 'border-gray-700/30 bg-gray-800/20 cursor-not-allowed opacity-50'
                        : tipoRenovacion === 'credit'
                        ? 'border-pink-500 bg-pink-500/10 hover:border-pink-400 cursor-pointer'
                        : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600 cursor-pointer'
                    }`}
                    title={revendedor?.datos.servex_account_type !== 'credit' ? 'Esta cuenta es de validez' : ''}
                  >
                    <CreditCard className={`w-5 h-5 mx-auto mb-1.5 ${
                      tipoRenovacion === 'credit' ? 'text-pink-400' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium ${
                      tipoRenovacion === 'credit' ? 'text-pink-300' : 'text-gray-400'
                    }`}>
                      Créditos
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Variable</p>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {revendedor?.datos.servex_account_type === 'validity' 
                    ? 'Esta cuenta es de validez. Si necesitas créditos, adquiere otra cuenta.'
                    : 'Esta cuenta es de créditos. Si necesitas validez, adquiere otra cuenta.'}
                </p>
              </div>

              {/* Opciones según el tipo */}
              {tipoRenovacion === 'validity' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Plan de Validez (30 días)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[5, 10, 20, 30, 50, 75, 100].map((cantidad) => (
                      <button
                        key={cantidad}
                        onClick={() => setCreditosSeleccionados(cantidad)}
                        className={`p-2 rounded-lg border-2 transition-all text-xs font-medium ${
                          creditosSeleccionados === cantidad
                            ? 'border-pink-500 bg-pink-500/15 text-pink-300'
                            : 'border-gray-700/50 bg-gray-800/40 text-gray-300 hover:border-gray-600 hover:bg-gray-800/60'
                        }`}
                      >
                        <div className="font-semibold">{cantidad}</div>
                        <div className="text-xs text-gray-400">
                          {cantidad === 5 && '$10K'}
                          {cantidad === 10 && '$18K'}
                          {cantidad === 20 && '$32K'}
                          {cantidad === 30 && '$42K'}
                          {cantidad === 50 && '$60K'}
                          {cantidad === 75 && '$78K'}
                          {cantidad === 100 && '$90K'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tipoRenovacion === 'credit' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Plan de Créditos
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
                    {[5, 10, 20, 30, 40, 50, 60, 80, 100, 150, 200].map((cantidad) => {
                      const precios: Record<number, string> = {
                        5: '$12K', 10: '$20K', 20: '$36K', 30: '$51K', 40: '$64K',
                        50: '$75K', 60: '$84K', 80: '$104K', 100: '$110K', 150: '$150K', 200: '$190K'
                      };
                      const duracion: Record<number, string> = {
                        5: '1m', 10: '2m', 20: '3m', 30: '4m', 40: '5m',
                        50: '5m', 60: '5m', 80: '5m', 100: '5m', 150: '5m', 200: '5m'
                      };
                      return (
                        <button
                          key={cantidad}
                          onClick={() => setCreditosSeleccionados(cantidad)}
                          className={`p-2 rounded-lg border-2 transition-all text-xs font-medium ${
                            creditosSeleccionados === cantidad
                              ? 'border-pink-500 bg-pink-500/15 text-pink-300'
                              : 'border-gray-700/50 bg-gray-800/40 text-gray-300 hover:border-gray-600 hover:bg-gray-800/60'
                          }`}
                        >
                          <div className="font-semibold">{cantidad}</div>
                          <div className="text-xs text-gray-400">
                            {precios[cantidad]} / {duracion[cantidad]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Datos del cliente */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20"
                />

                <input
                  type="email"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20"
                />
              </div>

              {/* Resumen de precio */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {tipoRenovacion === 'validity' ? 'Usuarios:' : 'Créditos:'}
                  </span>
                  <span className="text-white font-semibold">{creditosSeleccionados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duración:</span>
                  <span className="text-white font-semibold">
                    {tipoRenovacion === 'validity' 
                      ? '30 días' 
                      : (() => {
                          const diasPorCreditos: Record<number, number> = {
                            5: 30, 10: 60, 20: 90, 30: 120, 40: 150, 50: 150,
                            60: 150, 80: 150, 100: 150, 150: 150, 200: 150
                          };
                          const dias = diasPorCreditos[creditosSeleccionados] || 30;
                          return `${dias} días`;
                        })()
                    }
                  </span>
                </div>
                <div className="border-t border-gray-700/50 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total:</span>
                    <span className="text-pink-400 font-bold text-lg">
                      ${calcularPrecio().toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPaso('buscar');
                    setError('');
                  }}
                  className="flex-1 py-2.5 bg-gray-800/50 text-gray-300 font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors border border-gray-700/50"
                >
                  Volver
                </button>
                <button
                  onClick={procesarRenovacion}
                  disabled={procesando || !nombreCliente.trim() || !emailCliente.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Continuar al Pago
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
