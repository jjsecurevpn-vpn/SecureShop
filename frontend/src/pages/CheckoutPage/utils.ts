import { Plan } from "../../types";

export const calcularPrecioFinal = (plan: Plan, descuento: number): number => {
  return Math.max(0, plan.precio - descuento);
};

export const calcularPrecioPorDia = (precioFinal: number, dias: number): string => {
  if (dias <= 0) return "0";
  return (precioFinal / dias).toFixed(0);
};

export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validarNombre = (nombre: string): boolean => {
  return nombre.trim().length > 0;
};