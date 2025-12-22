import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ChevronDown, 
  Clock, 
  Cpu, 
  HardDrive, 
  MapPin, 
  TrendingUp,
  Users,
  Wifi
} from "lucide-react";
import { useServerStats } from "../../../hooks/useServerStats";

type Server = ReturnType<typeof useServerStats>["servers"][number];

const getCountryFlag = (location: string) => {
  const loc = location.toLowerCase();
  if (loc.includes("arg")) return "🇦🇷";
  if (loc.includes("bra") || loc.includes("br")) return "🇧🇷";
  if (loc.includes("usa") || loc.includes("us")) return "🇺🇸";
  return "🌍";
};

const getStatusConfig = (value: number) => {
  if (value > 80) return { 
    label: "Alto", 
    color: "text-rose-600", 
    bg: "bg-rose-50", 
    border: "border-rose-200",
    bar: "bg-gradient-to-r from-rose-400 to-rose-500"
  };
  if (value > 60) return { 
    label: "Moderado", 
    color: "text-amber-600", 
    bg: "bg-amber-50", 
    border: "border-amber-200",
    bar: "bg-gradient-to-r from-amber-400 to-amber-500"
  };
  if (value > 40) return { 
    label: "Normal", 
    color: "text-blue-600", 
    bg: "bg-blue-50", 
    border: "border-blue-200",
    bar: "bg-gradient-to-r from-blue-400 to-blue-500"
  };
  return { 
    label: "Óptimo", 
    color: "text-emerald-600", 
    bg: "bg-emerald-50", 
    border: "border-emerald-200",
    bar: "bg-gradient-to-r from-emerald-400 to-emerald-500"
  };
};

const ServerCard = ({ 
  server, 
  isExpanded, 
  onToggle,
  index 
}: { 
  server: Server; 
  isExpanded: boolean; 
  onToggle: () => void;
  index: number;
}) => {
  const utilization = ((server.cpuUsage ?? 0) + (server.memoryUsage ?? 0)) / 2;
  const status = getStatusConfig(utilization);
  const isOnline = server.status === "online";
  const userPercentage = (server.totalUsuarios ?? 0) > 0 
    ? ((server.connectedUsers ?? 0) / (server.totalUsuarios ?? 1)) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div className={`
        bg-white rounded-2xl border transition-all duration-300
        ${isExpanded ? 'border-purple-200 shadow-lg shadow-purple-100/50' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}
      `}>
        {/* Header - Collapsible trigger */}
        <button
          onClick={onToggle}
          className="w-full p-4 sm:p-5 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Flag + Info */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Flag with status indicator */}
              <div className="relative flex-shrink-0">
                <span className="text-3xl sm:text-4xl">{getCountryFlag(server.location)}</span>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? "bg-emerald-500" : "bg-gray-400"
                }`} />
              </div>
              
              {/* Server info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                    {server.serverName}
                  </h3>
                  <span className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${status.bg} ${status.color} ${status.border} border
                  `}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {server.location}
                </p>
              </div>
            </div>

            {/* Right: Usage + Chevron */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <span className={`text-2xl font-bold ${status.color}`}>
                  {utilization.toFixed(0)}%
                </span>
                <p className="text-xs text-gray-400">carga</p>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`} 
              />
            </div>
          </div>

          {/* Quick stats bar - always visible */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "CPU", value: `${(server.cpuUsage ?? 0).toFixed(0)}%`, icon: Cpu },
              { label: "RAM", value: `${(server.memoryUsage ?? 0).toFixed(0)}%`, icon: HardDrive },
              { label: "Usuarios", value: `${server.connectedUsers ?? 0}`, icon: Users },
            ].map((stat) => (
              <div 
                key={stat.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
              >
                <stat.icon className="w-4 h-4 text-gray-400" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${status.bar} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${utilization}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-5 pb-5 border-t border-gray-100 pt-4">
                {/* Status badge */}
                <div className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4
                  ${isOnline ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600 border border-gray-200"}
                `}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                  {isOnline ? "Servidor en línea" : "Servidor desconectado"}
                </div>

                {/* User capacity bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Wifi className="w-4 h-4" />
                      Capacidad de usuarios
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {server.connectedUsers}/{server.totalUsuarios}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${userPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      label: "Última actualización", 
                      value: new Date(server.lastUpdate).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
                      icon: Clock
                    },
                    { 
                      label: "Tráfico de salida", 
                      value: `${(server.netSentMbps ?? 0).toFixed(1)} Mbps`,
                      icon: TrendingUp
                    },
                    { 
                      label: "Núcleos CPU", 
                      value: `${server.cpuCores} cores`,
                      icon: Cpu
                    },
                    { 
                      label: "Memoria total", 
                      value: `${server.totalMemoryGb} GB`,
                      icon: HardDrive
                    },
                  ].map((item) => (
                    <div 
                      key={item.label} 
                      className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                    >
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* High usage warning */}
                {((server.cpuUsage ?? 0) > 70 || (server.memoryUsage ?? 0) > 70) && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <Activity className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">Alto consumo detectado</p>
                      <p className="text-xs text-amber-600 mt-0.5">El servidor está experimentando una carga elevada</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-purple-600 uppercase mb-2">
                  Infraestructura
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-gray-900">
                  Estado de servidores
                </h2>
              </div>
              
              {/* Online counter badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-emerald-700">
                  {onlineCount} de {displayServers.length} activos
                </span>
              </div>
            </div>
          </motion.div>

          {/* Servers grid */}
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {displayServers.map((server, index) => (
              <ServerCard
                key={server.serverName}
                server={server}
                index={index}
                isExpanded={expandedServer === server.serverName}
                onToggle={() => setExpandedServer(expandedServer === server.serverName ? null : server.serverName)}
              />
            ))}
          </div>

          {/* Footer note */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-gray-400 font-medium">
              Los datos se actualizan automáticamente cada 6 segundos
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}