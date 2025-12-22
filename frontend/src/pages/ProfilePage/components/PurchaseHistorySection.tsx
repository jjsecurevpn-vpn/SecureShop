import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Wifi,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Users,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { protonColors } from '../../../styles/colors';
import { Title } from '../../../components/Title';
import { Subtitle } from '../../../components/Subtitle';
import { Button } from '../../../components/Button';
import { PurchaseHistory } from '../../../lib/supabase';
import { EstadoCuentaMap } from '../types';
import { formatDate, formatCurrency, getStatusClass, getStatusText } from '../utils';

interface PurchaseHistorySectionProps {
  purchaseHistory: PurchaseHistory[];
  estadosCuenta: EstadoCuentaMap;
  onConsultarEstado: (username: string) => void;
  onRefrescarEstado: (username: string) => void;
}

export function PurchaseHistorySection({
  purchaseHistory,
  estadosCuenta,
  onConsultarEstado,
  onRefrescarEstado,
}: PurchaseHistorySectionProps) {
  const navigate = useNavigate();

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title as="h2">Historial de Compras</Title>
          <Subtitle className="mt-1">
            {purchaseHistory.length} {purchaseHistory.length === 1 ? 'compra realizada' : 'compras realizadas'}
          </Subtitle>
        </div>
      </div>

      {purchaseHistory.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 md:p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6" style={{ color: protonColors.purple[300] }} />
          <Title as="h3" center className="mb-2">No hay compras aún</Title>
          <Subtitle center className="mb-6 max-w-md mx-auto">
            Cuando realices tu primera compra, aparecerá aquí con todos los detalles.
          </Subtitle>
          <Button
            onClick={() => navigate('/planes')}
            variant="primary"
            size="md"
          >
            Ver planes
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {purchaseHistory.map((compra, index) => (
              <motion.div
                key={compra.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-4 md:p-6 hover:border-purple-300 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icono y Nombre */}
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: protonColors.purple[50],
                        border: `1px solid ${protonColors.purple[200]}`
                      }}
                    >
                      {compra.tipo === 'revendedor' ? (
                        <Shield className="w-6 h-6" style={{ color: protonColors.purple[500] }} />
                      ) : (
                        <Wifi className="w-6 h-6" style={{ color: protonColors.purple[500] }} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: protonColors.purple[800] }}>{compra.plan_nombre}</h3>
                      <p className="text-sm" style={{ color: protonColors.gray[500] }}>
                        {compra.tipo === 'renovacion' ? 'Renovación' : compra.tipo === 'revendedor' ? 'Plan Revendedor' : 'Plan VPN'}
                      </p>
                    </div>
                  </div>

                  {/* Username (si está aprobado) */}
                  {compra.estado === 'aprobado' && compra.servex_username && (
                    <div 
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{ backgroundColor: protonColors.purple[50] }}
                    >
                      <User className="w-4 h-4" style={{ color: protonColors.gray[500] }} />
                      <span className="text-sm font-mono" style={{ color: protonColors.purple[700] }}>{compra.servex_username}</span>
                    </div>
                  )}

                  {/* Monto */}
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" style={{ color: protonColors.gray[500] }} />
                    <span className="font-semibold" style={{ color: protonColors.purple[800] }}>{formatCurrency(compra.monto)}</span>
                  </div>

                  {/* Estado */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusClass(compra.estado)}`}>
                    {getStatusIcon(compra.estado)}
                    <span className="text-sm font-medium">{getStatusText(compra.estado)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div 
                  className="mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-sm"
                  style={{ 
                    borderColor: protonColors.purple[100],
                    color: protonColors.gray[500]
                  }}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(compra.created_at)}</span>
                    </div>
                    {compra.servex_expiracion && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Expira: {formatDate(compra.servex_expiracion)}</span>
                      </div>
                    )}
                    {compra.mp_payment_id && (
                      <span style={{ color: protonColors.gray[400] }}>ID: {compra.mp_payment_id}</span>
                    )}
                  </div>
                  
                  {/* Botón Ver Estado */}
                  {compra.estado === 'aprobado' && compra.servex_username && (
                    <button
                      onClick={() => onConsultarEstado(compra.servex_username!)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-purple-100"
                      style={{ 
                        color: protonColors.purple[500],
                        backgroundColor: estadosCuenta[compra.servex_username]?.expanded ? protonColors.purple[100] : 'transparent'
                      }}
                    >
                      <Zap className="w-4 h-4" />
                      Ver estado
                      {estadosCuenta[compra.servex_username]?.expanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Panel expandible con estado de cuenta */}
                <AnimatePresence>
                  {compra.servex_username && estadosCuenta[compra.servex_username]?.expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div 
                        className="mt-4 p-4 rounded-xl"
                        style={{ backgroundColor: protonColors.purple[50], border: `1px solid ${protonColors.purple[200]}` }}
                      >
                        {estadosCuenta[compra.servex_username]?.loading ? (
                          <div className="flex items-center justify-center gap-2 py-4">
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: protonColors.purple[500] }} />
                            <span style={{ color: protonColors.purple[500] }}>Consultando estado...</span>
                          </div>
                        ) : estadosCuenta[compra.servex_username]?.error ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            <span>{estadosCuenta[compra.servex_username]?.error}</span>
                          </div>
                        ) : estadosCuenta[compra.servex_username]?.data ? (
                          <div>
                            {/* Header con estado y botón refrescar */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                {estadosCuenta[compra.servex_username]?.data?.estado === 'activo' ? (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Cuenta Activa
                                  </div>
                                ) : estadosCuenta[compra.servex_username]?.data?.estado === 'por_expirar' ? (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                                    <AlertTriangle className="w-4 h-4" />
                                    Por Expirar
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                    <XCircle className="w-4 h-4" />
                                    Expirada
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => onRefrescarEstado(compra.servex_username!)}
                                className="flex items-center gap-1 text-sm hover:bg-purple-200 px-2 py-1 rounded transition-all"
                                style={{ color: protonColors.purple[500] }}
                              >
                                <RefreshCw className="w-4 h-4" />
                                Actualizar
                              </button>
                            </div>

                            {/* Grid de información */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {/* Días restantes */}
                              <div className="text-center p-3 rounded-lg bg-white">
                                <div 
                                  className="text-2xl font-bold"
                                  style={{ 
                                    color: (estadosCuenta[compra.servex_username]?.data?.diasRestantes || 0) <= 3 
                                      ? '#ef4444' 
                                      : protonColors.purple[500] 
                                  }}
                                >
                                  {estadosCuenta[compra.servex_username]?.data?.diasRestantes || 0}
                                </div>
                                <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                                  Días restantes
                                </div>
                              </div>

                              {/* Fecha expiración */}
                              <div className="text-center p-3 rounded-lg bg-white">
                                <div className="text-sm font-semibold" style={{ color: protonColors.purple[700] }}>
                                  {estadosCuenta[compra.servex_username]?.data?.fechaExpiracion 
                                    ? formatDate(estadosCuenta[compra.servex_username]?.data?.fechaExpiracion || '')
                                    : 'N/A'}
                                </div>
                                <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                                  Fecha expiración
                                </div>
                              </div>

                              {/* Para revendedores: distinguir entre crédito y validez */}
                              {estadosCuenta[compra.servex_username]?.data?.tipo === 'revendedor' ? (
                                <>
                                  {estadosCuenta[compra.servex_username]?.data?.tipoRevendedor === 'credit' ? (
                                    <div className="text-center p-3 rounded-lg bg-white col-span-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4" style={{ color: protonColors.purple[500] }} />
                                        <span className="text-2xl font-bold" style={{ color: protonColors.purple[500] }}>
                                          {estadosCuenta[compra.servex_username]?.data?.creditos || 0}
                                        </span>
                                      </div>
                                      <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                                        Créditos disponibles
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center p-3 rounded-lg bg-white col-span-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4" style={{ color: protonColors.purple[500] }} />
                                        <span className="text-2xl font-bold" style={{ color: protonColors.purple[500] }}>
                                          {estadosCuenta[compra.servex_username]?.data?.usuariosActuales || 0} / {estadosCuenta[compra.servex_username]?.data?.maxUsuarios || 0}
                                        </span>
                                      </div>
                                      <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                                        Usuarios creados
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center p-3 rounded-lg bg-white col-span-2">
                                  <div className="flex items-center justify-center gap-1">
                                    <Wifi className="w-4 h-4" style={{ color: protonColors.purple[500] }} />
                                    <span className="text-2xl font-bold" style={{ color: protonColors.purple[500] }}>
                                      {estadosCuenta[compra.servex_username]?.data?.conexionesMaximas || 1}
                                    </span>
                                  </div>
                                  <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                                    Conexiones máx.
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Última conexión */}
                            {estadosCuenta[compra.servex_username]?.data?.ultimaConexion && (
                              <div className="mt-3 text-center text-xs" style={{ color: protonColors.gray[500] }}>
                                Última conexión: {formatDate(estadosCuenta[compra.servex_username]?.data?.ultimaConexion || '')}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
