import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  onlineNow: number;
  lastUpdate: Date;
}

/**
 * VisitorsCounterMinimal - Versión compacta del contador
 * Ideal para colocar en header o como badge
 */
export default function VisitorsCounterMinimal() {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    onlineNow: 0,
    lastUpdate: new Date(),
  });

  useEffect(() => {
    const registerAndFetch = async () => {
      try {
        // Registrar visitante
        const registerResponse = await fetch('/api/visitors/register');
        if (registerResponse.ok) {
          const data = await registerResponse.json();
          setStats(data.data);
        }

        // Registrar como online
        await fetch('/api/visitors/online', { method: 'POST' });
      } catch (err) {
        console.error('Error:', err);
      }
    };

    registerAndFetch();

    // Actualizar cada 10 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/visitors/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      fetch('/api/visitors/offline', { method: 'POST' }).catch(() => {});
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700 hover:border-green-500/50 transition-colors">
      <Activity className="w-4 h-4 text-green-500 animate-pulse" />
      <span className="text-sm font-medium text-white">
        {stats.onlineNow}
      </span>
      <span className="text-xs text-neutral-400">online</span>
    </div>
  );
}
