import { useEffect, useState } from "react";
import { Usuario } from "../types";
import { apiService } from "../services/api.service";

interface LatestUsersData {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
}

export function useLatestUsers(
  limit: number = 10,
  refreshInterval: number = 30000
): LatestUsersData {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setError(null);
        const data = await apiService.obtenerUltimosUsuarios(limit);
        setUsuarios(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Error cargando usuarios");
        setLoading(false);
      }
    };

    fetchUsuarios();
    const interval = setInterval(fetchUsuarios, refreshInterval);
    return () => clearInterval(interval);
  }, [limit, refreshInterval]);

  return {
    usuarios,
    loading,
    error,
  };
}
