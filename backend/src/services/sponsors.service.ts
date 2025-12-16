import { DatabaseService } from "./database.service";
import { sponsorsSupabaseService } from "./sponsors-supabase.service";
import {
  Sponsor,
  CrearSponsorInput,
  ActualizarSponsorInput,
} from "../types";

export class SponsorsService {
  constructor(private readonly database: DatabaseService) {}

  // Flag para usar Supabase (modo híbrido)
  private get useSupabase(): boolean {
    return sponsorsSupabaseService.isEnabled();
  }

  async listar(): Promise<Sponsor[]> {
    if (this.useSupabase) {
      const sponsors = await sponsorsSupabaseService.obtenerSponsors();
      if (sponsors.length > 0) {
        // Mapear campos de Supabase a formato esperado
        return sponsors.map(s => this.mapearSponsorDesdeSupabase(s));
      }
    }
    return this.database.obtenerSponsors();
  }

  async crear(input: CrearSponsorInput): Promise<Sponsor> {
    const payload = this.normalizarCrear(input);
    this.validarCrear(payload);
    
    if (this.useSupabase) {
      const sponsor = await sponsorsSupabaseService.crearSponsor({
        nombre: payload.name,
        categoria: payload.category as 'empresa' | 'persona',
        rol: payload.role,
        mensaje: payload.message,
        avatar_initials: payload.avatarInitials,
        avatar_class: payload.avatarClass,
        avatar_url: payload.avatarUrl,
        destacado: payload.highlight,
        link: payload.link,
        orden: payload.order
      });
      if (sponsor) {
        console.log('[Sponsors] ✅ Sponsor creado en Supabase:', sponsor.id);
        return this.mapearSponsorDesdeSupabase(sponsor);
      }
      console.warn('[Sponsors] ⚠️ Falló Supabase, usando SQLite fallback');
    }
    
    return this.database.crearSponsor(payload);
  }

  async actualizar(id: number, input: ActualizarSponsorInput): Promise<Sponsor> {
    const payload = this.normalizarActualizar(input);
    this.validarActualizar(payload);
    
    if (this.useSupabase) {
      const updateData: any = {};
      if (payload.name !== undefined) updateData.nombre = payload.name;
      if (payload.category !== undefined) updateData.categoria = payload.category;
      if (payload.role !== undefined) updateData.rol = payload.role;
      if (payload.message !== undefined) updateData.mensaje = payload.message;
      if (payload.avatarInitials !== undefined) updateData.avatar_initials = payload.avatarInitials;
      if (payload.avatarClass !== undefined) updateData.avatar_class = payload.avatarClass;
      if (payload.avatarUrl !== undefined) updateData.avatar_url = payload.avatarUrl;
      if (payload.highlight !== undefined) updateData.destacado = payload.highlight;
      if (payload.link !== undefined) updateData.link = payload.link;
      if (payload.order !== undefined) updateData.orden = payload.order;

      const sponsor = await sponsorsSupabaseService.actualizarSponsor(id, updateData);
      if (sponsor) {
        console.log('[Sponsors] ✅ Sponsor actualizado en Supabase:', sponsor.id);
        return this.mapearSponsorDesdeSupabase(sponsor);
      }
    }
    
    const actualizado = this.database.actualizarSponsor(id, payload);
    if (!actualizado) {
      throw new Error("Sponsor no encontrado");
    }
    return actualizado;
  }

  async eliminar(id: number): Promise<void> {
    if (this.useSupabase) {
      await sponsorsSupabaseService.eliminarSponsor(id);
    }
    this.database.eliminarSponsor(id);
  }

  private mapearSponsorDesdeSupabase(s: any): Sponsor {
    return {
      id: s.id,
      name: s.nombre,
      category: s.categoria,
      role: s.rol,
      message: s.mensaje,
      avatarInitials: s.avatar_initials,
      avatarClass: s.avatar_class,
      avatarUrl: s.avatar_url,
      highlight: s.destacado,
      link: s.link,
      order: s.orden,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    };
  }

  private normalizarCrear(input: CrearSponsorInput): CrearSponsorInput {
    return {
      ...input,
      name: input.name.trim(),
      role: input.role.trim(),
      message: input.message.trim(),
      avatarInitials: input.avatarInitials.trim().toUpperCase().slice(0, 2),
      avatarClass: input.avatarClass.trim(),
      avatarUrl: input.avatarUrl?.trim() || undefined,
      link: input.link?.trim() || undefined,
      highlight: Boolean(input.highlight),
      order: input.order ?? Date.now(),
    };
  }

  private normalizarActualizar(
    input: ActualizarSponsorInput,
  ): ActualizarSponsorInput {
    const payload: ActualizarSponsorInput = { ...input };
    if (payload.name !== undefined) {
      payload.name = payload.name.trim();
    }
    if (payload.role !== undefined) {
      payload.role = payload.role.trim();
    }
    if (payload.message !== undefined) {
      payload.message = payload.message.trim();
    }
    if (payload.avatarInitials !== undefined) {
      payload.avatarInitials = payload.avatarInitials
        .trim()
        .toUpperCase()
        .slice(0, 2);
    }
    if (payload.avatarClass !== undefined) {
      payload.avatarClass = payload.avatarClass.trim();
    }
    if (payload.avatarUrl !== undefined) {
      payload.avatarUrl = payload.avatarUrl.trim() || undefined;
    }
    if (payload.link !== undefined) {
      payload.link = payload.link.trim() || undefined;
    }
    if (payload.highlight !== undefined) {
      payload.highlight = Boolean(payload.highlight);
    }
    return payload;
  }

  private validarCrear(input: CrearSponsorInput): void {
    if (!input.name) {
      throw new Error("El nombre es obligatorio");
    }
    if (!input.role) {
      throw new Error("El rol es obligatorio");
    }
    if (!input.message) {
      throw new Error("El mensaje es obligatorio");
    }
    if (!input.avatarClass) {
      throw new Error("La clase del avatar es obligatoria");
    }
    if (!this.categoriaValida(input.category)) {
      throw new Error("Categoría inválida");
    }
    if (!input.avatarInitials) {
      input.avatarInitials = this.generarIniciales(input.name);
    }
    if (!input.avatarInitials && !input.avatarUrl) {
      throw new Error("Debes proporcionar iniciales o un logo");
    }
  }

  private validarActualizar(input: ActualizarSponsorInput): void {
    if (input.category !== undefined && !this.categoriaValida(input.category)) {
      throw new Error("Categoría inválida");
    }
    if (
      input.avatarInitials !== undefined &&
      !input.avatarInitials &&
      !input.avatarUrl
    ) {
      throw new Error("Debes proporcionar iniciales o un logo");
    }
  }

  private categoriaValida(category: string | undefined): boolean {
    return category === "empresa" || category === "persona";
  }

  private generarIniciales(nombre: string): string {
    if (!nombre) {
      return "";
    }
    const partes = nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    if (partes.length === 0) {
      return "";
    }
    const iniciales = partes.map((parte) => parte[0]!.toUpperCase()).join("");
    return iniciales.slice(0, 2);
  }
}
