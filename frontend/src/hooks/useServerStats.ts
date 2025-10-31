import { useEffect, useState } from "react";

interface ServerStat {
  serverName: string;
  location: string;
  status: "online" | "offline";
  connectedUsers: number;
  lastUpdate: string;
}

interface ServerStatsData {
  servers: ServerStat[];
  totalUsers: number;
  onlineServers: number;
  loading: boolean;
}

export function useServerStats(
  refreshInterval: number = 10000
): ServerStatsData {
  const [servers, setServers] = useState<ServerStat[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineServers, setOnlineServers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/stats/servidores`
        );
        const data = await response.json();

        if (data.servidores) {
          setServers(data.servidores);
          const total = data.servidores.reduce(
            (sum: number, server: ServerStat) => sum + server.connectedUsers,
            0
          );
          setTotalUsers(total);
          setOnlineServers(
            data.servidores.filter((s: ServerStat) => s.status === "online")
              .length
          );
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    servers,
    totalUsers,
    onlineServers,
    loading,
  };
}
