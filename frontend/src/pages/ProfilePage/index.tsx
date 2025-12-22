import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Menu, X } from 'lucide-react';
import { ReferidosSection } from '../../components/ReferidosSection';
import { apiService } from '../../services/api.service';

// Componentes locales
import {
  ProfileNavSidebar,
  ProfileSection,
  ActiveSubscriptionCard,
  PurchaseHistorySection,
  SupportTicketsSection,
  OverviewSection,
  SettingsSection,
} from './components';

// Tipos y utilidades
import { EstadoCuentaMap } from './types';

export default function ProfilePage() {
  const { user, profile, purchaseHistory, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Sección activa basada en URL o default
  const sectionFromUrl = searchParams.get('section') as ProfileSection | null;
  const [activeSection, setActiveSection] = useState<ProfileSection>(sectionFromUrl || 'overview');
  
  // Mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados de consulta de cuenta
  const [estadosCuenta, setEstadosCuenta] = useState<EstadoCuentaMap>({});

  // Cambiar sección y actualizar URL
  const handleSectionChange = (section: ProfileSection) => {
    setActiveSection(section);
    setSearchParams({ section });
    setMobileMenuOpen(false);
  };

  // Función para consultar estado de cuenta
  const consultarEstadoCuenta = async (username: string) => {
    if (estadosCuenta[username]?.expanded) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], expanded: false }
      }));
      return;
    }

    setEstadosCuenta(prev => ({
      ...prev,
      [username]: { loading: true, data: null, error: null, expanded: true }
    }));

    try {
      const data = await apiService.obtenerEstadoCuenta(username);
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { loading: false, data, error: null, expanded: true }
      }));
    } catch (error: any) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { loading: false, data: null, error: error.message || 'Error consultando', expanded: true }
      }));
    }
  };

  // Función para refrescar estado
  const refrescarEstadoCuenta = async (username: string) => {
    setEstadosCuenta(prev => ({
      ...prev,
      [username]: { ...prev[username], loading: true, error: null }
    }));

    try {
      const data = await apiService.obtenerEstadoCuenta(username);
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { loading: false, data, error: null, expanded: true }
      }));
    } catch (error: any) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], loading: false, error: error.message }
      }));
    }
  };

  // Redirigir si no hay usuario
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [loading, user, navigate]);

  // Sincronizar sección desde URL
  useEffect(() => {
    if (sectionFromUrl && sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  // Obtener suscripción activa
  const suscripcionActiva = purchaseHistory.find(
    (compra) =>
      compra.estado === 'aprobado' &&
      compra.servex_username &&
      compra.servex_expiracion &&
      new Date(compra.servex_expiracion) > new Date()
  ) || null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Handlers
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const emailVerificado = !!user.email_confirmed_at;

  // Renderizar contenido según la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            user={user}
            profile={profile}
            suscripcionActiva={suscripcionActiva}
            purchaseHistory={purchaseHistory}
            onNavigate={handleSectionChange}
          />
        );
      
      case 'subscription':
        return suscripcionActiva ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Suscripción</h1>
              <p className="text-gray-500 mt-1">Detalles de tu plan activo</p>
            </div>
            <ActiveSubscriptionCard suscripcion={suscripcionActiva} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No tienes una suscripción activa</p>
          </div>
        );
      
      case 'referidos':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Programa de Referidos</h1>
              <p className="text-gray-500 mt-1">Invita amigos y gana recompensas</p>
            </div>
            <ReferidosSection userId={user.id} userEmail={user.email || ''} />
          </div>
        );
      
      case 'tickets':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Soporte</h1>
              <p className="text-gray-500 mt-1">Gestiona tus tickets y consultas</p>
            </div>
            <SupportTicketsSection userId={user.id} />
          </div>
        );
      
      case 'history':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Compras</h1>
              <p className="text-gray-500 mt-1">Todas tus transacciones</p>
            </div>
            <PurchaseHistorySection
              purchaseHistory={purchaseHistory}
              estadosCuenta={estadosCuenta}
              onConsultarEstado={consultarEstadoCuenta}
              onRefrescarEstado={refrescarEstadoCuenta}
            />
          </div>
        );
      
      case 'settings':
        return (
          <SettingsSection
            user={user}
            profile={profile}
            onUpdateProfile={updateProfile}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-900">Mi Cuenta</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[300px] bg-white shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-900">Menú</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
                <ProfileNavSidebar
                  user={user}
                  profile={profile}
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                  emailVerificado={emailVerificado}
                  onSignOut={handleSignOut}
                  hasSuscripcionActiva={!!suscripcionActiva}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout - sin altura fija para scroll natural */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="lg:flex lg:gap-8">
          {/* Desktop Sidebar - sticky */}
          <div className="hidden lg:block lg:w-[280px] xl:w-[320px] flex-shrink-0">
            <div className="sticky top-24">
              <ProfileNavSidebar
                user={user}
                profile={profile}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                emailVerificado={emailVerificado}
                onSignOut={handleSignOut}
                hasSuscripcionActiva={!!suscripcionActiva}
              />
            </div>
          </div>

          {/* Content Area - fluye naturalmente */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
