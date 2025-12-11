import { User, Users } from "lucide-react";
import { useLatestUsers } from "../../../hooks/useLatestUsers";

export function LatestUsers() {
  const { usuarios, loading, error } = useLatestUsers(10, 30000);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <p className="text-red-600/80 text-sm sm:text-base lg:text-lg xl:text-xl font-light">
                Error cargando usuarios: {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header minimalista */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-300 rounded-full mb-6">
              <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
              <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-light text-indigo-700 tracking-wide">
                USUARIOS RECIENTES
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 mb-4 tracking-tight">
              Comunidad Activa
            </h2>

            <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-light text-gray-600 max-w-md mx-auto leading-relaxed">
              Los usuarios más recientes que se unieron a nuestra plataforma
            </p>
          </div>

          {/* Grid de usuarios estilo Supabase */}
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-6 sm:gap-8 lg:gap-10 xl:gap-12 md:grid-cols-2">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="group bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 border border-indigo-200 rounded-xl p-6 sm:p-8 lg:p-10 xl:p-12 hover:border-indigo-400 hover:shadow-md transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-indigo-100 border border-indigo-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-indigo-600" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-light text-base sm:text-lg lg:text-xl xl:text-2xl truncate tracking-wide">
                        {usuario.username}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-light text-gray-600 tracking-wide">
                        Miembro activo
                      </p>
                    </div>
                  </div>

                  {/* Separador ultra fino */}
                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent mb-5" />

                  {/* Límite de conexiones */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-light tracking-wide">
                        Conexiones
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-indigo-600 tabular-nums tracking-tight">
                      {usuario.connection_limit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado vacío */}
          {usuarios.length === 0 && (
            <div className="text-center py-12 sm:py-16 lg:py-20 xl:py-24">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 text-gray-600" strokeWidth={1.5} />
              </div>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg xl:text-xl font-light tracking-wide">
                No hay usuarios recientes
              </p>
            </div>
          )}

          {/* Footer minimalista */}
          <div className="mt-12 sm:mt-16 lg:mt-20 xl:mt-24 text-center">
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-light text-gray-500 max-w-2xl mx-auto tracking-wide">
              Los datos se actualizan automáticamente cada 30 segundos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
