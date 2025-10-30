import { User, Users } from "lucide-react";
import { useLatestUsers } from "../hooks/useLatestUsers";

export default function LatestUsersSection() {
  const { usuarios, loading, error } = useLatestUsers(10, 30000);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center">
            <p className="text-red-400 text-sm">
              Error cargando usuarios: {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header compacto */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs text-neutral-400">Usuarios Recientes</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Comunidad Activa
          </h2>

          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            Los usuarios más recientes que se unieron a nuestra plataforma
          </p>
        </div>

        {/* Grid de usuarios compacto */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="group bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 hover:bg-neutral-800/80 transition-all"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-neutral-700 border border-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold truncate">
                      {usuario.username}
                    </p>
                    <p className="text-xs text-neutral-500">Activo</p>
                  </div>
                </div>

                {/* Separador sutil */}
                <div className="h-px bg-neutral-700/50 mb-4" />

                {/* Límite de conexiones */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Conexiones</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400 tabular-nums">
                    {usuario.connection_limit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado vacío */}
        {usuarios.length === 0 && (
          <div className="text-center py-16">
            <User className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">
              No hay usuarios recientes
            </p>
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600 max-w-2xl mx-auto">
            * Los datos se actualizan automáticamente cada 30 segundos.
          </p>
        </div>
      </div>
    </section>
  );
}
