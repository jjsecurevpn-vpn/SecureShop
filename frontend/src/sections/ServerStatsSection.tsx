import { useEffect, useRef, useState, useId } from "react";
import { Activity, Zap, HardDrive } from "lucide-react";
import { useServerStats } from "../hooks/useServerStats";

type Server = ReturnType<typeof useServerStats>["servers"][number];

export default function ServerStatsSection() {
  const { servers, totalUsers, onlineServers, loading } = useServerStats(6000);
  const [displayServers, setDisplayServers] = useState<Server[]>([]);
  const displayServersRef = useRef<Server[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    displayServersRef.current = displayServers;
  }, [displayServers]);

  useEffect(() => {
    if (!servers.length) {
      setDisplayServers([]);
      displayServersRef.current = [];
      return;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startSnapshot = displayServersRef.current.length
      ? displayServersRef.current
      : servers;

    const startMap = new Map(startSnapshot.map((server) => [server.serverName, server]));
    const startTime = performance.now();
    const duration = 650;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const easedProgress = easeOutCubic(Math.min(elapsed / duration, 1));

      const next = servers.map((server) => {
        const baseline = startMap.get(server.serverName) ?? server;
        const fromCpu = baseline.cpuUsage ?? 0;
        const toCpu = server.cpuUsage ?? 0;
        const fromMemory = baseline.memoryUsage ?? 0;
        const toMemory = server.memoryUsage ?? 0;

        return {
          ...server,
          cpuUsage: fromCpu + (toCpu - fromCpu) * easedProgress,
          memoryUsage: fromMemory + (toMemory - fromMemory) * easedProgress,
        };
      });

      setDisplayServers(next);

      if (easedProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayServers(servers);
        displayServersRef.current = servers;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [servers]);

  if (loading || !displayServers.length) {
    return null;
  }

  const getCountryFlag = (location: string) => {
    if (location.toLowerCase().includes("arg")) return "🇦🇷";
    if (location.toLowerCase().includes("bra")) return "🇧🇷";
    if (location.toLowerCase().includes("br")) return "🇧🇷";
    return "🌍";
  };

  const getGradientColors = (value: number) => {
    if (value >= 85) {
      return { start: "#f472b6", end: "#fb7185" };
    }
    if (value >= 60) {
      return { start: "#d8b4fe", end: "#c084fc" };
    }
    return { start: "#c084fc", end: "#a78bfa" };
  };

  const CircularProgress = ({ value, label, icon: Icon }: { value: number; label: string; icon: any }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 100) * circumference;
    const gradientId = useId();
    const gradient = getGradientColors(value);

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-neutral-700"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke={`url(#${gradientId})`}
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 120ms linear" }}
            />
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradient.start} />
                <stop offset="100%" stopColor={gradient.end} />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className="w-5 h-5 text-violet-300 mb-0.5" />
            <div className="text-lg font-bold text-white">{value.toFixed(0)}%</div>
          </div>
        </div>
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
      </div>
    );
  };

  const renderedServers = displayServers.length ? displayServers : servers;

  if (loading || !renderedServers.length) {
    return null;
  }

  const displayedTotalUsers = totalUsers ?? renderedServers.reduce(
    (sum, server) => sum + (server.totalUsuarios ?? 0),
    0
  );

  const displayedOnlineServers = onlineServers ?? renderedServers.filter(
    (server) => server.status === "online"
  ).length;

  const avgCpu = renderedServers.length > 0
    ? (
        renderedServers.reduce((sum, s) => sum + (s.cpuUsage || 0), 0) /
        renderedServers.length
      ).toFixed(1)
    : "0";

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full" />
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-[2px]">
              Monitoreo Infraestructura
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Estado de Servidores</h1>
          <p className="text-sm text-neutral-500">Visualización en tiempo real del rendimiento de infraestructura</p>
        </div>



        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Usuarios Totales",
              value: displayedTotalUsers.toLocaleString(),
              icon: Activity,
            },
            { label: "CPU Promedio", value: `${avgCpu}%`, icon: Zap },
            {
              label: "Servidores Online",
              value: `${displayedOnlineServers}/${renderedServers.length}`,
              icon: HardDrive,
            },
          ].map((kpi, i) => (
            <div key={i} className="bg-neutral-900/60 border border-neutral-800/60 rounded-lg p-5 hover:border-violet-500/30 transition-colors duration-200 group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                  <kpi.icon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wide font-medium">{kpi.label}</div>
                  <div className="text-2xl font-bold text-white">{kpi.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Servidores Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderedServers.map((server) => {
            const isSaturated = (server.cpuUsage ?? 0) > 70 || (server.memoryUsage ?? 0) > 70;
            return (
            <div
              key={server.serverName}
              className={`group relative overflow-visible rounded-xl border bg-neutral-900/50 hover:transition-colors duration-200 p-6 ${
                isSaturated 
                  ? "border-rose-500 hover:border-rose-400" 
                  : "border-neutral-800/60 hover:border-violet-500/30"
              }`}
            >
              {/* Etiqueta SATURADO - Posicionada en el borde */}
              {isSaturated && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold whitespace-nowrap shadow-lg">
                    ⚠️ SATURADO
                  </div>
                </div>
              )}
              
              <div className="relative z-10 pt-2">
                {/* Server Header */}
                <div className="mb-6 pb-6 border-b border-neutral-800/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800/50">
                        <span className="text-xl">{getCountryFlag(server.location)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{server.serverName}</h3>
                        <p className="text-xs text-neutral-500">{server.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${server.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                      <span className={`text-xs font-semibold ${server.status === "online" ? "text-green-400" : "text-red-400"}`}>
                        {server.status === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Circles */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <CircularProgress value={server.cpuUsage || 0} label="CPU" icon={Zap} />
                  <CircularProgress value={server.memoryUsage || 0} label="RAM" icon={HardDrive} />
                </div>

                {/* Stats Footer */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-800/30">
                  <div className="bg-neutral-800/20 rounded-lg p-3 hover:bg-neutral-800/40 transition-colors duration-200">
                    <p className="text-xs text-neutral-500 mb-1">Usuarios Conectados</p>
                    <p className="text-xl font-bold text-white">{server.connectedUsers}</p>
                  </div>
                  <div className="bg-violet-500/10 rounded-lg p-3 hover:bg-violet-500/20 transition-colors duration-200 border border-violet-500/10">
                    <p className="text-xs text-neutral-500 mb-1">Total Registrados</p>
                    <p className="text-xl font-bold text-violet-300">{server.totalUsuarios || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-neutral-800/30 text-center">
          <p className="text-xs text-neutral-600">
            Actualización en tiempo real • JJSecure Panel
          </p>
        </div>
      </div>
    </section>
  );
}
