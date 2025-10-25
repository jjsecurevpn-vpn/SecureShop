import { Activity, Globe, TrendingUp, Zap } from 'lucide-react';
import { useServerStats } from '../hooks/useServerStats';

export default function ServerStatsSection() {
  const { servers, totalUsers, onlineServers, loading } = useServerStats(10000);

  if (loading) {
    return null;
  }

  const getCountryFlag = (location: string) => {
    if (location.toLowerCase().includes('arg')) return '🇦🇷';
    if (location.toLowerCase().includes('bra')) return '🇧🇷';
    return '🌍';
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header minimalista */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6 animate-pulse">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Estado en Vivo</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Monitoreo en Tiempo Real
          </h2>
          
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Visualiza el estado de nuestros servidores y usuarios conectados al instante
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Total usuarios */}
            <div className="sm:col-span-2 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent border border-purple-500/20 rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300 uppercase tracking-wide">
                    Usuarios Activos
                  </span>
                </div>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-bold text-white tabular-nums">
                    {totalUsers}
                  </span>
                  <span className="text-gray-400 text-lg">conectados</span>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Actualizado en tiempo real</span>
                </div>
              </div>
            </div>

            {/* Servidores online */}
            <div className="bg-gradient-to-br from-green-500/10 via-green-600/5 to-transparent border border-green-500/20 rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-300 uppercase tracking-wide">
                    Servidores
                  </span>
                </div>
                
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-bold text-white tabular-nums">
                  {onlineServers}
                </span>
                <span className="text-gray-400 text-lg">/{servers.length}</span>
              </div>                <div className="mt-4 text-sm text-green-400 font-medium">
                  Operativos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de servidores - Diseño limpio */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {servers.map((server, index) => (
              <div
                key={server.serverName}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-6 sm:p-8 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Efecto glow en hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{getCountryFlag(server.location)}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                          {server.location}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">
                          {server.serverName}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                      server.status === 'online' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        server.status === 'online' 
                          ? 'bg-green-400 animate-pulse' 
                          : 'bg-red-400'
                      }`} />
                      <span className={`text-xs font-semibold uppercase tracking-wide ${
                        server.status === 'online' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {server.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-6" />

                  {/* Usuarios conectados */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">Usuarios activos</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-purple-400 tabular-nums">
                      {server.connectedUsers}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer con disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
            * Los datos mostrados representan usuarios conectados a través de nuestro panel oficial.
            La información se actualiza automáticamente cada 10 segundos.
          </p>
        </div>
      </div>
    </section>
  );
}
