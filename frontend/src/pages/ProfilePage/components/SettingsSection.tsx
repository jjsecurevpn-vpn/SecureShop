import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import {
  User as UserIcon,
  BadgeCheck,
  AlertTriangle,
  Save,
  Loader2,
  Shield,
  Bell,
} from 'lucide-react';
import { Profile } from '../../../lib/supabase';
import { Button } from '../../../components/Button';
import { formatDate } from '../utils';

interface SettingsSectionProps {
  user: User;
  profile: Profile | null;
  onUpdateProfile: (data: { nombre?: string; telefono?: string }) => Promise<any>;
}

export function SettingsSection({ user, profile, onUpdateProfile }: SettingsSectionProps) {
  const [nombre, setNombre] = useState(profile?.nombre || '');
  const [telefono, setTelefono] = useState(profile?.telefono || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const emailVerificado = !!user.email_confirmed_at;

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await onUpdateProfile({ nombre, telefono });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
    setSaving(false);
  };

  const hasChanges = nombre !== (profile?.nombre || '') || telefono !== (profile?.telefono || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Información Personal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Información Personal</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {emailVerificado ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+54 11 1234-5678"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Miembro desde */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Miembro desde: <span className="font-medium text-gray-700">{formatDate(user.created_at)}</span>
            </p>
          </div>

          {/* Botón Guardar */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar cambios
              </Button>
              {success && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ Guardado correctamente
                </span>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Seguridad */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Seguridad</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Verificación de email</p>
              <p className="text-sm text-gray-500">Tu email está {emailVerificado ? 'verificado' : 'pendiente de verificación'}</p>
            </div>
            {emailVerificado ? (
              <span className="inline-flex items-center gap-1.5 text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                <BadgeCheck className="w-4 h-4" />
                Activo
              </span>
            ) : (
              <Button variant="secondary" size="sm">
                Verificar ahora
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notificaciones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Notificaciones</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Notificaciones por email</p>
              <p className="text-sm text-gray-500">Recibe actualizaciones y novedades</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Recordatorios de renovación</p>
              <p className="text-sm text-gray-500">Te avisamos antes de que expire tu plan</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
