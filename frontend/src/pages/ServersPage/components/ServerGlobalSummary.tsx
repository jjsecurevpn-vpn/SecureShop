import { Crown, Cpu, Gauge, Users } from "lucide-react";
import { useMemo } from "react";
import { useServerStats } from "../../../hooks/useServerStats";

const numberFormatter = new Intl.NumberFormat("es-AR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentageFormatter = (value: number) => `${value.toFixed(1)}%`;

const FREE_SERVER_IDS = new Set([557]);
const FREE_TIER_PATTERN = /free|gratuito|gratis|demo|test|beta|trial/i;

const isFreeTierServer = (server?: {
  serverId?: number;
  serverName?: string;
  location?: string;
}) => {
  if (!server) return false;

  if (server.serverId && FREE_SERVER_IDS.has(server.serverId)) {
    return true;
  }

  if (server.serverName && FREE_TIER_PATTERN.test(server.serverName)) {
    return true;
  }

  if (server.location && /free|gratis|gratuito|demo|test|global/i.test(server.location)) {
    return true;
  }

  return false;
};

export function ServerGlobalSummary() {
  const { servers, totalUsers, onlineServers, loading } = useServerStats(9000);

  const summary = useMemo(() => {
    if (!servers.length) {
      return {
        premiumUsers: 0,
        freeUsers: 0,
        globalCpu: 0,
        globalRam: 0,
      };
    }

    let premiumUsers = 0;
    let freeUsers = 0;
    let cpuAccumulator = 0;
    let memoryAccumulator = 0;
    let cpuSamples = 0;
    let memorySamples = 0;

    servers.forEach((server) => {
      const realTimeUsers = server.connectedUsers ?? 0;
      const fallbackUsers = server.totalUsuarios ?? realTimeUsers;
      const usersToCount = server.status === "online" ? realTimeUsers : fallbackUsers;

      if (isFreeTierServer(server)) {
        freeUsers += usersToCount;
      } else {
        premiumUsers += usersToCount;
      }

      if (typeof server.cpuUsage === "number") {
        cpuAccumulator += server.cpuUsage;
        cpuSamples += 1;
      }

      if (typeof server.memoryUsage === "number") {
        memoryAccumulator += server.memoryUsage;
        memorySamples += 1;
      }
    });

    return {
      premiumUsers,
      freeUsers,
      globalCpu: cpuSamples ? cpuAccumulator / cpuSamples : 0,
      globalRam: memorySamples ? memoryAccumulator / memorySamples : 0,
    };
  }, [servers]);

  if (loading && !servers.length) {
    return null;
  }

  const cards = [
    {
      label: "Usuarios Premium",
      value: numberFormatter.format(summary.premiumUsers || totalUsers || 0),
      icon: Crown,
      accent: "text-amber-300",
    },
    {
      label: "Usuarios Gratuitos",
      value: numberFormatter.format(summary.freeUsers),
      icon: Users,
      accent: "text-sky-300",
    },
    {
      label: "CPU Global",
      value: percentageFormatter(summary.globalCpu),
      icon: Cpu,
      accent: "text-emerald-300",
    },
    {
      label: "RAM Global",
      value: percentageFormatter(summary.globalRam),
      icon: Gauge,
      accent: "text-violet-300",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 xl:gap-12 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold tracking-[0.3em] text-gray-600 uppercase">
                  Resumen Global
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-normal text-gray-900 mt-2">
                  Visión instantánea de la red
                </h2>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 mt-2">
                  {onlineServers || 0} servidores online • {numberFormatter.format(totalUsers || summary.premiumUsers + summary.freeUsers)} usuarios monitorizados en tiempo real
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 lg:gap-8 xl:gap-10 sm:grid-cols-2">
                {cards.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-indigo-200 bg-white px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8 xl:py-10 shadow-sm shadow-gray-100"
                  >
                    <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-wide">
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-indigo-600`} />
                      {label}
                    </div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 mt-3">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
