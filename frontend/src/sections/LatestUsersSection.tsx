import { User } from 'lucide-react';
import { useLatestUsers } from '../hooks/useLatestUsers';

export default function LatestUsersSection() {
  const { usuarios, loading, error } = useLatestUsers(10, 30000);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-400 text-sm sm:text-base">Error cargando usuarios: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Últimos Usuarios
            </h2>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Los usuarios más recientes en la plataforma
          </p>
        </div>

        {/* Grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="group relative p-4 sm:p-5 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-blue-500/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer"
            >
              {/* Fondo de gradiente hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative">
                {/* Avatar y Usuario */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">
                      {usuario.username}
                    </p>
                    <p className="text-xs text-gray-500">Activo</p>
                  </div>
                </div>

                {/* Límite de conexiones */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                  <p className="text-xs text-gray-500">Conexiones</p>
                  <p className="text-base sm:text-lg font-semibold text-blue-400">
                    {usuario.connection_limit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {usuarios.length === 0 && (
          <div className="text-center py-16">
            <User className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay usuarios recientes</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800/50">
          <p className="text-xs text-gray-600 text-center">
            Se actualiza automáticamente cada 30 segundos
          </p>
        </div>
      </div>
    </section>
  );
}
