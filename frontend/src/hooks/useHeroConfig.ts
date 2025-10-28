import { useState, useEffect } from "react";

interface HeroPromocion {
  habilitada: boolean;
  texto: string;
  estilo?: string; // Mantener por compatibilidad
  textColor: string;
  bgColor: string;
  borderColor?: string;
  iconColor?: string;
  shadowColor?: string;
  comentario?: string;
}

interface HeroConfig {
  titulo: string;
  descripcion: string;
  promocion: HeroPromocion;
}

export const useHeroConfig = () => {
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/config/hero");
        const result = await response.json();

        if (result.success && result.data) {
          setConfig(result.data);
        } else {
          setError("No se pudo obtener configuración del hero");
        }
      } catch (err) {
        console.error("Error fetching hero config:", err);
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchHeroConfig();
  }, []);

  return { config, loading, error };
};
