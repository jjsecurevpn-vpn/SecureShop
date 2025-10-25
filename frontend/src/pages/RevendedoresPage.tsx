import { useState, useEffect } from 'react';
import { Users, Shield, Crown, Star, Check, MessageCircle, ArrowRight, Phone, CreditCard, Calendar, RefreshCw, ChevronDown, Zap, Gift, TrendingUp } from 'lucide-react';
import CheckoutModalRevendedor from '../components/CheckoutModalRevendedor';
import RenovacionModalRevendedor from '../components/RenovacionModalRevendedor';
import Loading from '../components/Loading';
import { PromoTimer } from '../components/PromoTimer';
import { PlanRevendedor, CompraRevendedorRequest } from '../types';
import { apiService } from '../services/api.service';

export default function RevendedoresPage() {
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanRevendedor | null>(null);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planes, setPlanes] = useState<PlanRevendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarRenovacion, setMostrarRenovacion] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [configHero, setConfigHero] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [planesObtenidos, configHeroObtenida] = await Promise.all([
        apiService.obtenerPlanesRevendedores(),
        apiService.obtenerConfigHeroRevendedores()
      ]);
      setPlanes(planesObtenidos);
      setConfigHero(configHeroObtenida);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Por favor, recarga la página.');
    } finally {
      setCargando(false);
    }
  };

  // Agrupar planes por tipo de cuenta
  const groupedPlans = [
    {
      title: 'Sistema de Créditos',
      tagline: 'Máxima flexibilidad para tus clientes',
      accent: 'from-emerald-400 to-emerald-600',
      chipBg: 'bg-emerald-50 text-emerald-700',
      icon: <Zap className="w-5 h-5" />,
      recommended: true,
      description: 'Crea cuentas personalizadas sin límites de días',
      benefits: [
        'Cuentas de 30 días o más',
        '1 crédito = 1 mes de acceso (30 días)',
        'Acumula créditos en tu panel',
        'Tus clientes disfrutan de flexibilidad total',
        'Perfecto para retención de clientes',
        'Gestión simplificada de suscripciones',
      ],
      detalle: 'Cada crédito te permite crear una cuenta de 30 días para tus clientes. Los créditos se acumulan en tu panel para usar cuando lo necesites. Tus clientes obtienen acceso VPN inmediato y pueden renovar fácilmente. Sistema ideal si buscas ofrecer un producto consistente y profesional.',
      items: planes.filter(p => p.account_type === 'credit'),
    },
    {
      title: 'Sistema de Validez',
      tagline: 'Total control sobre cada cuenta',
      accent: 'from-blue-400 to-blue-600',
      chipBg: 'bg-blue-50 text-blue-700',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Cuentas personalizadas en el rango que desees',
      benefits: [
        'Cuentas personalizadas (3, 7, 15, 45 días, etc)',
        'Flexibilidad total en duración',
        'Al expirar, se libera el cupo automáticamente',
        'Reutiliza cupos para nuevas cuentas',
        'Perfecto para pruebas o promociones',
        'Máximo aprovechamiento del inventario',
      ],
      detalle: 'Con Validez compras un rango de días total. Puedes crear cuentas de cualquier duración dentro de ese rango. Ejemplo: con 60 días puedes crear 1 cuenta de 60 días, o 2 de 30, o varias combinadas (10 + 15 + 35). Al vencer cada cuenta, ese cupo se libera y puedes crear nuevas cuentas con esos días.',
      items: planes.filter(p => p.account_type === 'validity'),
    },
  ];

  const handleSeleccionarPlan = (plan: PlanRevendedor) => {
    setPlanSeleccionado(plan);
  };

  const handleCerrarModal = () => {
    setPlanSeleccionado(null);
  };

  const togglePlan = (planId: number) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const handleConfirmarCompra = async (datos: CompraRevendedorRequest) => {
    try {
      setComprando(true);
      setError(null);
      
      const respuesta = await apiService.comprarPlanRevendedor(datos);
      
      if (respuesta.linkPago) {
        window.location.href = respuesta.linkPago;
      } else {
        throw new Error('No se recibió el enlace de pago');
      }
    } catch (err: any) {
      console.error('Error en la compra:', err);
      setError(err.message || 'Error al procesar la compra. Por favor, intenta nuevamente.');
      setComprando(false);
    }
  };

  if (cargando) {
    return <Loading message="Cargando planes de revendedores..." />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 pt-24 pb-16 md:pt-32 md:pb-20 overflow-x-hidden">
        {/* Banner de Promoción */}
        {configHero?.promocion?.habilitada && (
          <div className={`w-full py-3 text-center ${configHero.promocion.bgColor || 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
            <p className={`font-bold text-sm md:text-base ${configHero.promocion.textColor || 'text-amber-300'}`}>
              {configHero.promocion.texto}
            </p>
          </div>
        )}

        {/* Temporizador de Promoción */}
        <PromoTimer />

        <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${configHero?.promocion?.habilitada ? 'pt-8 md:pt-10' : ''}`}>
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 rounded-full px-4 py-2 mb-6 border border-purple-500/30">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Programa de Revendedores</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Conviértete en Revendedor
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Elige tu modelo de negocio: Créditos para consistencia o Validez para flexibilidad
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: 'Panel', label: 'Propio', icon: <Shield className="w-5 h-5" /> },
                { value: '24/7', label: 'Soporte', icon: <MessageCircle className="w-5 h-5" /> },
                { value: 'Precios', label: 'Competitivos', icon: <Star className="w-5 h-5" /> },
                { value: 'Control', label: 'Total', icon: <Users className="w-5 h-5" /> },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2 text-purple-400">
                    {stat.icon}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section className="bg-gray-950 py-16 md:py-24 overflow-x-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Planes de Revendedor
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              Elige el tipo de cuenta que mejor se adapte a tu modelo de negocio
            </p>
            
            {/* Botón de Renovación */}
            <div className="flex justify-center">
              <button
                onClick={() => setMostrarRenovacion(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                ¿Ya tienes cuenta de revendedor? Renuévala aquí
              </button>
            </div>
          </div>

          {/* Banner de beneficios */}
          <div className="relative mb-12 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-0">
            <div className="pointer-events-none absolute -inset-x-4 sm:-inset-x-6 md:inset-x-0 -top-4 -bottom-4 bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-purple-600/20 opacity-50 rounded-3xl blur-xl" />
            <div className="relative rounded-2xl px-4 sm:px-6 py-5 text-xs sm:text-sm bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 overflow-hidden">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 font-medium text-gray-100">
                  <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" /> Todos los planes incluyen:
                </div>
                <ul className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-gray-300">
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Panel profesional
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Soporte 24/7
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Activación instantánea
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Sin límites
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparación rápida */}
          <div className="max-w-5xl mx-auto mb-16 px-4 sm:px-6 md:px-0">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">¿Cuál elegir?</h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-emerald-300">Elige CRÉDITOS si...</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> Quieres ofrecer planes estándar (30+ días)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> Buscas suscripciones predecibles</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> Necesitas modelo de negocio simple</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> Quieres retener clientes a largo plazo</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-blue-300">Elige VALIDEZ si...</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" /> Necesitas máxima flexibilidad</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" /> Quieres crear pruebas gratis (3-7 días)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" /> Buscas optimizar tu inventario</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" /> Necesitas crear cuentas variables</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grupos de planes colapsables */}
          <div className="grid gap-16 max-w-5xl mx-auto w-full">
            {groupedPlans.map((group) => (
              <section key={group.title} className="px-4 sm:px-6 md:px-0">
                {/* Header del grupo */}
                <div className="mb-8 relative">
                  <div className={`pointer-events-none absolute -inset-x-4 sm:-inset-x-6 md:inset-x-0 -top-4 h-32 bg-gradient-to-r ${group.accent} opacity-10 rounded-3xl blur-xl`} />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.accent} text-white flex items-center justify-center shadow-lg`}>
                        {group.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                          {group.title}
                          {group.recommended && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-amber-400/15 text-amber-400 px-2 py-1 rounded-full border border-amber-400/30">
                              <Star className="w-3 h-3" /> Recomendado
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium mt-0.5">
                          {group.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Descripción general */}
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {group.detalle}
                      </p>
                    </div>

                    {/* Beneficios clave */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {group.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accent.includes('emerald') ? 'text-emerald-400' : 'text-blue-400'}`} />
                          <span className="text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de planes colapsables */}
                {group.items.length > 0 ? (
                  <div className="space-y-3">
                    {group.items.map((plan: PlanRevendedor) => (
                      <div
                        key={plan.id}
                        className="group relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 hover:border-gray-700/80 rounded-lg transition-all duration-200 overflow-hidden"
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${group.accent}`} />
                        
                        {/* Header del plan */}
                        <button
                          onClick={() => togglePlan(plan.id)}
                          className="w-full px-3 sm:px-5 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors gap-3 sm:gap-4"
                        >
                          <div className="flex items-center gap-2 sm:gap-4 flex-1 text-left pl-0 sm:pl-1 min-w-0">
                            <span className="text-gray-100 text-xs sm:text-sm font-semibold min-w-fit">
                              {plan.nombre}
                            </span>
                            <span className="text-xs text-gray-500 hidden sm:inline">
                              {plan.account_type === 'credit' 
                                ? `${plan.dias ? Math.ceil(plan.dias / 30) : '1'} mes${plan.dias && Math.ceil(plan.dias / 30) > 1 ? 'es' : ''}`
                                : `${plan.dias} días`
                              }
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-base sm:text-lg font-bold text-emerald-400">
                                ${plan.precio.toLocaleString('es-AR')}
                              </div>
                            </div>
                            <ChevronDown 
                              className={`w-4 sm:w-5 h-4 sm:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${expandedPlanId === plan.id ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </button>

                        {/* Contenido expandible */}
                        {expandedPlanId === plan.id && (
                          <div className="border-t border-gray-800/60 px-3 sm:px-5 py-4 bg-gray-900/50">
                            <div className="space-y-4 sm:space-y-6">
                              {/* Detalle del plan */}
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">¿Qué incluye?</h4>
                                <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                                  {plan.account_type === 'credit' ? (
                                    <>
                                      <div className="flex gap-2">
                                        <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span><strong>{plan.max_users} créditos</strong> en tu panel</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Equivale a <strong>{plan.dias ? Math.ceil(plan.dias / 30) : '1'} {plan.dias && Math.ceil(plan.dias / 30) > 1 ? 'meses' : 'mes'}</strong> de acceso VPN</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Crea cuentas de <strong>30 días o más</strong> para tus clientes</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Acumula créditos y úsalos cuando necesites</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex gap-2">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span><strong>{plan.dias} días</strong> totales para crear cuentas</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>Flexibilidad total: crea cuentas de <strong>cualquier duración</strong></span>
                                      </div>
                                      <div className="flex gap-2">
                                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>Ejemplo: 1×{plan.dias} días, 2×{Math.floor(plan.dias!/2)} días, o combina como quieras</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>Al expirar cada cuenta, se <strong>libera el cupo</strong> automáticamente</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Caso de uso */}
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">Caso de uso ideal:</h4>
                                <p className="text-xs sm:text-sm text-gray-400 bg-white/5 p-2 sm:p-3 rounded">
                                  {plan.account_type === 'credit'
                                    ? `Perfecto si quieres ofrecer planes estándar mensuales. Tus clientes reciben acceso consistente cada 30 días. Ideal para construir una base de clientes leales.`
                                    : `Perfecto si necesitas flexibilidad máxima. Crea pruebas gratis de 3-7 días, o combina diferentes duraciones para optimizar tu inventario.`
                                  }
                                </p>
                              </div>

                              {/* Botón de compra */}
                              <button
                                onClick={() => handleSeleccionarPlan(plan)}
                                disabled={comprando}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                Comprar ahora
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No hay planes disponibles en este momento
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de contacto */}
      <section className="py-16 md:py-24 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                ¿Dudas? Contacta a nuestro equipo
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Soporte prioritario para revendedores 24/7
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 text-center hover:border-purple-500/30 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Telegram</h3>
                <p className="text-gray-400 mb-4">Respuesta inmediata</p>
                <a
                  href="https://t.me/+rAuU1_uHGZthMWZh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  <span>Contactar ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 text-center hover:border-purple-500/30 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">WhatsApp</h3>
                <p className="text-gray-400 mb-4">Ayuda especializada</p>
                <a
                  href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  <span>Unirse al canal</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mensaje de error */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-200">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de checkout */}
      {planSeleccionado && (
        <CheckoutModalRevendedor
          plan={planSeleccionado}
          onClose={handleCerrarModal}
          onConfirm={handleConfirmarCompra}
          loading={comprando}
        />
      )}

      {/* Modal de renovación */}
      <RenovacionModalRevendedor
        isOpen={mostrarRenovacion}
        onClose={() => setMostrarRenovacion(false)}
      />
    </div>
  );
}
