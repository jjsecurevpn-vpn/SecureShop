import { User, Users } from "lucide-react";
import { useLatestUsers } from "../hooks/useLatestUsers";

export default function LatestUsersSection() {
  const { usuarios, loading, error } = useLatestUsers(10, 30000);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center">
            <p className="text-red-400/80 text-sm font-light">
              Error cargando usuarios: {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header minimalista */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-6">
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-light text-emerald-400/90 tracking-wide">
              USUARIOS RECIENTES
            </span>
          </div>

          <h2 className="text-3xl font-light text-white mb-4 tracking-tight">
            Comunidad Activa
          </h2>

          <p className="text-sm font-light text-neutral-400/80 max-w-md mx-auto leading-relaxed">
            Los usuarios más recientes que se unieron a nuestra plataforma
          </p>
        </div>

        {/* Grid de usuarios estilo Supabase */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="group bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-6 hover:border-emerald-500/20 hover:bg-neutral-900/60 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-emerald-400/80" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-light text-base truncate tracking-wide">
                      {usuario.username}
                    </p>
                    <p className="text-xs font-light text-neutral-500/80 tracking-wide">
                      Miembro activo
                    </p>
                  </div>
                </div>

                {/* Separador ultra fino */}
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-800/50 to-transparent mb-5" />

                {/* Límite de conexiones */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-neutral-400/70">
                    <Users className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-xs font-light tracking-wide">
                      Conexiones
                    </span>
                  </div>
                  <div className="text-2xl font-light text-emerald-400/90 tabular-nums tracking-tight">
                    {usuario.connection_limit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado vacío */}
        {usuarios.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-neutral-900/40 border border-neutral-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-neutral-700/80" strokeWidth={1.5} />
            </div>
            <p className="text-neutral-500/70 text-sm font-light tracking-wide">
              No hay usuarios recientes
            </p>
          </div>
        )}

        {/* Footer minimalista */}
        <div className="mt-12 text-center">
          <p className="text-xs font-light text-neutral-600/60 max-w-2xl mx-auto tracking-wide">
            Los datos se actualizan automáticamente cada 30 segundos
          </p>
        </div>
      </div>
    </section>
  );
}