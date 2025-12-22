import { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Send } from 'lucide-react';
import { Title } from './Title';
import { Subtitle } from './Subtitle';
import { protonColors } from '../styles/colors';
import type { CrearNoticiaComentario, Noticia, NoticiaComentario } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NoticiaModalProps {
  noticiaId: string;
  noticiaPreview?: Noticia;
  onClose: () => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NoticiaModal({ noticiaId, noticiaPreview, onClose }: NoticiaModalProps) {
  const { user, profile } = useAuth();

  const [noticia, setNoticia] = useState<Noticia | null>(noticiaPreview ?? null);
  const [loadingNoticia, setLoadingNoticia] = useState(true);
  const [errorNoticia, setErrorNoticia] = useState<string | null>(null);

  const [comentarios, setComentarios] = useState<NoticiaComentario[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [errorComentarios, setErrorComentarios] = useState<string | null>(null);

  const [form, setForm] = useState<CrearNoticiaComentario>(() => {
    const nombre = profile?.nombre || user?.user_metadata?.full_name || '';
    return {
      nombre,
      email: user?.email || '',
      contenido: '',
      user_id: user?.id,
    };
  });

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const categoriaStyle = useMemo(() => {
    const categoriaColor = noticia?.categoria_color || protonColors.purple[500];
    return {
      backgroundColor: categoriaColor + '20',
      color: categoriaColor,
    };
  }, [noticia?.categoria_color]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let mounted = true;

    async function loadNoticia() {
      setLoadingNoticia(true);
      setErrorNoticia(null);
      try {
        const resp = await fetch(`/api/noticias/${noticiaId}`);
        const json = await resp.json();
        if (!resp.ok || !json?.success) {
          throw new Error(json?.error || 'No se pudo cargar la noticia');
        }
        if (mounted) setNoticia(json.data);
      } catch (e: any) {
        if (mounted) setErrorNoticia(e?.message || 'Error cargando la noticia');
      } finally {
        if (mounted) setLoadingNoticia(false);
      }
    }

    loadNoticia();
    return () => {
      mounted = false;
    };
  }, [noticiaId]);

  useEffect(() => {
    let mounted = true;

    async function loadComentarios() {
      if (!noticia?.allow_comentarios) return;

      setLoadingComentarios(true);
      setErrorComentarios(null);
      try {
        const resp = await fetch(`/api/noticias/${noticiaId}/comentarios`);
        const json = await resp.json();
        if (!resp.ok || !json?.success) {
          throw new Error(json?.error || 'No se pudieron cargar los comentarios');
        }
        if (mounted) setComentarios(json.data || []);
      } catch (e: any) {
        if (mounted) setErrorComentarios(e?.message || 'Error cargando comentarios');
      } finally {
        if (mounted) setLoadingComentarios(false);
      }
    }

    loadComentarios();
    return () => {
      mounted = false;
    };
  }, [noticia?.allow_comentarios, noticiaId]);

  const handleSubmit = async () => {
    setSendError(null);

    const nombre = (form.nombre || '').trim();
    const contenido = (form.contenido || '').trim();
    const email = (form.email || '').trim();

    if (!nombre) {
      setSendError('Ingresá tu nombre.');
      return;
    }
    if (!contenido) {
      setSendError('Escribí un comentario.');
      return;
    }

    setSending(true);
    try {
      const resp = await fetch(`/api/noticias/${noticiaId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email: email || undefined,
          contenido,
          user_id: user?.id,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || 'No se pudo enviar el comentario');
      }

      setForm((prev) => ({ ...prev, contenido: '' }));

      // Insertar al principio (orden DESC)
      if (json.data) {
        setComentarios((prev) => [json.data as NoticiaComentario, ...prev]);
      } else {
        // fallback: recargar
        const reload = await fetch(`/api/noticias/${noticiaId}/comentarios`);
        const reloadJson = await reload.json();
        if (reload.ok && reloadJson?.success) setComentarios(reloadJson.data || []);
      }
    } catch (e: any) {
      setSendError(e?.message || 'Error enviando comentario');
    } finally {
      setSending(false);
    }
  };

  const titulo = noticia?.titulo || 'Noticia';
  const descripcion = noticia?.descripcion || '';
  const contenido = noticia?.contenido_completo || '';
  const fecha = noticia?.fecha_publicacion || noticia?.created_at;
  const imageAlt = noticia?.imagen_alt || titulo;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="min-w-0">
            {noticia?.categoria_nombre && (
              <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={categoriaStyle}
              >
                {noticia.categoria_icono === 'Gift' ? '🎁' : '📰'}
                {noticia.categoria_nombre}
              </div>
            )}
            <Title as="h2" className="!text-[1.75rem] !leading-tight">
              {titulo}
            </Title>
            {fecha && (
              <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: protonColors.gray[500] }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: protonColors.purple[500] }} />
                {formatDate(fecha)}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {loadingNoticia && (
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
              <Subtitle>Cargando noticia…</Subtitle>
            </div>
          )}

          {!loadingNoticia && errorNoticia && (
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
              <Subtitle className="text-red-600">{errorNoticia}</Subtitle>
            </div>
          )}

          {!loadingNoticia && !errorNoticia && noticia && (
            <>
              {noticia.imagen_url && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl overflow-hidden">
                  <img
                    src={noticia.imagen_url}
                    alt={imageAlt}
                    className="w-full h-auto object-contain max-h-[32rem] mx-auto"
                    loading="lazy"
                  />
                </div>
              )}

              {descripcion && (
                <Subtitle className="text-base">{descripcion}</Subtitle>
              )}

              {contenido && (
                <div className="text-sm whitespace-pre-wrap" style={{ color: protonColors.gray[700] }}>
                  {contenido}
                </div>
              )}

              {/* Comentarios */}
              {noticia.allow_comentarios && (
                <div className="pt-2">
                  <Title as="h3" className="!text-[1.5rem]">Comentarios</Title>
                  <Subtitle className="mt-1">
                    Dejá tu comentario abajo.
                  </Subtitle>

                  <div className="mt-4 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={form.nombre}
                        onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                        placeholder="Tu nombre"
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        style={{ color: protonColors.purple[800] }}
                      />
                      <input
                        value={form.email || ''}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email (opcional)"
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        style={{ color: protonColors.purple[800] }}
                      />
                    </div>

                    <textarea
                      value={form.contenido}
                      onChange={(e) => setForm((p) => ({ ...p, contenido: e.target.value }))}
                      placeholder="Escribí tu comentario…"
                      rows={4}
                      className="mt-3 w-full px-4 py-3 bg-white border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      style={{ color: protonColors.purple[800] }}
                    />

                    {sendError && (
                      <p className="text-sm text-red-600 mt-2">{sendError}</p>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={sending}
                      className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'Enviando…' : 'Enviar comentario'}
                    </button>
                  </div>

                  <div className="mt-4">
                    {loadingComentarios && (
                      <Subtitle>Cargando comentarios…</Subtitle>
                    )}
                    {!loadingComentarios && errorComentarios && (
                      <Subtitle className="text-red-600">{errorComentarios}</Subtitle>
                    )}
                    {!loadingComentarios && !errorComentarios && comentarios.length === 0 && (
                      <Subtitle>Todavía no hay comentarios.</Subtitle>
                    )}

                    {!loadingComentarios && !errorComentarios && comentarios.length > 0 && (
                      <div className="space-y-3">
                        {comentarios.map((c) => (
                          <div
                            key={c.id}
                            className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold" style={{ color: protonColors.purple[800] }}>
                                {c.nombre}
                              </p>
                              <p className="text-xs" style={{ color: protonColors.gray[500] }}>
                                {formatDate(c.created_at)}
                              </p>
                            </div>
                            <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: protonColors.gray[700] }}>
                              {c.contenido}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
