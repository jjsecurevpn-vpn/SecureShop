import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, ChevronDown, ShoppingBag, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="p-2">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Iniciar Sesión</span>
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
        className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
          {(profile?.nombre || user.email || 'U')[0].toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm text-white max-w-[100px] truncate">
          {profile?.nombre || user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-700">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleGoToProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </button>
                <button
                  onClick={handleGoToProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Mis Compras
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-neutral-700 py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
