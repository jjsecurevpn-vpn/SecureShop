import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/Button';
import { PurchaseHistory } from '../../../lib/supabase';
import { calcularDiasRestantes } from '../utils';

interface ActiveSubscriptionCardProps {
  suscripcion: PurchaseHistory;
}

export function ActiveSubscriptionCard({ suscripcion }: ActiveSubscriptionCardProps) {
  const navigate = useNavigate();
  const diasRestantes = calcularDiasRestantes(suscripcion.servex_expiracion!);

  const handleRenovar = () => {
    // Navegar a la página correcta según el tipo de cuenta
    const username = suscripcion.servex_username || '';
    const esRevendedor = suscripcion.tipo === 'revendedor';
    
    // Revendedores van a /revendedores, clientes van a /planes
    const ruta = esRevendedor ? '/revendedores' : '/planes';
    navigate(`${ruta}?cuenta=${encodeURIComponent(username)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 }}
    >
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              {suscripcion.tipo === 'revendedor' ? (
                <Shield className="w-7 h-7" />
              ) : (
                <Wifi className="w-7 h-7" />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Tu plan activo</p>
              <h3 className="text-xl font-bold">{suscripcion.plan_nombre}</h3>
              <p className="text-sm opacity-80">Usuario: {suscripcion.servex_username}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${diasRestantes <= 7 ? 'text-yellow-300' : 'text-white'}`}>
                {diasRestantes}
              </div>
              <div className="text-xs opacity-80">días restantes</div>
            </div>
            <Button
              onClick={handleRenovar}
              variant="secondary"
              size="md"
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Renovar
            </Button>
          </div>
        </div>
        {diasRestantes <= 7 && (
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-yellow-200 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Tu suscripción está por vencer. ¡Renueva ahora para no perder acceso!
          </div>
        )}
      </div>
    </motion.div>
  );
}
