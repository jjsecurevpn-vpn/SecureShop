import { Activity, Globe, TrendingUp } from "lucide-react";
import { useServerStats } from "../hooks/useServerStats";

export default function ServerStatsSection() {
  const { servers, totalUsers, onlineServers, loading } = useServerStats(10000);

  if (loading) {
    return null;
  }

  const getCountryFlag = (location: string) => {
    if (location.toLowerCase().includes("arg")) return "🇦🇷";
    if (location.toLowerCase().includes("bra")) return "🇧🇷";
    return "🌍";
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header compacto */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-neutral-400">Estado en Vivo</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Monitoreo en Tiempo Real
          </h2>

          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            Visualiza el estado de nuestros servidores y usuarios conectados
          </p>
        </div>

        {/* Estadísticas principales minimalistas */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Total usuarios */}
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Usuarios Activos
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white tabular-nums">
                  {totalUsers}
                </span>
                <span className="text-sm text-neutral-500">conectados</span>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>Actualizado en tiempo real</span>
              </div>
            </div>

            {/* Servidores online */}
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6 hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Servidores
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white tabular-nums">
                  {onlineServers}
                </span>
                <span className="text-sm text-neutral-500">
                  /{servers.length}
                </span>
              </div>

              <div className="mt-3 text-xs text-green-400 font-medium">
                Operativos
              </div>
            </div>
          </div>
        </div>

        {/* Grid de servidores compacto */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-3">
            {servers.map((server) => (
              <div
                key={server.serverName}
                className="group bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 hover:bg-neutral-800/80 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getCountryFlag(server.location)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">
                        {server.location}
                      </h3>
                      <p className="text-xs text-neutral-500 font-mono">
                        {server.serverName}
                      </p>
                    </div>
                  </div>

                  {/* Status badge compacto */}
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                      server.status === "online"
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        server.status === "online"
                          ? "bg-green-400 animate-pulse"
                          : "bg-red-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold uppercase ${
                        server.status === "online"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {server.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Separador sutil */}
                <div className="h-px bg-neutral-700/50 mb-4" />

                {/* Usuarios conectados */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      Usuarios activos
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400 tabular-nums">
                    {server.connectedUsers}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600 max-w-2xl mx-auto">
            * Los datos se actualizan automáticamente cada 10 segundos desde
            nuestro panel oficial.
          </p>
        </div>
      </div>
    </section>
  );
}
