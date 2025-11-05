import { useServerStats } from "../hooks/useServerStats";

export default function ServerStatsSection() {
  const { servers, totalUsers, onlineServers, loading } = useServerStats(10000);

  if (loading) {
    return null;
  }

  const getCountryFlag = (location: string) => {
    if (location.toLowerCase().includes("arg")) return "🇦🇷";
    if (location.toLowerCase().includes("bra")) return "🇧🇷";
    if (location.toLowerCase().includes("br")) return "🇧🇷";
    return "🌍";
  };

  const avgCpu = servers.length > 0
    ? (servers.reduce((sum, s) => sum + (s.cpuUsage || 0), 0) / servers.length).toFixed(1)
    : "0";

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Monitoreo Activo</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Infraestructura</h2>
          <p className="text-sm text-neutral-500">Estado de servidores en tiempo real</p>
        </div>

        {/* KPIs compactos */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-neutral-400 mb-1">Usuarios</div>
            <div className="text-xl font-bold text-white">{totalUsers.toLocaleString()}</div>
          </div>
          <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-neutral-400 mb-1">Servidores</div>
            <div className="text-xl font-bold text-white">{onlineServers}/{servers.length}</div>
          </div>
          <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-xs text-neutral-400 mb-1">CPU Promedio</div>
            <div className="text-xl font-bold text-white">{avgCpu}%</div>
          </div>
        </div>

        {/* Servidores */}
        <div className="space-y-2.5">
          {servers.map((server) => (
            <div
              key={server.serverName}
              className="group bg-neutral-800/30 border border-neutral-700/20 rounded-xl p-4 hover:border-neutral-600/50 hover:bg-neutral-800/50 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                {/* Left: Server Info */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        server.status === "online"
                          ? "bg-green-500 animate-pulse"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="text-lg">
                    {getCountryFlag(server.location)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {server.serverName}
                    </div>
                    <div className="text-xs text-neutral-500">{server.location}</div>
                  </div>
                </div>

                {/* Center: Metrics */}
                <div className="hidden sm:flex items-center gap-4 mx-4 text-xs flex-1 justify-between">
                  <div className="text-center">
                    <div className="text-neutral-400 mb-0.5">CPU</div>
                    <div className="text-sm font-bold text-white">
                      {(server.cpuUsage || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-neutral-400 mb-0.5">RAM</div>
                    <div className="text-sm font-bold text-white">
                      {(server.memoryUsage || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-neutral-400 mb-0.5">Usuarios</div>
                    <div className="text-sm font-bold text-white">
                      {server.connectedUsers}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-neutral-400 mb-0.5">Total</div>
                    <div className="text-sm font-bold text-green-400">
                      {server.totalUsuarios || 0}
                    </div>
                  </div>
                </div>

                {/* Right: Status Badge */}
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${
                      server.status === "online"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {server.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Mobile metrics */}
              <div className="sm:hidden grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-neutral-700/20">
                <div className="text-center text-xs">
                  <div className="text-neutral-500 mb-0.5">CPU</div>
                  <div className="text-sm font-bold text-white">
                    {(server.cpuUsage || 0).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center text-xs">
                  <div className="text-neutral-500 mb-0.5">RAM</div>
                  <div className="text-sm font-bold text-white">
                    {(server.memoryUsage || 0).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center text-xs">
                  <div className="text-neutral-500 mb-0.5">Users</div>
                  <div className="text-sm font-bold text-white">
                    {server.connectedUsers}
                  </div>
                </div>
                <div className="text-center text-xs">
                  <div className="text-neutral-500 mb-0.5">Total</div>
                  <div className="text-sm font-bold text-green-400">
                    {server.totalUsuarios || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-600">
            Datos actualizados en tiempo real desde JJSecure Panel
          </p>
        </div>
      </div>
    </section>
  );
}
