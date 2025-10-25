import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Copy, Check, Download, Home, Mail } from 'lucide-react';
import { apiService } from '../services/api.service';
import { Pago } from '../types';
import Loading from '../components/Loading';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [pago, setPago] = useState<Pago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    const pagoId = searchParams.get('pago_id');
    const tipo = searchParams.get('tipo'); // 'cliente' o 'revendedor'
    const esRenovacion = searchParams.get('renovacion'); // 'true' si es renovación
    
    if (pagoId) {
      if (esRenovacion === 'true') {
        cargarRenovacion(pagoId);
      } else {
        cargarPago(pagoId, tipo || 'cliente');
      }
    } else {
      setError('ID de pago no encontrado');
      setLoading(false);
    }
  }, [searchParams, reintentos]);

  const cargarRenovacion = async (renovacionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Crear objeto compatible con la interfaz Pago
      const renovacionData = {
        id: renovacionId,
        tipo: 'cliente',
        estado: 'aprobado',
        monto: parseFloat(searchParams.get('monto') || '0'),
        servex_username: searchParams.get('username') || '',
        servex_password: '', // No hay password en renovación
        servex_categoria: searchParams.get('operacion') === 'upgrade' ? 'Upgrade aplicado' : 'Renovación aplicada',
        servex_connection_limit: parseInt(searchParams.get('connection_limit') || '0'),
        servex_expiracion: searchParams.get('fecha_expiracion') || 'N/A',
        cliente_email: searchParams.get('email') || '',
        cliente_nombre: ''
      };
      
      setPago(renovacionData as any);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la información de la renovación');
    } finally {
      setLoading(false);
    }
  };

  const cargarPago = async (pagoId: string, tipo: string = 'cliente') => {
    try {
      setLoading(true);
      setError(null);
      const data = tipo === 'revendedor' 
        ? await apiService.obtenerPagoRevendedor(pagoId)
        : await apiService.obtenerPago(pagoId);
      setPago(data);
      
      if (data.estado !== 'aprobado') {
        // 🔴 MEJORADO: Aumentar a 30 reintentos = 90+ segundos con backoff
        if (reintentos < 30) {
          // Estrategia de backoff: esperar más tiempo después de varios reintentos
          const delay = reintentos < 5 ? 1000 : reintentos < 10 ? 2000 : 3000;
          
          setTimeout(() => {
            console.log(`[Success] ⏳ Reintentando verificación del pago... intento ${reintentos + 1}/30 (espera: ${delay}ms)`);
            setReintentos(prev => prev + 1);
          }, delay);
        } else {
          setError('El pago aún no ha sido procesado después de 90+ segundos. Por favor, verifica tu email o contacta a soporte.');
        }
      }
    } catch (err: any) {
      console.error('[Success] Error cargando pago:', err);
      // Si hay un error HTTP y aún podemos reintentar, volver a intentar
      if (reintentos < 30) {
        const delay = reintentos < 5 ? 1000 : reintentos < 10 ? 2000 : 3000;
        
        setTimeout(() => {
          console.log(`[Success] ⏳ Reintentando después de error... intento ${reintentos + 1}/30 (espera: ${delay}ms)`);
          setReintentos(prev => prev + 1);
        }, delay);
      } else {
        setError(err.message || 'Error al cargar la información del pago. Por favor, verifica tu email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return <Loading message={reintentos > 0 ? `Procesando tu pago... (${reintentos}/30)` : "Verificando tu compra..."} />;
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 pt-24">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Verificando pago</h2>
          <p className="text-gray-400 mb-6">{error || 'No se encontró información del pago'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/30 font-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-xl">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Transacción completada</h1>
          <p className="text-gray-400 text-sm">Tu servicio VPN está listo</p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-6 mb-4">
          
          {/* Credentials */}
          <div className="space-y-3 mb-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</div>
              <div className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/40 rounded-lg px-3 py-2">
                <span className="font-mono text-sm text-gray-100 flex-1 truncate">
                  {pago.servex_username || 'Generando...'}
                </span>
                <button
                  onClick={() => copyToClipboard(pago.servex_username || '', 'username')}
                  className="p-1.5 hover:bg-purple-500/20 rounded transition-colors text-gray-400 hover:text-purple-400"
                >
                  {copiedField === 'username' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {pago.servex_password && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contraseña</div>
                <div className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/40 rounded-lg px-3 py-2">
                  <span className="font-mono text-sm text-gray-100 flex-1 truncate">
                    {pago.servex_password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(pago.servex_password || '', 'password')}
                    className="p-1.5 hover:bg-purple-500/20 rounded transition-colors text-gray-400 hover:text-purple-400"
                  >
                    {copiedField === 'password' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {searchParams.get('renovacion') === 'true' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <p className="text-xs text-green-400">
                  ✅ {searchParams.get('operacion') === 'upgrade' ? 'Upgrade' : 'Renovación'} procesada exitosamente. 
                  Se agregaron {searchParams.get('dias')} días a tu cuenta.
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800/40 my-4"></div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Servidor</div>
              <div className="text-gray-100 font-medium">{pago.servex_categoria || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dispositivos</div>
              <div className="text-gray-100 font-medium">{pago.servex_connection_limit || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Válido hasta</div>
              <div className="text-gray-100 font-medium">
                {(() => {
                  if (!pago.servex_expiracion || pago.servex_expiracion === 'N/A') return 'N/A';
                  const fecha = new Date(pago.servex_expiracion);
                  return isNaN(fecha.getTime()) ? 'N/A' : fecha.toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  });
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Referencia</div>
              <div className="text-gray-100 font-mono font-medium text-xs">{pago.id}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800/40 my-4"></div>

          {/* Email notification */}
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/20 rounded-lg px-3 py-2">
            <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span>Credenciales enviadas a <span className="text-gray-300">{pago.cliente_email}</span></span>
          </div>
        </div>

        {/* Panel de Gestión - Solo para Revendedores */}
        {searchParams.get('tipo') === 'revendedor' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
            <div className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-3">Panel de Gestión</div>
            <p className="text-xs text-gray-300 mb-3">Accede a tu panel de administración para gestionar tus cuentas y consultas:</p>
            <a
              href="https://servex.ws"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/30"
            >
              <span>Ir al Panel de Gestión</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <p className="text-xs text-gray-400 mt-3">
              <span className="text-blue-300 font-semibold">URL:</span> https://servex.ws
            </p>
          </div>
        )}

        {/* Instructions Card */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
          <div className="text-xs font-medium text-purple-300 uppercase tracking-wider mb-2">
            {searchParams.get('tipo') === 'revendedor' ? 'Próximos Pasos' : 'Cómo conectarte'}
          </div>
          {searchParams.get('tipo') === 'revendedor' ? (
            <ol className="space-y-1.5 text-xs text-gray-300">
              <li className="flex gap-2">
                <span className="text-purple-400 font-semibold">1.</span>
                <span>Accede a tu panel en <span className="text-purple-300 font-semibold">https://servex.ws</span></span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-semibold">2.</span>
                <span>Consulta tus credenciales y configura tus cuentas</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-semibold">3.</span>
                <span>Distribuye accesos a tus clientes finales</span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-1.5 text-xs text-gray-300">
              <li className="flex gap-2">
                <span className="text-purple-400 font-semibold">1.</span>
                <span>Descarga <span className="text-purple-300 font-semibold">JJSecure VP-N</span> desde Play Store o App Store</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-semibold">2.</span>
                <span>Ingresa tu usuario y contraseña (arriba)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-semibold">3.</span>
                <span>Elige cualquier servidor disponible y ¡conéctate!</span>
              </li>
            </ol>
          )}
        </div>

        {/* Warning */}
        <div className="text-xs text-yellow-200/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mb-4">
          <span className="font-semibold">Seguridad:</span> Guarda estas credenciales en lugar seguro. No las compartas.
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/40 hover:border-gray-600/60 rounded-lg text-gray-300 text-sm font-medium transition-all duration-200"
            title="Imprimir"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button
            onClick={() => copyToClipboard(`${pago.servex_username}\n${pago.servex_password}`, 'all')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/40 hover:border-gray-600/60 rounded-lg text-gray-300 text-sm font-medium transition-all duration-200"
            title="Copiar todo"
          >
            {copiedField === 'all' ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white text-sm font-medium transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
        </div>

        {/* Support link */}
        <p className="text-center text-xs text-gray-500 mt-4">
          ¿Problemas? <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Contacta a soporte</a>
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
