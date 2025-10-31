import { useEffect, useState } from "react";

export interface PlanRevendedor {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number;
  account_type: "validity" | "credit";
  dias: number;
  activo: boolean;
}

interface UsePlanesRevendedoresData {
  planesValidity: PlanRevendedor[];
  planesCredit: PlanRevendedor[];
  loading: boolean;
  error: string | null;
}

export function usePlanesRevendedores(): UsePlanesRevendedoresData {
  const [planesValidity, setPlanesValidity] = useState<PlanRevendedor[]>([]);
  const [planesCredit, setPlanesCredit] = useState<PlanRevendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/planes-revendedores`
        );
        const data = await response.json();

        if (data.success && data.data) {
          const planes = data.data as PlanRevendedor[];

          // Separar por tipo
          const validity = planes.filter((p) => p.account_type === "validity");
          const credit = planes.filter((p) => p.account_type === "credit");

          // Ordenar por max_users para que se muestren lógicamente
          validity.sort((a, b) => a.max_users - b.max_users);
          credit.sort((a, b) => a.max_users - b.max_users);

          setPlanesValidity(validity);
          setPlanesCredit(credit);
          setError(null);
        } else {
          setError("Error al obtener los planes");
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar los planes");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, []);

  return {
    planesValidity,
    planesCredit,
    loading,
    error,
  };
}
