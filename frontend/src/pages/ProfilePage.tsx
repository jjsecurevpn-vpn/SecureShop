import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  Edit2,
  Save,
  X,
  Shield,
  Key,
  Wifi,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, purchaseHistory, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNombre, setEditedNombre] = useState(profile?.nombre || '');
  const [editedTelefono, setEditedTelefono] = useState(profile?.telefono || '');
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({
      nombre: editedNombre,
      telefono: editedTelefono,
    });
    setSaving(false);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazado':
        return 'Rechazado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header del Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
              {(profile?.nombre || user.email || 'U')[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedNombre}
                    onChange={(e) => setEditedNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full md:w-auto px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="tel"
                    value={editedTelefono}
                    onChange={(e) => setEditedTelefono(e.target.value)}
                    placeholder="Teléfono (opcional)"
                    className="w-full md:w-auto px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {profile?.nombre || 'Usuario'}
                  </h1>
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {profile?.telefono && (
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <User className="w-4 h-4" />
                      <span>{profile.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-neutral-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Miembro desde {formatDate(user.created_at)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditedNombre(profile?.nombre || '');
                    setEditedTelefono(profile?.telefono || '');
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Historial de Compras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-white">Historial de Compras</h2>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
              {purchaseHistory.length} compras
            </span>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No hay compras aún</h3>
              <p className="text-neutral-400 mb-4">
                Cuando realices tu primera compra, aparecerá aquí.
              </p>
              <button
                onClick={() => navigate('/planes')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ver Planes
              </button>
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
                    className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 md:p-6 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Icono y Nombre */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                          {compra.tipo === 'revendedor' ? (
                            <Shield className="w-6 h-6 text-purple-400" />
                          ) : (
                            <Wifi className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{compra.plan_nombre}</h3>
                          <p className="text-sm text-neutral-400">
                            {compra.tipo === 'renovacion' ? 'Renovación' : compra.tipo === 'revendedor' ? 'Plan Revendedor' : 'Plan VPN'}
                          </p>
                        </div>
                      </div>

                      {/* Credenciales (si está aprobado) */}
                      {compra.estado === 'aprobado' && compra.servex_username && (
                        <div className="flex items-center gap-4 px-4 py-2 bg-neutral-700/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-neutral-500" />
                            <span className="text-sm text-neutral-300 font-mono">{compra.servex_username}</span>
                          </div>
                          {compra.servex_password && (
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-neutral-500" />
                              <span className="text-sm text-neutral-300 font-mono">{compra.servex_password}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Monto */}
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-neutral-500" />
                        <span className="font-semibold text-white">{formatCurrency(compra.monto)}</span>
                      </div>

                      {/* Estado */}
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusClass(compra.estado)}`}>
                        {getStatusIcon(compra.estado)}
                        <span className="text-sm font-medium">{getStatusText(compra.estado)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-neutral-700 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
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
                        <span className="text-neutral-600">ID: {compra.mp_payment_id}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
