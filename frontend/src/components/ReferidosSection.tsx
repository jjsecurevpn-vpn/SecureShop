import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Copy,
  Check,
  Users,
  DollarSign,
  Wallet,
  ChevronDown,
  ChevronUp,
  Loader2,
  Share2,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { protonColors } from '../styles/colors';
import { Title } from './Title';
import { Subtitle } from './Subtitle';
import { Button } from './Button';
import {
  referidosService,
  ReferralSettings,
  ReferralStats,
  SaldoTransaccion,
} from '../services/api.service';

interface ReferidosSectionProps {
  userId: string;
  userEmail?: string;
}

export function ReferidosSection({ userId }: ReferidosSectionProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [transacciones, setTransacciones] = useState<SaldoTransaccion[]>([]);
  const [showTransacciones, setShowTransacciones] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
      const [settingsData, statsData] = await Promise.all([
          referidosService.getSettings().catch(() => null),
          referidosService.getStats(userId).catch(() => null),
        ]);

        setSettings(settingsData);
        setStats(statsData);
      } catch (err: any) {
        console.error('[ReferidosSection] Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  // Cargar transacciones cuando se expande
  const loadTransacciones = async () => {
    if (transacciones.length === 0) {
      try {
        const data = await referidosService.getTransacciones(userId, 20);
        setTransacciones(data);
      } catch (err) {
        console.error('[ReferidosSection] Error cargando transacciones:', err);
      }
    }
    setShowTransacciones(!showTransacciones);
  };

  // Copiar código de referido con mensaje promocional
  const copyReferralCode = async () => {
    if (!stats?.referral_code) return;

    const descuento = settings?.porcentaje_descuento_referido || 5;
    const mensajePromocional = `¡Hola! 👋
Tengo un código de ${descuento}% OFF para SecureVPN 🔐

Con SecureVPN podés:
✔️ Internet ilimitado y seguro
✔️ Acceder a apps y sitios bloqueados
✔️ Proteger tu WiFi en lugares públicos
✔️ Conectar varios dispositivos a la vez

Ingresá mi código: ${stats.referral_code}
Y aprovechá el descuento 🎁

👉 https://shop.jhservices.com.ar/`;

    try {
      await navigator.clipboard.writeText(mensajePromocional);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando código:', err);
    }
  };

  // Compartir en WhatsApp
  const shareWhatsApp = () => {
    if (!stats?.referral_code) return;
    const descuento = settings?.porcentaje_descuento_referido || 5;
    const text = `¡Hola! 👋
Tengo un código de ${descuento}% OFF para SecureVPN 🔐

Con SecureVPN podés:
✔️ Internet ilimitado y seguro
✔️ Acceder a apps y sitios bloqueados
✔️ Proteger tu WiFi en lugares públicos
✔️ Conectar varios dispositivos a la vez

Ingresá mi código: *${stats.referral_code}*
Y aprovechá el descuento 🎁

👉 https://shop.jhservices.com.ar/`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Si está cargando
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: protonColors.purple[500] }} />
        <p className="mt-4 text-sm" style={{ color: protonColors.gray[500] }}>Cargando programa de referidos...</p>
      </div>
    );
  }

  // Si el programa está desactivado
  if (!settings?.activo) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 text-center">
        <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: protonColors.gray[400] }} />
        <Title as="h3" center>Programa de Referidos</Title>
        <Subtitle center className="mt-2">
          El programa de referidos no está disponible en este momento.
        </Subtitle>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <Title as="h2" center>🎁 Programa de Referidos</Title>
        <Subtitle center className="mt-2">
          {settings.mensaje_promocional}
        </Subtitle>
      </div>

      {/* Cómo funciona */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
        <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          ¿Cómo funciona?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Comparte tu código</p>
              <p className="text-xs text-purple-600">Copia tu código y envíalo a tus amigos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Ellos compran con descuento</p>
              <p className="text-xs text-purple-600">Ingresan el código en el checkout y obtienen {settings.porcentaje_descuento_referido}% OFF</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Tú ganas saldo</p>
              <p className="text-xs text-purple-600">Recibes {settings.porcentaje_recompensa}% de su compra como saldo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card principal - Saldo y Código */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 md:p-8 text-white">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Saldo disponible */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Tu saldo disponible</span>
            </div>
            <div className="text-4xl md:text-5xl font-bold">
              {formatCurrency(stats?.saldo_actual || 0)}
            </div>
            <p className="text-sm opacity-70 mt-2">
              Úsalo para pagar tus próximos planes
            </p>
          </div>

          {/* Código de referido */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm opacity-80 mb-2">Tu código de referido</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-xl font-bold tracking-wider text-center">
                {stats?.referral_code || '--------'}
              </div>
              <button
                onClick={copyReferralCode}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Copiar mensaje para compartir"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-300" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={copyReferralCode}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? '¡Mensaje copiado!' : 'Copiar para compartir'}
              </button>
              <button
                onClick={shareWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/80 hover:bg-green-500 rounded-lg text-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
            <p className="text-xs opacity-70 mt-3 text-center">
              Tus amigos ingresan este código en el checkout para obtener {settings?.porcentaje_descuento_referido || 5}% de descuento
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2" style={{ color: protonColors.purple[500] }} />
          <div className="text-2xl font-bold" style={{ color: protonColors.purple[700] }}>
            {stats?.total_referrals || 0}
          </div>
          <div className="text-xs" style={{ color: protonColors.gray[500] }}>
            Referidos
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: protonColors.purple[500] }} />
          <div className="text-2xl font-bold" style={{ color: protonColors.purple[700] }}>
            {formatCurrency(stats?.total_earned || 0)}
          </div>
          <div className="text-xs" style={{ color: protonColors.gray[500] }}>
            Total ganado
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl p-4 text-center">
          <DollarSign className="w-6 h-6 mx-auto mb-2" style={{ color: protonColors.purple[500] }} />
          <div className="text-2xl font-bold" style={{ color: protonColors.purple[700] }}>
            {settings.porcentaje_recompensa}%
          </div>
          <div className="text-xs" style={{ color: protonColors.gray[500] }}>
            Comisión por referido
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl p-4 text-center">
          <Gift className="w-6 h-6 mx-auto mb-2" style={{ color: protonColors.purple[500] }} />
          <div className="text-2xl font-bold" style={{ color: protonColors.purple[700] }}>
            {settings.porcentaje_descuento_referido}%
          </div>
          <div className="text-xs" style={{ color: protonColors.gray[500] }}>
            Descuento para ellos
          </div>
        </div>
      </div>

      {/* Lista de referidos */}
      {stats && stats.referidos.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: protonColors.purple[800] }}>
              Tus referidos
            </h3>
            <span className="text-sm px-2 py-1 bg-purple-100 rounded-full" style={{ color: protonColors.purple[500] }}>
              {stats.referidos.length} total
            </span>
          </div>

          <div className="space-y-3">
            {stats.referidos.slice(0, 5).map((ref: ReferralStats['referidos'][number]) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    style={{ backgroundColor: protonColors.purple[500] }}
                  >
                    {(ref.referred_nombre || ref.referred_email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: protonColors.purple[800] }}>
                      {ref.referred_nombre || ref.referred_email?.split('@')[0] || 'Usuario'}
                    </div>
                    <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                      {formatDate(ref.created_at)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {ref.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-semibold" style={{ color: protonColors.purple[700] }}>
                      +{formatCurrency(ref.reward_amount)}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                    Compra: {formatCurrency(ref.purchase_amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stats.referidos.length > 5 && (
            <button
              className="w-full mt-4 py-2 text-sm text-center hover:bg-purple-100 rounded-lg transition-colors"
              style={{ color: protonColors.purple[500] }}
            >
              Ver todos ({stats.referidos.length})
            </button>
          )}
        </div>
      )}

      {/* Sin referidos todavía */}
      {stats && stats.referidos.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: protonColors.purple[300] }} />
          <h3 className="font-semibold mb-2" style={{ color: protonColors.purple[800] }}>
            Aún no tienes referidos
          </h3>
          <p className="text-sm mb-4" style={{ color: protonColors.gray[500] }}>
            Comparte tu código con amigos y familiares para empezar a ganar saldo.
          </p>
          <Button variant="primary" size="md" onClick={copyReferralCode}>
            <Copy className="w-4 h-4" />
            Copiar mensaje para compartir
          </Button>
        </div>
      )}

      {/* Historial de transacciones (expandible) */}
      <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl overflow-hidden">
        <button
          onClick={loadTransacciones}
          className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" style={{ color: protonColors.purple[500] }} />
            <span className="font-medium" style={{ color: protonColors.purple[800] }}>
              Historial de movimientos
            </span>
          </div>
          {showTransacciones ? (
            <ChevronUp className="w-5 h-5" style={{ color: protonColors.gray[500] }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: protonColors.gray[500] }} />
          )}
        </button>

        <AnimatePresence>
          {showTransacciones && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="border-t border-purple-100 p-4">
                {transacciones.length === 0 ? (
                  <p className="text-center text-sm py-4" style={{ color: protonColors.gray[500] }}>
                    No hay movimientos aún
                  </p>
                ) : (
                  <div className="space-y-2">
                    {transacciones.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-medium" style={{ color: protonColors.purple[800] }}>
                            {tx.tipo === 'referido' && '🎁 Comisión por referido'}
                            {tx.tipo === 'compra' && '🛒 Pago con saldo'}
                            {tx.tipo === 'ajuste_admin' && '⚙️ Ajuste administrativo'}
                            {tx.tipo === 'bonus' && '🎉 Bonus'}
                            {tx.tipo === 'reembolso' && '↩️ Reembolso'}
                          </div>
                          <div className="text-xs" style={{ color: protonColors.gray[500] }}>
                            {tx.descripcion || formatDate(tx.created_at)}
                          </div>
                        </div>
                        <div
                          className="font-semibold"
                          style={{ color: tx.monto >= 0 ? '#22c55e' : '#ef4444' }}
                        >
                          {tx.monto >= 0 ? '+' : ''}{formatCurrency(tx.monto)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cómo funciona */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: protonColors.purple[800] }}>
          <Gift className="w-5 h-5" />
          ¿Cómo funciona?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-medium" style={{ color: protonColors.purple[800] }}>Comparte tu código</div>
              <div className="text-sm" style={{ color: protonColors.gray[600] }}>
                Envía tu link a amigos y familiares
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-medium" style={{ color: protonColors.purple[800] }}>Ellos compran</div>
              <div className="text-sm" style={{ color: protonColors.gray[600] }}>
                Obtienen {settings.porcentaje_descuento_referido}% de descuento
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-medium" style={{ color: protonColors.purple[800] }}>Ganas saldo</div>
              <div className="text-sm" style={{ color: protonColors.gray[600] }}>
                Recibes {settings.porcentaje_recompensa}% de su compra como saldo
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
