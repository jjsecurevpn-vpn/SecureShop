import { supabase } from "../lib/supabase";

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  notas?: string;
}

export interface Sale {
  id: number;
  fecha: string;
  total: number;
  notas?: string;
}

export interface SaleProduct {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  subtotal: number;
}

// Productos
// getProducts supports optional pagination. If page and limit are provided,
// returns an object with { items, total } where total is the exact count.
export const getProducts = async (
  page?: number,
  limit?: number
): Promise<{ items: Product[]; total: number } | Product[]> => {
  if (page && limit) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data, error, count } = await supabase
      .from("productos")
      .select("*", { count: "exact" })
      .range(start, end)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return { items: data || [], total: count || 0 };
  }

  const { data, error } = await supabase.from("productos").select("*");
  if (error) throw error;
  return data || [];
};

export const createProduct = async (
  product: Omit<Product, "id">
): Promise<Product> => {
  const { data, error } = await supabase
    .from("productos")
    .insert([product])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (
  id: number,
  updates: Partial<Product>
): Promise<Product> => {
  const { data, error } = await supabase
    .from("productos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw error;
};

// Ventas
export const createSale = async (
  total: number,
  notas?: string
): Promise<Sale> => {
  const { data, error } = await supabase
    .from("ventas")
    .insert([{ total, notas }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createSaleProducts = async (
  saleProducts: Omit<SaleProduct, "id">[]
): Promise<SaleProduct[]> => {
  const { data, error } = await supabase
    .from("venta_productos")
    .insert(saleProducts)
    .select();
  if (error) throw error;
  return data || [];
};

export const updateProductStock = async (
  id: number,
  newStock: number
): Promise<void> => {
  const { error } = await supabase
    .from("productos")
    .update({ stock: newStock })
    .eq("id", id);
  if (error) throw error;
};

// Reportes
export const getTodaySales = async (): Promise<
  (Sale & { productos: (SaleProduct & { producto: Product })[] })[]
> => {
  // Simpler approach: fetch sales from the last N days and let the frontend
  // group them by local Argentina date. This avoids timezone-bound calculation errors.
  const DAYS_WINDOW = 7; // last 7 days
  const cutoff = new Date(
    Date.now() - DAYS_WINDOW * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("ventas")
    .select(
      `
      *,
      venta_productos (
        *,
        productos (*)
      )
    `
    )
    .gte("fecha", cutoff);

  if (error) throw error;

  // Filtrar ventas que NO están al fiado (no existen en ventas_fiadas)
  const salesData = data || [];
  const creditSaleIds = new Set();

  // Obtener IDs de ventas al fiado
  const { data: creditSales } = await supabase
    .from("ventas_fiadas")
    .select("venta_id");

  if (creditSales) {
    creditSales.forEach((cs) => creditSaleIds.add(cs.venta_id));
  }

  // Filtrar solo ventas normales (no al fiado)
  const regularSales = salesData.filter((sale) => !creditSaleIds.has(sale.id));

  // Transformar los datos para que sean más fáciles de usar
  return regularSales.map((sale) => ({
    ...sale,
    productos: (sale.venta_productos || []).map(
      (vp: SaleProduct & { productos: Product }) => ({
        ...vp,
        producto: vp.productos,
      })
    ),
  }));
};

// Ventas al fiado
export const getTodayCreditSales = async (): Promise<
  (Sale & {
    productos: (SaleProduct & { producto: Product })[];
    cliente_nombre: string;
    estado: string;
  })[]
> => {
  // Use Argentina local day's bounds for credit sales as well
  const DAYS_WINDOW_CREDIT = 7;
  const cutoffCredit = new Date(
    Date.now() - DAYS_WINDOW_CREDIT * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("ventas_fiadas")
    .select(
      `
      *,
      cliente:clientes (nombre, apellido),
      venta:ventas (
        *,
        venta_productos (
          *,
          productos (*)
        )
      )
    `
    )
    .gte("venta.fecha", cutoffCredit);

  if (error) throw error;

  // Transformar los datos para que sean más fáciles de usar
  const rows = data || [];
  // Filter out any entries without a valid venta to avoid runtime errors
  const validRows = rows.filter((r: any) => r && r.venta);

  return validRows.map((creditSale: any) => ({
    ...creditSale.venta,
    cliente_nombre: `${creditSale.cliente.nombre} ${
      creditSale.cliente.apellido || ""
    }`.trim(),
    estado: creditSale.estado,
    productos: (creditSale.venta.venta_productos || []).map(
      (vp: SaleProduct & { productos: Product }) => ({
        ...vp,
        producto: vp.productos,
      })
    ),
  }));
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
};
