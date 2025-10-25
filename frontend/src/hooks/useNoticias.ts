import { useState, useEffect } from 'react';
import type { NoticiaConfig } from '../types';

export function useNoticias() {
  const [config, setConfig] = useState<NoticiaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/config/noticias');
        const result = await response.json();

        if (result.success) {
          setConfig(result.data || null);
          setError(null);
        } else {
          setConfig(null);
        }
      } catch (err) {
        console.error('Error fetching noticias:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
    const interval = setInterval(fetchNoticias, 30000);
    return () => clearInterval(interval);
  }, []);

  return { config, loading, error };
}
