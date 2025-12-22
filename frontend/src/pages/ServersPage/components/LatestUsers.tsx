import { motion } from "framer-motion";
import { Clock, Sparkles, User, Users, Wifi } from "lucide-react";
import { useLatestUsers } from "../../../hooks/useLatestUsers";

export function LatestUsers() {
  const { usuarios, loading, error } = useLatestUsers(10, 30000);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <p className="text-rose-500 text-sm font-medium">
                Error cargando usuarios: {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-10 sm:mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                Comunidad
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-gray-900 mb-3">
              Usuarios recientes
            </h2>

            <p className="text-gray-500 text-base max-w-md mx-auto">
              Los miembros más recientes que se unieron a nuestra red
            </p>
          </motion.div>

          {/* Users Grid */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {usuarios.map((usuario, index) => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30 transition-all duration-300">
                  {/* Header with avatar and name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <User className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-semibold text-base truncate">
                        {usuario.username}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Miembro activo
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Wifi className="w-4 h-4" />
                      <span className="text-sm font-medium">Conexiones</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-purple-600">
                        {usuario.connection_limit}
                      </span>
                      <span className="text-xs text-gray-400">max</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {usuarios.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-gray-500 font-medium">No hay usuarios recientes</p>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-gray-400 font-medium">
              Actualización automática cada 30 segundos
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
