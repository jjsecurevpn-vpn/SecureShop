import { useState } from 'react';
import { X, Search, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface RenovacionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Paso = 'buscar' | 'seleccionar' | 'checkout';

interface CuentaEncontrada {
  tipo: 'cliente' | 'revendedor';
  datos: {
    id?: string;
    servex_cuenta_id?: number;
    servex_revendedor_id?: number;
    servex_username: string;
    connection_limit?: number;
    cliente_nombre: string;
    cliente_email: string;
    plan_nombre?: string;
    servex_account_type?: 'validity' | 'credit';
  };
}

export default function RenovacionModal({ isOpen, onClose }: RenovacionModalProps) {
  const [paso, setPaso] = useState<Paso>('buscar');
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [cuenta, setCuenta] = useState<CuentaEncontrada | null>(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState(7);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState<number | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [nombreCliente, setNombreCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [planesConOverrides, setPlanesConOverrides] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Cargar planes con overrides cuando se abre el modal
      cargarPlanesConOverrides();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const cargarPlanesConOverrides = async () => {
    try {
      console.log('[RenovacionModal] Iniciando fetch a /api/planes...');
      const response = await fetch('/api/planes', { cache: 'no-store' });
      console.log('[RenovacionModal] Respuesta status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('[RenovacionModal] Error HTTP:', response.status, response.statusText);
        return;
      }
      
      const resultado = await response.json();
      // El API devuelve {success: true, data: [...]}
      const planes = resultado.data || resultado;
      console.log('[RenovacionModal] ✅ Planes cargados:', planes.length, 'planes', planes);
      setPlanesConOverrides(planes);
    } catch (err) {
      console.error('[RenovacionModal] Error cargando planes:', err);
    }
  };

  if (!isOpen) return null;

  const buscarCuenta = async () => {
    if (!busqueda.trim()) {
      setError('Por favor ingresa un email o username');
      return;
    }

    setBuscando(true);
    setError('');

    try {
      const response = await fetch('/api/renovacion/buscar?tipo=cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busqueda: busqueda.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al buscar la cuenta');
      }

      if (!data.encontrado) {
        setError('No se encontró ninguna cuenta con ese email o username');
        return;
      }

      setCuenta(data as CuentaEncontrada);
      setNombreCliente(data.datos.cliente_nombre || '');
      setEmailCliente(data.datos.cliente_email || '');
      setPaso('seleccionar');
    } catch (err: any) {
      setError(err.message || 'Error al buscar la cuenta');
    } finally {
      setBuscando(false);
    }
  };

  const procesarRenovacion = async () => {
    if (!cuenta || !nombreCliente.trim() || !emailCliente.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setProcesando(true);
    setError('');

    try {
      const endpoint = cuenta.tipo === 'cliente' 
        ? '/api/renovacion/cliente'
        : '/api/renovacion/revendedor';

      const body: any = {
        busqueda: busqueda.trim(),
        dias: diasSeleccionados,
        precio: calcularPrecio(), // Enviar precio calculado correctamente
        clienteEmail: emailCliente.trim(),
        clienteNombre: nombreCliente.trim()
      };

      // Si hay cambio de dispositivos (y es diferente al actual), incluirlo
      if (cuenta.tipo === 'cliente' && dispositivosSeleccionados !== null) {
        const limiteActual = cuenta.datos.connection_limit || 1;
        console.log('[DEBUG] Límite actual:', limiteActual, '| Límite seleccionado:', dispositivosSeleccionados);
        if (dispositivosSeleccionados !== limiteActual) {
          body.nuevoConnectionLimit = dispositivosSeleccionados;
          console.log('[DEBUG] ✅ Enviando nuevoConnectionLimit:', dispositivosSeleccionados);
        } else {
          console.log('[DEBUG] ⚠️ No se envía nuevoConnectionLimit (son iguales)');
        }
      } else {
        console.log('[DEBUG] dispositivosSeleccionados es null, no se envía cambio de límite');
      }

      console.log('[DEBUG] Body a enviar:', JSON.stringify(body, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la renovación');
      }

      // Redirigir a MercadoPago
      window.location.href = data.linkPago;
    } catch (err: any) {
      setError(err.message || 'Error al procesar la renovación');
      setProcesando(false);
    }
  };

  const calcularPrecio = () => {
    if (!cuenta) return 0;
    
    if (cuenta.tipo === 'revendedor') {
      // Revendedores: $200 por día fijo
      return diasSeleccionados * 200;
    }
    
    // Clientes: Usar planes cargados del servidor (con overrides aplicados)
    const connectionLimit = dispositivosSeleccionados || cuenta.datos.connection_limit || 1;
    
    // Encontrar un plan de 30 días con los dispositivos seleccionados
    let planBase = null;
    if (Array.isArray(planesConOverrides) && planesConOverrides.length > 0) {
      planBase = planesConOverrides.find(p => p.dias === 30 && p.connection_limit === connectionLimit);
      console.log('[RenovacionModal] Plans loaded:', planesConOverrides.length, 'Plan encontrado para 30d, conexión', connectionLimit, ':', planBase);
    } else {
      console.log('[RenovacionModal] ⚠️ No planes cargados, usando fallback hardcodeado');
    }
    
    if (!planBase) {
      // Fallback a precios hardcodeados si no encuentra el plan
      const preciosBase30Dias: { [key: number]: number } = {
        1: 200,
        2: 333.33,
        3: 400,
        4: 500
      };
      const precioBasePorDia = preciosBase30Dias[connectionLimit] || (200 * connectionLimit);
      let multiplicador: number;
      
      if (diasSeleccionados >= 30) {
        multiplicador = 1.0;
      } else if (diasSeleccionados >= 15) {
        multiplicador = 1.5;
      } else if (diasSeleccionados >= 7) {
        multiplicador = 2.14;
      } else {
        multiplicador = 2.5;
      }
      
      return Math.round(diasSeleccionados * precioBasePorDia * multiplicador);
    }
    
    // Usar el precio del plan de 30 días como referencia
    const precioBasePorDia = planBase.precio / 30;
    console.log('[RenovacionModal] ✅ Usando precio del servidor:', planBase.precio, '→ precio/día:', precioBasePorDia);
    
    // Aplicar multiplicadores según días
    let multiplicador: number;
    
    if (diasSeleccionados >= 30) {
      multiplicador = 1.0;
    } else if (diasSeleccionados >= 15) {
      multiplicador = 1.5;
    } else if (diasSeleccionados >= 7) {
      multiplicador = 2.14;
    } else {
      multiplicador = 2.5;
    }
    
    return Math.round(diasSeleccionados * precioBasePorDia * multiplicador);
  };

  const resetear = () => {
    setPaso('buscar');
    setBusqueda('');
    setError('');
    setCuenta(null);
    setDiasSeleccionados(7);
    setDispositivosSeleccionados(null);
    setNombreCliente('');
    setEmailCliente('');
  };

  const cerrar = () => {
    resetear();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] border border-gray-800/60 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-900 border-b border-gray-800/60 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Renovar o Actualizar Cuenta</h2>
              <p className="text-xs text-gray-400">
                {paso === 'buscar' && 'Busca tu cuenta por email o username'}
                {paso === 'seleccionar' && 'Selecciona los días a agregar'}
                {paso === 'checkout' && 'Confirma tu renovación'}
              </p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
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
                  Email o Username
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarCuenta()}
                    placeholder="ejemplo@email.com o username123"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                    disabled={buscando}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Ingresa el email o username que usaste al comprar tu cuenta
                </p>
              </div>

              <button
                onClick={buscarCuenta}
                disabled={buscando || !busqueda.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {buscando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar Cuenta
                  </>
                )}
              </button>
            </div>
          )}

          {/* Paso 2: Seleccionar días */}
          {paso === 'seleccionar' && cuenta && (
            <div className="space-y-4">
              {/* Info de la cuenta encontrada */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="text-purple-300 font-semibold">¡Cuenta encontrada!</p>
                    <div className="text-gray-300 space-y-0.5">
                      <div>
                        <span className="text-gray-500">Tipo:</span>{' '}
                        <span className="font-medium">
                          {cuenta.tipo === 'cliente' ? 'Cliente VPN' : 'Cuenta Revendedor'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Username:</span>{' '}
                        <span className="font-medium">{cuenta.datos.servex_username}</span>
                      </div>
                      {cuenta.tipo === 'cliente' && cuenta.datos.connection_limit && (
                        <div>
                          <span className="text-gray-500">Dispositivos:</span>{' '}
                          <span className="font-medium">{cuenta.datos.connection_limit} {cuenta.datos.connection_limit === 1 ? 'dispositivo' : 'dispositivos'}</span>
                        </div>
                      )}
                      {cuenta.datos.plan_nombre && (
                        <div>
                          <span className="text-gray-500">Plan actual:</span>{' '}
                          <span className="font-medium">{cuenta.datos.plan_nombre}</span>
                        </div>
                      )}
                      {cuenta.tipo === 'revendedor' && cuenta.datos.servex_account_type && (
                        <div>
                          <span className="text-gray-500">Tipo de cuenta:</span>{' '}
                          <span className="font-medium">
                            {cuenta.datos.servex_account_type === 'validity' ? 'Validez' : 'Créditos'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selector de días con slider */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Días a agregar: <span className="text-purple-400 font-bold text-base">{diasSeleccionados}</span>
                </label>
                <div className="space-y-3">
                  {/* Slider */}
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={diasSeleccionados}
                    onChange={(e) => setDiasSeleccionados(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((diasSeleccionados - 1) / 29) * 100}%, #374151 ${((diasSeleccionados - 1) / 29) * 100}%, #374151 100%)`
                    }}
                  />
                  
                  {/* Indicadores de días */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 día</span>
                    <span>15 días</span>
                    <span>30 días</span>
                  </div>
                  
                  {/* Botones rápidos */}
                  <div className="grid grid-cols-4 gap-2">
                    {[7, 15, 21, 30].map((dias) => (
                      <button
                        key={dias}
                        onClick={() => setDiasSeleccionados(dias)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          diasSeleccionados === dias
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700/50'
                        }`}
                      >
                        {dias}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selector de dispositivos (solo para clientes) */}
              {cuenta.tipo === 'cliente' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Dispositivos simultáneos
                  </label>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-2.5 mb-2">
                    <p className="text-xs text-gray-400">
                      Actual: <span className="text-white font-semibold">{cuenta.datos.connection_limit || 1}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((dispositivos) => {
                      const esActual = dispositivos === cuenta.datos.connection_limit;
                      const esSeleccionado = dispositivosSeleccionados === dispositivos;
                      
                      return (
                        <button
                          key={dispositivos}
                          onClick={() => setDispositivosSeleccionados(dispositivos)}
                          className={`p-2 sm:p-2.5 rounded-lg border-2 transition-all relative ${
                            esSeleccionado
                              ? 'border-purple-500 bg-purple-500/10 text-white'
                              : esActual
                              ? 'border-purple-500/50 bg-purple-500/5 text-white'
                              : 'border-gray-700/50 bg-gray-800/40 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {esActual && !esSeleccionado && (
                            <span className="absolute -top-1.5 -right-1.5 bg-purple-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                              Actual
                            </span>
                          )}
                          {esSeleccionado && (
                            <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                              Nuevo
                            </span>
                          )}
                          <p className="text-lg sm:text-xl font-bold">{dispositivos}</p>
                          <p className="text-[10px] sm:text-xs mt-0.5 leading-tight">
                            {dispositivos === 1 ? 'disp.' : 'disp.'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">
                            ${(() => {
                              if (Array.isArray(planesConOverrides) && planesConOverrides.length > 0) {
                                const planBase = planesConOverrides.find(p => p.dias === 30 && p.connection_limit === dispositivos);
                                if (planBase) {
                                  return Math.round(planBase.precio / 30);
                                }
                              }
                              switch(dispositivos) {
                                case 1: return '200';
                                case 2: return '333';
                                case 3: return '400';
                                case 4: return '500';
                                default: return '200';
                              }
                            })()}/d
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Datos de contacto */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                />

                <input
                  type="email"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                />
              </div>

              {/* Resumen de precio */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Días a agregar:</span>
                  <span className="text-white font-semibold">{diasSeleccionados} {diasSeleccionados === 1 ? 'día' : 'días'}</span>
                </div>
                {cuenta.tipo === 'cliente' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dispositivos:</span>
                    <span className="text-white font-semibold">
                      {dispositivosSeleccionados || cuenta.datos.connection_limit || 1} {((dispositivosSeleccionados || cuenta.datos.connection_limit || 1) === 1) ? 'dispositivo' : 'dispositivos'}
                      {dispositivosSeleccionados && dispositivosSeleccionados !== cuenta.datos.connection_limit && (
                        <span className="ml-2 text-xs text-purple-400">
                          (cambio de {cuenta.datos.connection_limit})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Precio por día:</span>
                  <span className="text-white font-semibold">
                    ${(() => {
                      if (cuenta.tipo === 'revendedor') return '200';
                      const connectionLimit = dispositivosSeleccionados || cuenta.datos.connection_limit || 1;
                      if (Array.isArray(planesConOverrides) && planesConOverrides.length > 0) {
                        const planBase = planesConOverrides.find(p => p.dias === 30 && p.connection_limit === connectionLimit);
                        if (planBase) {
                          return Math.round(planBase.precio / 30).toString();
                        }
                      }
                      switch(connectionLimit) {
                        case 1: return '200';
                        case 2: return '333';
                        case 3: return '400';
                        case 4: return '500';
                        default: return '200';
                      }
                    })()} ARS
                  </span>
                </div>
                <div className="border-t border-gray-700/50 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total:</span>
                    <span className="text-purple-400 text-lg font-bold">
                      ${calcularPrecio().toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaso('buscar')}
                  className="flex-1 py-2.5 bg-gray-800/50 text-gray-300 font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors border border-gray-700/50"
                >
                  Volver
                </button>
                <button
                  onClick={procesarRenovacion}
                  disabled={procesando || !nombreCliente.trim() || !emailCliente.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
