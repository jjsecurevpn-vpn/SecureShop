import { MessageCircle, Shield, Signal, Users } from "lucide-react";
import { PlanStatsConfig } from "../types";

interface HeroSectionProps {
  config?: PlanStatsConfig | null;
  totalUsers: number;
  onlineServers: number;
}

export function HeroSection({ config, totalUsers, onlineServers }: HeroSectionProps) {
  const stats = [
    { value: "99.9%", label: "Uptime", icon: Signal },
    { value: "24/7", label: "Soporte", icon: MessageCircle },
    { value: totalUsers > 0 ? `${totalUsers}+` : "—", label: "Usuarios", icon: Users },
    { value: onlineServers > 0 ? onlineServers.toString() : "—", label: "Servidores", icon: Shield },
  ];

  return (
    <section className="pt-6 pb-16 md:pt-16 md:pb-20 border-b border-neutral-800">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        {config?.promocion?.habilitada && config.promocion.texto && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-3 py-1.5 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              {config.promocion.texto}
            </div>
          </div>
        )}

        <h1 className="text-5xl md:text-6xl font-bold text-neutral-50 mb-4">
          {config?.titulo || "Planes VPN Premium"}
        </h1>

        <p className="text-lg text-neutral-400 mb-12 max-w-2xl">
          {config?.descripcion || "Conecta de forma segura y privada. Elige el plan perfecto para ti."}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-4 h-4 text-neutral-400" />
                  <span className="text-2xl font-bold text-neutral-50">{stat.value}</span>
                </div>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
