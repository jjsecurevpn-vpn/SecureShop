import { useMemo, useState } from 'react';
import { Calendar, Eye, Star } from 'lucide-react';
import type { Noticia } from '../types';
import { protonColors } from '../styles/colors';

interface NoticiasCardProps {
  noticia: Noticia;
  onClick?: (noticia: Noticia) => void;
  variant?: 'default' | 'highlight' | 'compact';
}

export default function NoticiasCard({
  noticia,
  onClick,
  variant = 'default',
}: NoticiasCardProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const categoriaStyle = useMemo(() => {
    const categoriaColor = noticia.categoria_color || protonColors.purple[500];
    return {
      backgroundColor: categoriaColor + '20',
      color: categoriaColor,
    };
  }, [noticia.categoria_color]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
  };

  const imageAlt = noticia.imagen_alt || noticia.titulo;

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onClick?.(noticia)}
        className="p-3 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
      >
        <div className="flex gap-3">
          {noticia.imagen_url && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-purple-50 border border-purple-100 flex items-center justify-center">
              <img
                src={noticia.imagen_url}
                alt={imageAlt}
                onLoad={handleImageLoad}
                className={`w-full h-full ${isPortrait ? 'object-contain p-1' : 'object-cover'} transition`}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold line-clamp-2" style={{ color: protonColors.purple[800] }}>
              {noticia.titulo}
            </h4>
            <p className="text-xs line-clamp-1" style={{ color: protonColors.gray[600] }}>
              {noticia.descripcion}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: protonColors.gray[500] }}>
              <Calendar className="w-3 h-3" style={{ color: protonColors.purple[500] }} />
              {formatDate(noticia.fecha_publicacion || noticia.created_at)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'highlight') {
    return (
      <div
        onClick={() => onClick?.(noticia)}
        className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group"
      >
        {/* Imagen */}
        {noticia.imagen_url && (
          <div
            className={`relative overflow-hidden ${isPortrait ? 'bg-purple-50' : ''}`}
          >
            <img
              src={noticia.imagen_url}
              alt={imageAlt}
              onLoad={handleImageLoad}
              className={
                isPortrait
                  ? 'w-full h-auto object-contain max-h-96 mx-auto'
                  : 'w-full h-48 object-cover group-hover:scale-105 transition'
              }
            />
            {!isPortrait && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            )}
          </div>
        )}

        {/* Contenido */}
        <div className="p-5">
          {/* Categoría */}
          {noticia.categoria_nombre && (
            <div
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-2"
              style={categoriaStyle}
            >
              <span>{noticia.categoria_icono === 'Gift' ? '🎁' : '📰'}</span>
              {noticia.categoria_nombre}
            </div>
          )}

          <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: protonColors.purple[800] }}>
            {noticia.titulo}
          </h3>
          <p className="text-sm line-clamp-2 mb-4" style={{ color: protonColors.gray[600] }}>
            {noticia.descripcion}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs" style={{ color: protonColors.gray[500] }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" style={{ color: protonColors.purple[500] }} />
              {formatDate(noticia.fecha_publicacion || noticia.created_at)}
            </div>
            {noticia.total_vistas !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" style={{ color: protonColors.purple[500] }} />
                {noticia.total_vistas}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      onClick={() => onClick?.(noticia)}
      className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
    >
      {/* Imagen */}
      {noticia.imagen_url && (
        <div className={`relative overflow-hidden ${isPortrait ? 'bg-purple-50' : ''}`}>
          <img
            src={noticia.imagen_url}
            alt={imageAlt}
            onLoad={handleImageLoad}
            className={
              isPortrait
                ? 'w-full h-auto object-contain max-h-[32rem] mx-auto'
                : 'w-full h-56 object-cover hover:scale-105 transition'
            }
          />
          {noticia.destacada && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
              <Star className="w-4 h-4" />
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Categoría */}
        {noticia.categoria_nombre && (
          <div
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={categoriaStyle}
          >
            {noticia.categoria_icono === 'Gift' ? '🎁' : '📰'}
            {noticia.categoria_nombre}
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: protonColors.purple[800] }}>
          {noticia.titulo}
        </h3>

        <p className="text-sm mb-4 line-clamp-3" style={{ color: protonColors.gray[600] }}>
          {noticia.descripcion}
        </p>

        {/* Meta */}
        <div
          className="flex items-center justify-between text-xs border-t pt-3"
          style={{
            color: protonColors.gray[500],
            borderColor: protonColors.purple[100],
          }}
        >
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" style={{ color: protonColors.purple[500] }} />
            {formatDate(noticia.fecha_publicacion || noticia.created_at)}
          </div>
          {noticia.total_vistas !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" style={{ color: protonColors.purple[500] }} />
              {noticia.total_vistas}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
