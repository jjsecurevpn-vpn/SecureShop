import { useEffect, useState } from "react";

interface RevendedoresCountData {
  totalRevendedores: number;
  loading: boolean;
  error: string | null;
}

export function useRevendedoresCount(
  refreshInterval: number = 30000
): RevendedoresCountData {
  const [totalRevendedores, setTotalRevendedores] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setError(null);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/stats/revendedores`
        );
        const data = await response.json();

        if (response.ok && data.totalRevendedores !== undefined) {
          setTotalRevendedores(data.totalRevendedores);
        } else {
          throw new Error(
            data.error || "Error al obtener el conteo de revendedores"
          );
        }
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching revendedores count:", error);
        setError(error.message || "Error desconocido");
        setLoading(false);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    totalRevendedores,
    loading,
    error,
  };
}
