import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, ShoppingBag, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { protonColors } from '../styles/colors';

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="p-2">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: protonColors.purple[500] }} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: protonColors.purple[800] }}
        >
          Iniciar sesión
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleGoToProfile = () => {
    setIsOpen(false);
    navigate('/perfil');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
        style={{ color: protonColors.purple[800] }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[100]}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {/* Avatar - Mostrar imagen de Google si está disponible */}
        {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
          <img
            src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
            alt="Avatar"
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: protonColors.purple[500] }}
          >
            {(profile?.nombre || user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {profile?.nombre || user.email?.split('@')[0]}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          style={{ color: protonColors.purple[500] }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown - Estilo claro como el resto del header */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold truncate" style={{ color: protonColors.purple[800] }}>
                  {profile?.nombre || 'Usuario'}
                </p>
                <p className="text-xs truncate" style={{ color: protonColors.purple[500] }}>{user.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleGoToProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </button>
                <button
                  onClick={handleGoToProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: protonColors.purple[800], backgroundColor: 'transparent' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = protonColors.purple[50]}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Mis Compras
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
