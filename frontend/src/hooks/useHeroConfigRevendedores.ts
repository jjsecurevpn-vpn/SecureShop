import { useState, useEffect } from "react";
import { apiService } from "../services/api.service";

export interface HeroConfig {
  titulo: string;
  descripcion: string;
  promocion?: {
    habilitada: boolean;
    texto: string;
    estilo: string;
    textColor: string;
    bgColor: string;
    comentario: string;
  };
}

export interface UseHeroConfigReturn {
  config: HeroConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHeroConfigRevendedores(): UseHeroConfigReturn {
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.obtenerConfigHeroRevendedores();
      setConfig(data);
    } catch (err: any) {
      console.error(
        "Error cargando configuración del hero de revendedores:",
        err
      );
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
  };
}
