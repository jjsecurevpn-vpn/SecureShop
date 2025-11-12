import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity } from 'lucide-react';

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  onlineNow: number;
  lastUpdate: Date;
}

export default function VisitorsCounter() {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    onlineNow: 0,
    lastUpdate: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas iniciales y registrar visitante
  useEffect(() => {
    const registerVisitor = async () => {
      try {
        // Registrar visitante
        const registerResponse = await fetch('/api/visitors/register');
        if (registerResponse.ok) {
          const data = await registerResponse.json();
          setStats(data.data);
        }

        // Registrar como online
        const onlineResponse = await fetch('/api/visitors/online', {
          method: 'POST',
        });
        if (onlineResponse.ok) {
          const data = await onlineResponse.json();
          setStats(data.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading visitor stats:', err);
        setError('No se pudieron cargar las estadísticas');
        setLoading(false);
      }
    };

    registerVisitor();

    // Cleanup: Desregistrar como online cuando se desmonten el componente
    return () => {
      fetch('/api/visitors/offline', { method: 'POST' }).catch(console.error);
    };
  }, []);

  // Obtener estadísticas actualizadas cada 5 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/visitors/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (err) {
        console.error('Error updating stats:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-6 justify-center lg:justify-start px-4">
        <div className="h-16 w-32 bg-neutral-800 rounded-lg animate-pulse" />
        <div className="h-16 w-32 bg-neutral-800 rounded-lg animate-pulse" />
        <div className="h-16 w-32 bg-neutral-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return null; // Si hay error, no mostrar nada
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Título */}
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
        <p className="text-xs text-neutral-400 font-medium">
          Únete a miles de usuarios seguros
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Visitantes */}
        <div className="group relative overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4 hover:border-violet-500/30 transition-all">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">
                Total
              </span>
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-white">
                {stats.totalVisitors.toLocaleString('es-AR')}
              </span>
            </div>
            <span className="text-xs text-neutral-500">visitantes</span>
          </div>
        </div>

        {/* Visitantes Hoy */}
        <div className="group relative overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4 hover:border-green-500/30 transition-all">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">
                Hoy
              </span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-white">
                {stats.todayVisitors.toLocaleString('es-AR')}
              </span>
            </div>
            <span className="text-xs text-neutral-500">esta sesión</span>
          </div>
        </div>

        {/* Online Ahora */}
        <div className="group relative overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4 hover:border-red-500/30 transition-all">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">
                Online
              </span>
              <div className="relative">
                <Activity className="w-4 h-4 text-red-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-white">
                {stats.onlineNow.toLocaleString('es-AR')}
              </span>
            </div>
            <span className="text-xs text-neutral-500">conectados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
