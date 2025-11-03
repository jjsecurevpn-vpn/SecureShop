import { useState } from "react";
import {
  ShieldCheck,
  Database,
  Lock,
  UserX,
  Eye,
  MessageCircle,
  Phone,
} from "lucide-react";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";

interface PrivacyPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const sectionsData = [
  {
    title: "Información que Recopilamos",
    icon: Database,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          Para el funcionamiento del servicio, recopilamos mínima información:
        </p>
        <ul className="space-y-2 text-gray-400">
          <li>• Device ID (removido automáticamente cada 24 horas)</li>
          <li>• Información básica de conexión para control de límites</li>
          <li>• Datos técnicos necesarios para el funcionamiento del proxy</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Uso de la Información",
    icon: Eye,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          La información recopilada se utiliza exclusivamente para:
        </p>
        <ul className="space-y-2 text-gray-400">
          <li>• Controlar límites de conexiones simultáneas</li>
          <li>• Mantener la estabilidad del servicio</li>
          <li>• Proveer soporte técnico cuando sea necesario</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Protección de Datos",
    icon: Lock,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          No almacenamos historial de navegación, contenido de comunicaciones ni
          datos personales identificables. Los datos temporales (como Device ID)
          se eliminan automáticamente de nuestros servidores cada 24 horas.
        </p>
      </div>
    ),
  },
  {
    title: "Compartir Información",
    icon: UserX,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          No vendemos, alquilamos ni compartimos tu información personal con
          terceros. Solo podríamos divulgar información si fuera requerido por
          ley y con orden judicial válida.
        </p>
      </div>
    ),
  },
  {
    title: "Tus Derechos",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">Como usuario, tienes derecho a:</p>
        <ul className="space-y-2 text-gray-400">
          <li>• Solicitar información sobre los datos que almacenamos</li>
          <li>• Pedir la eliminación de tus datos</li>
          <li>• Dejar de usar el servicio en cualquier momento</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Contacto",
    icon: MessageCircle,
    content: (
      <div className="space-y-3">
        <p className="text-gray-400">
          Para consultas sobre privacidad, contáctanos por Telegram:
        </p>
        <p className="text-gray-400">
          Soporte oficial:{" "}
          <a
            href="https://t.me/SoporteJHS_bot"
            className="text-purple-400 hover:text-purple-300 font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @SoporteJHS_bot
          </a>
        </p>
      </div>
    ),
  },
];

const PrivacyPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: PrivacyPageProps) => {
  const [activeSection, setActiveSection] = useState(
    "información-que-recopilamos"
  );

  const sections = [
    {
      id: "informacion-que-recopilamos",
      label: "Información",
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: "uso-de-la-informacion",
      label: "Uso de Datos",
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: "proteccion-de-datos",
      label: "Protección",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      id: "compartir-informacion",
      label: "Compartir",
      icon: <UserX className="w-4 h-4" />,
    },
    {
      id: "tus-derechos",
      label: "Tus Derechos",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "contacto",
      label: "Contacto",
      icon: <MessageCircle className="w-4 h-4" />,
    },
  ];
  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Sidebar */}
      <NavigationSidebar
        title="Política de Privacidad"
        subtitle="Tu privacidad importa"
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <main className="md:ml-[312px]">
        {/* Header */}
        <section className="relative pt-20 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 mb-6">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-neutral-400">
                  Política de Privacidad
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Tu privacidad es nuestra prioridad
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Entendemos la importancia de tu privacidad. Aquí te explicamos
                cómo recopilamos, usamos y protegemos tu información al utilizar
                JJSecure VPN.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="space-y-8">
              {sectionsData.map((section, index) => {
                const Icon = section.icon;
                const sectionId = section.title
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");
                return (
                  <div
                    key={section.title}
                    id={sectionId}
                    className={`group relative bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 hover:border-neutral-700 transition-all duration-300 scroll-mt-24 ${
                      activeSection === sectionId
                        ? "ring-2 ring-purple-400 bg-purple-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-medium text-purple-400/60">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h2 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                            {section.title}
                          </h2>
                        </div>
                        <div className="text-neutral-300 leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact CTA */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-purple-600/20 blur-3xl" />
              <div className="relative bg-neutral-900/80 border border-neutral-800 rounded-2xl p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Tienes preguntas sobre privacidad?
                </h2>
                <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
                  Nuestro equipo está disponible 24/7 para resolver cualquier
                  duda sobre cómo manejamos tus datos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://t.me/SoporteJHS_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-semibold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Soporte en Telegram
                  </a>
                  <a
                    href="https://wa.me/5493812531123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-neutral-700 text-neutral-300 px-8 py-4 rounded-xl hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-300 font-semibold"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-800 py-8">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <p className="text-neutral-500">
              © {new Date().getFullYear()} JJSecure VPN - Todos los derechos
              reservados
            </p>
          </div>
        </footer>
      </main>

      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Política de Privacidad"
        subtitle="Navega por las secciones"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 ${
              activeSection === section.id
                ? "bg-purple-600/10 border-l-4 border-purple-500"
                : "hover:bg-neutral-800"
            }`}
          >
            {section.icon}
            <div className="text-left">
              <div className="font-medium">{section.label}</div>
            </div>
          </button>
        ))}
      </BottomSheet>
    </div>
  );
};

export default PrivacyPage;
