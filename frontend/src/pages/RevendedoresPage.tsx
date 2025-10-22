import { useState, useEffect } from 'react';
import { Users, Shield, Crown, Star, Check, MessageCircle, ArrowRight, Phone, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import CheckoutModalRevendedor from '../components/CheckoutModalRevendedor';
import RenovacionModalRevendedor from '../components/RenovacionModalRevendedor';
import Loading from '../components/Loading';
import { PlanRevendedor, CompraRevendedorRequest } from '../types';
import { apiService } from '../services/api.service';

export default function RevendedoresPage() {
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanRevendedor | null>(null);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planes, setPlanes] = useState<PlanRevendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarRenovacion, setMostrarRenovacion] = useState(false);

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      setCargando(true);
      const planesObtenidos = await apiService.obtenerPlanesRevendedores();
      setPlanes(planesObtenidos);
    } catch (err: any) {
      console.error('Error cargando planes:', err);
      setError('Error al cargar los planes. Por favor, recarga la página.');
    } finally {
      setCargando(false);
    }
  };

  // Agrupar planes por tipo de cuenta
  const groupedPlans = [
    {
      title: 'Planes de Validez',
      tagline: 'Ideal para reventa con tiempo limitado',
      accent: 'from-blue-400 to-blue-600',
      chipBg: 'bg-blue-50 text-blue-700',
      icon: <Calendar className="w-5 h-5" />,
      items: planes.filter(p => p.account_type === 'validity'),
    },
    {
      title: 'Planes de Créditos',
      tagline: 'Flexibilidad total para tus clientes',
      accent: 'from-emerald-400 to-emerald-600',
      chipBg: 'bg-emerald-50 text-emerald-700',
      icon: <CreditCard className="w-5 h-5" />,
      recommended: true,
      items: planes.filter(p => p.account_type === 'credit'),
    },
  ];

  const handleSeleccionarPlan = (plan: PlanRevendedor) => {
    setPlanSeleccionado(plan);
  };

  const handleCerrarModal = () => {
    setPlanSeleccionado(null);
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
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 rounded-full px-4 py-2 mb-6 border border-purple-500/30">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Programa de Revendedores</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Conviértete en Revendedor
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Obtén tu panel de revendedor y comienza a generar ingresos vendiendo VPN
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
      <section className="bg-gray-950 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
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
          <div className="relative mb-12 max-w-5xl mx-auto">
            <div className="pointer-events-none absolute -inset-x-6 -top-4 -bottom-4 bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-purple-600/20 opacity-50 rounded-3xl blur-xl" />
            <div className="relative rounded-2xl px-6 py-5 text-sm bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 font-medium text-gray-100">
                  <Shield className="w-4 h-4 text-purple-400" /> Todos los planes incluyen:
                </div>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-gray-300">
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Panel de administración
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Soporte prioritario
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Activación instantánea
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Sin límites de velocidad
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grupos de planes */}
          <div className="grid gap-14 max-w-5xl mx-auto">
            {groupedPlans.map((group) => (
              <section key={group.title}>
                {/* Header del grupo */}
                <div className="mb-6 relative">
                  <div className={`pointer-events-none absolute -inset-x-6 -top-4 h-28 bg-gradient-to-r ${group.accent} opacity-10 rounded-3xl blur-xl`} />
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
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
                  </div>
                </div>

                {/* Lista de planes */}
                <div className="space-y-3">
                  {group.items.map((plan) => (
                    <div
                      key={plan.id}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 hover:border-purple-500/30 rounded-lg px-5 py-4 transition-all duration-200"
                    >
                      <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${group.accent}`} />
                      
                      <div className="flex items-center gap-4 pl-1">
                        <span className="text-gray-100 text-sm font-semibold min-w-[180px]">
                          {plan.nombre}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        {plan.dias && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 font-medium">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span>{plan.dias} días</span>
                          </div>
                        )}

                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-400 tracking-tight">
                            ${plan.precio.toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSeleccionarPlan(plan)}
                          disabled={comprando}
                          className="px-4 py-2 rounded-md text-xs font-semibold bg-white/5 text-gray-300 hover:bg-purple-600 hover:text-white border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200"
                        >
                          Elegir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Garantía */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-purple-400">
              <Shield className="w-4 h-4" />
              <span className="text-gray-300 text-sm">
                Panel de revendedor profesional • Soporte prioritario
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de contacto */}
      <section className="py-16 md:py-24 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Soporte para Revendedores 24/7
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Atención prioritaria para nuestros revendedores
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 text-center hover:border-purple-500/30 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Telegram
                </h3>
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
                <h3 className="text-lg font-semibold text-white mb-2">
                  WhatsApp
                </h3>
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
