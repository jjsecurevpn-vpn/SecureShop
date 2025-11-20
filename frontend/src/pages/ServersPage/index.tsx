import { useState } from "react";
import { BarChart3, Users } from "lucide-react";
import { ServerStats } from "./components/ServerStats";
import { LatestUsers } from "./components/LatestUsers";
import { ServersHero } from "./components/ServersHero";
import BottomSheet from "../../components/BottomSheet";
import type { ServersPageProps } from "./types";
import { ServerGlobalSummary } from "./components/ServerGlobalSummary";

const ServersPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: ServersPageProps) => {
  const [activeSection, setActiveSection] = useState("server-stats");

  const serversSections = [
    {
      id: "server-stats",
      label: "Estadísticas",
      subtitle: "Servidores en tiempo real",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "latest-users",
      label: "Usuarios",
      subtitle: "Últimos registrados",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Mobile Bottom Sheet Navigation */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {serversSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document
                    .getElementById(`section-${section.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-violet-900/20 text-violet-300"
                  : "text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Main Content */}
      <main className="md:ml-14">
        <ServersHero />
        <ServerGlobalSummary />
        {/* Server Stats */}
        <div id="section-server-stats">
          <ServerStats />
        </div>

        {/* Latest Users */}
        <div id="section-latest-users">
          <LatestUsers />
        </div>
      </main>
    </div>
  );
};

export default ServersPage;
export type { ServersPageProps };
