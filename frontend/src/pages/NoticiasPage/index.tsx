import NoticiasCard from '../../components/NoticiasCard';
import NoticiaModal from '../../components/NoticiaModal';
import { Title } from '../../components/Title';
import { Subtitle } from '../../components/Subtitle';
import { useNoticias } from '../../hooks/useNoticiasDB';
import { useState } from 'react';
import type { Noticia } from '../../types';

export default function NoticiasPage() {
  const { noticias, loading, error } = useNoticias();
  const [selected, setSelected] = useState<{ id: string; preview?: Noticia } | null>(null);

  return (
    <div className="bg-white text-gray-900">
      <section className="min-h-screen bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-12">
          <div className="mb-8">
            <Title as="h1">Noticias</Title>
            <Subtitle className="mt-2">
              Novedades, avisos y actualizaciones del servicio.
            </Subtitle>
          </div>

          {loading && (
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
              <Subtitle>Cargando noticias…</Subtitle>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
              <Subtitle className="text-red-600">{error}</Subtitle>
            </div>
          )}

          {!loading && !error && noticias.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 text-center">
              <Title as="h3" center className="mb-2">Todavía no hay noticias</Title>
              <Subtitle center>
                Cuando publiquemos avisos o novedades, van a aparecer acá.
              </Subtitle>
            </div>
          )}

          {!loading && !error && noticias.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map((noticia) => (
                <NoticiasCard
                  key={noticia.id}
                  noticia={noticia}
                  onClick={() => setSelected({ id: noticia.id, preview: noticia })}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <NoticiaModal
          noticiaId={selected.id}
          noticiaPreview={selected.preview}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
