import { useEffect, useRef, useState, useMemo } from "react";
import { BarChart2, Cpu, Gauge, MapPin, ChevronDown } from "lucide-react";
import { useServerStats } from "../../../hooks/useServerStats";

type Server = ReturnType<typeof useServerStats>["servers"][number];

const getCountryFlag = (location: string) => {
  const loc = location.toLowerCase();
  if (loc.includes("arg")) return "🇦🇷";
  if (loc.includes("bra") || loc.includes("br")) return "🇧🇷";
  if (loc.includes("usa") || loc.includes("us")) return "🇺🇸";
  return "🌍";
};

const getUtilizationColor = (value: number) => {
  if (value > 80) return { text: "text-red-500", bar: "bg-red-500", bg: "bg-red-50" };
  if (value > 60) return { text: "text-amber-500", bar: "bg-amber-500", bg: "bg-amber-50" };
  if (value > 40) return { text: "text-blue-500", bar: "bg-blue-500", bg: "bg-blue-50" };
  return { text: "text-green-500", bar: "bg-green-500", bg: "bg-green-50" };
};

const ServerCard = ({ server, isExpanded, onToggle }: { server: Server; isExpanded: boolean; onToggle: () => void }) => {
  const utilization = ((server.cpuUsage ?? 0) + (server.memoryUsage ?? 0)) / 2;
  const colors = getUtilizationColor(utilization);
  const isOnline = server.status === "online";

  return (
    <div className="w-full rounded-xl sm:rounded-2xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-sm text-white overflow-hidden shadow-xl">
      {/* HEADER - siempre visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-5 lg:p-6 text-left hover:bg-slate-800/50 transition-all duration-300"
      >
        <div className="flex flex-col gap-4">
          {/* Primera fila: bandera + nombre + ubicación + chevron */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <span className="text-3xl sm:text-4xl flex-shrink-0">{getCountryFlag(server.location)}</span>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg sm:text-xl truncate">{server.serverName}</h3>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
                </div>
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4" />
                  {server.location}
                </p>
              </div>
            </div>

            <ChevronDown 
              className={`w-6 h-6 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} 
            />
          </div>

          {/* Segunda fila: barra de utilización + porcentaje grande (centrado en móvil) */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 whitespace-nowrap">Carga media</span>
                <div className="flex-1 h-3 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} transition-all duration-700 rounded-full`}
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>
            </div>
            <span className={`text-2xl sm:text-3xl font-bold ${colors.text} min-w-[60px] text-right`}>
              {utilization.toFixed(0)}%
            </span>
          </div>

          {/* Tercera fila: métricas rápidas (3 columnas, centradas en móvil) */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">CPU</p>
              <p className={`text-lg font-bold ${colors.text}`}>{(server.cpuUsage ?? 0).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">RAM</p>
              <p className={`text-lg font-bold ${colors.text}`}>{(server.memoryUsage ?? 0).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Usuarios</p>
              <p className="text-lg font-bold text-white">
                {server.connectedUsers ?? 0}<span className="text-gray-500">/{server.totalUsuarios ?? 0}</span>
              </p>
            </div>
          </div>
        </div>
      </button>

      {/* CONTENIDO EXPANDIDO */}
      {isExpanded && (
        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 border-t border-slate-700/50 pt-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-400">
          {/* Badge de estado */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isOnline 
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
              : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
            {isOnline ? "En línea" : "Desconectado"}
          </div>

          {/* Indicadores circulares grandes */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: server.cpuUsage ?? 0, label: "CPU", icon: Cpu },
              { value: server.memoryUsage ?? 0, label: "RAM", icon: Gauge },
            ].map((metric) => {
              const metricColors = getUtilizationColor(metric.value);
              const circumference = 2 * Math.PI * 50;
              const offset = circumference - (metric.value / 100) * circumference;

              return (
                <div key={metric.label} className="flex flex-col items-center">
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                      <circle
                        cx="50%" cy="50%" r="50"
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`transition-all duration-1000 ${metricColors.bar.replace("bg-", "stroke-")}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl font-bold text-white">{metric.value.toFixed(0)}</span>
                      <span className="text-3xl text-gray-400">%</span>
                    </div>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-gray-300">{metric.label}</p>
                </div>
              );
            })}
          </div>

          {/* Barra de usuarios conectados */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Usuarios conectados</span>
              <span className="font-bold text-white">{server.connectedUsers}/{server.totalUsuarios}</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-700"
                style={{ width: `${(server.totalUsuarios ?? 0) > 0 ? ((server.connectedUsers ?? 0) / (server.totalUsuarios ?? 1)) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Grid de detalles */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Última actualización", value: new Date(server.lastUpdate).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) },
              { label: "Tráfico ↑", value: `${(server.netSentMbps ?? 0).toFixed(1)} Mbps` },
              { label: "Núcleos CPU", value: `${server.cpuCores} cores` },
              { label: "RAM total", value: `${server.totalMemoryGb} GB` },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs sm:text-sm text-gray-400">{item.label}</p>
                <p className="text-lg sm:text-xl font-bold text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Alerta de alto uso */}
          {((server.cpuUsage ?? 0) > 70 || (server.memoryUsage ?? 0) > 70) && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-5 flex gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <p className="font-bold text-amber-300">Alto consumo de recursos</p>
                <p className="text-sm text-amber-200 mt-1">Considera redistribuir carga o escalar el servidor</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function ServerStats() {
  const { servers, loading } = useServerStats(6000);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [displayServers, setDisplayServers] = useState<Server[]>([]);
  const displayServersRef = useRef<Server[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    displayServersRef.current = displayServers;
  }, [displayServers]);

  useEffect(() => {
    if (!servers.length) {
      setDisplayServers([]);
      return;
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const startSnapshot = displayServersRef.current.length ? displayServersRef.current : servers;
    const startMap = new Map(startSnapshot.map((s) => [s.serverName, s]));
    const startTime = performance.now();
    const duration = 650;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = easeOutCubic(Math.min(elapsed / duration, 1));

      const next = servers.map((server) => {
        const baseline = startMap.get(server.serverName) ?? server;
        return {
          ...server,
          cpuUsage: (baseline.cpuUsage ?? 0) + ((server.cpuUsage ?? 0) - (baseline.cpuUsage ?? 0)) * progress,
          memoryUsage:
            (baseline.memoryUsage ?? 0) +
            ((server.memoryUsage ?? 0) - (baseline.memoryUsage ?? 0)) * progress,
        };
      });

      setDisplayServers(next);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayServers(servers);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [servers]);

  const onlineCount = useMemo(
    () => displayServers.filter((s) => s.status === "online").length,
    [displayServers]
  );

  if (loading || !displayServers.length) return null;

  return (
    <section className="bg-indigo-950 py-4 sm:py-8 lg:py-12 xl:py-16 rounded-2xl sm:rounded-[3rem]">
      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 lg:mb-12 xl:mb-16">
            <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-semibold text-blue-400 uppercase tracking-widest">
                  Monitoreo
                </p>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-light text-white mt-1 sm:mt-2">
                  <span className="font-semibold text-green-400">{onlineCount}</span>
                  <span className="text-gray-300"> de </span>
                  <span className="font-semibold text-green-400">{displayServers.length}</span>
                  <span className="text-gray-300"> servidores activos</span>
                </p>
              </div>
            </div>
          </div>

          {/* Servers list */}
          <div className="space-y-2 sm:space-y-3">
            {displayServers.map((server) => (
              <ServerCard
                key={server.serverName}
                server={server}
                isExpanded={expandedServer === server.serverName}
                onToggle={() => setExpandedServer(expandedServer === server.serverName ? null : server.serverName)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 sm:mt-12 lg:mt-16 xl:mt-20 pt-4 sm:pt-6 lg:pt-8 xl:pt-10 border-t border-slate-700 text-center">
            <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-400 font-light">
              Actualización en tiempo real • JJSecure Panel
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}