import { FormEvent, useState } from "react";
import { Trash2, Plus, Edit2, Check, X, Loader2 } from "lucide-react";
import {
  Sponsor,
  CrearSponsorPayload,
  ActualizarSponsorPayload,
} from "../../../types";

interface SponsorFormState {
  name: string;
  category: "empresa" | "persona";
  role: string;
  message: string;
  avatarInitials: string;
  highlight: boolean;
  link: string;
  avatarColor: string;
  avatarUrl: string;
}

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  loading: boolean;
  onCreate: (payload: CrearSponsorPayload) => Promise<void>;
  onDelete: (sponsorId: number) => Promise<void>;
  onUpdate: (id: number, payload: ActualizarSponsorPayload) => Promise<void>;
  success: string | null;
  error: string | null;
}

const AVATAR_COLORS = [
  "bg-gradient-to-br from-amber-500/30 via-amber-600/40 to-orange-500/40 text-amber-100",
  "bg-gradient-to-br from-blue-500/30 via-blue-600/40 to-cyan-500/40 text-blue-100",
  "bg-gradient-to-br from-emerald-500/30 via-emerald-600/40 to-teal-500/40 text-emerald-100",
  "bg-gradient-to-br from-sky-500/30 via-sky-600/40 to-blue-500/40 text-sky-100",
  "bg-gradient-to-br from-rose-500/30 via-rose-600/40 to-rose-700/40 text-rose-100",
  "bg-gradient-to-br from-violet-500/30 via-violet-600/40 to-fuchsia-500/40 text-violet-100",
  "bg-gradient-to-br from-purple-500/30 via-purple-600/40 to-indigo-500/40 text-purple-100",
  "bg-gradient-to-br from-amber-500/30 via-amber-600/30 to-yellow-500/30 text-amber-100",
];

const INITIAL_FORM: SponsorFormState = {
  name: "",
  category: "empresa",
  role: "",
  message: "",
  avatarInitials: "",
  highlight: false,
  link: "",
  avatarColor: AVATAR_COLORS[0],
  avatarUrl: "",
};

export default function SponsorsSection({
  sponsors,
  loading,
  onCreate,
  onDelete,
  onUpdate,
  success,
  error,
}: SponsorsSectionProps) {
  const [form, setForm] = useState<SponsorFormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.role || !form.message) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    setIsSubmitting(true);
    try {
      const fallbackInitials = form.avatarInitials
        ? form.avatarInitials
        : form.name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((segment) => segment[0]!.toUpperCase())
            .join("")
            .slice(0, 2);

      const payload: CrearSponsorPayload = {
        name: form.name,
        category: form.category,
        role: form.role,
        message: form.message,
        avatarInitials: fallbackInitials,
        avatarClass: form.avatarColor,
        avatarUrl: form.avatarUrl || undefined,
        highlight: form.highlight,
        link: form.link || undefined,
      };

      if (editingId !== null) {
        await onUpdate(editingId, payload);
        setEditingId(null);
      } else {
        await onCreate(payload);
      }

      setForm(INITIAL_FORM);
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setForm({
      name: sponsor.name,
      category: sponsor.category,
      role: sponsor.role,
      message: sponsor.message,
      avatarInitials: sponsor.avatarInitials,
      highlight: sponsor.highlight || false,
      link: sponsor.link || "",
      avatarColor: sponsor.avatarClass,
      avatarUrl: sponsor.avatarUrl || "",
    });
    setEditingId(sponsor.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const highlightedCount = sponsors.filter((s) => s.highlight).length;
  const companyCount = sponsors.filter((s) => s.category === "empresa").length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4">
          <p className="text-xs uppercase text-neutral-500 font-medium">Total</p>
          <p className="mt-2 text-2xl font-semibold text-white">{sponsors.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4">
          <p className="text-xs uppercase text-neutral-500 font-medium">Empresas</p>
          <p className="mt-2 text-2xl font-semibold text-blue-400">{companyCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4">
          <p className="text-xs uppercase text-neutral-500 font-medium">Destacados</p>
          <p className="mt-2 text-2xl font-semibold text-amber-400">{highlightedCount}</p>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-4 rounded-lg bg-green-600/20 border border-green-600/50 text-green-300 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-600/20 border border-red-600/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar sponsor
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-lg border border-neutral-800/50 bg-neutral-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600"
                placeholder="Nombre o empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as "empresa" | "persona" })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600"
              >
                <option value="empresa">Empresa</option>
                <option value="persona">Persona</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Iniciales Avatar (opcional si cargas logo)</label>
              <input
                type="text"
                value={form.avatarInitials}
                onChange={(e) => setForm({ ...form, avatarInitials: e.target.value.toUpperCase().slice(0, 2) })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600"
                placeholder="ej: SL"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol/Título *</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600"
                placeholder="ej: Monitoreo regional 24/7"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link (opcional)</label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600"
                placeholder="https://ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo / Imagen (URL)</label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600"
                placeholder="https://mi-logo.com/logo.png"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Acepta enlaces HTTPS. Si el logo está definido, se mostrará en la tarjeta pública.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color Avatar</label>
              <select
                value={form.avatarColor}
                onChange={(e) => setForm({ ...form, avatarColor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600"
              >
                {AVATAR_COLORS.map((color, idx) => (
                  <option key={idx} value={color}>
                    Color {idx + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-violet-600 resize-none"
              placeholder="Descripción de la contribución..."
              rows={3}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.highlight}
              onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
              className="rounded border-neutral-700"
            />
            <span className="text-sm">Marcar como destacado</span>
          </label>

          {form.avatarUrl && (
            <div>
              <p className="text-xs text-neutral-500 mb-2">Previsualización del logo</p>
              <img
                src={form.avatarUrl}
                alt={form.name || "Logo del sponsor"}
                className="h-16 w-16 rounded-lg object-cover border border-neutral-800"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:text-green-300/60 text-white font-medium transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {editingId !== null ? "Actualizar" : "Agregar"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sponsors registrados</h3>
        {loading ? (
          <div className="text-center py-8 text-neutral-400">Cargando...</div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">No hay sponsors registrados</div>
        ) : (
          <div className="space-y-3">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex items-start justify-between p-4 rounded-lg border border-neutral-800/50 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  {sponsor.avatarUrl ? (
                    <img
                      src={sponsor.avatarUrl}
                      alt={`Logo de ${sponsor.name}`}
                      className="h-12 w-12 rounded-lg object-cover border border-neutral-800/60"
                    />
                  ) : (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold flex-shrink-0 ${sponsor.avatarClass}`}>
                      {sponsor.avatarInitials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-white break-words">{sponsor.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-300">
                        {sponsor.category === "empresa" ? "Empresa" : "Persona"}
                      </span>
                      {sponsor.highlight && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-600/20 text-amber-300">
                          Destacado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-violet-400 mt-1">{sponsor.role}</p>
                    <p className="text-sm text-neutral-300 mt-1 break-words">{sponsor.message}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(sponsor)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      setDeletingId(sponsor.id);
                      try {
                        await onDelete(sponsor.id);
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={deletingId === sponsor.id}
                    className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-900/40 text-red-400 hover:text-red-300 transition-colors"
                    title="Eliminar"
                  >
                    {deletingId === sponsor.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
