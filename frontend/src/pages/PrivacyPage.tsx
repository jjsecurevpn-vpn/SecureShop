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
        <p className="text-gray-700">
          Para el funcionamiento del servicio, recopilamos mínima información:
        </p>
        <ul className="space-y-2 text-gray-700">
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
        <p className="text-gray-700">
          La información recopilada se utiliza exclusivamente para:
        </p>
        <ul className="space-y-2 text-gray-700">
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
        <p className="text-gray-700">
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
        <p className="text-gray-700">
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
        <p className="text-gray-700">Como usuario, tienes derecho a:</p>
        <ul className="space-y-2 text-gray-700">
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
        <p className="text-gray-700">
          Para consultas sobre privacidad, contáctanos por Telegram:
        </p>
        <p className="text-gray-700">
          Soporte oficial:{" "}
          <a
            href="https://t.me/SoporteJHS_bot"
            className="text-indigo-600 hover:text-indigo-700 font-medium underline"
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
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="md:ml-14">
        {/* Header */}
        <section className="relative pt-12 sm:pt-16 lg:pt-20 xl:pt-24 pb-12 sm:pb-16 lg:pb-20 xl:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-purple-50/30 to-white" />
          <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 mb-6">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-700">
                  Política de Privacidad
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
                Tu privacidad es nuestra prioridad
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 leading-relaxed">
                Entendemos la importancia de tu privacidad. Aquí te explicamos
                cómo recopilamos, usamos y protegemos tu información al utilizar
                JJSecure VPN.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
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
                    className={`group relative bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 rounded-lg p-8 transition-all duration-300 scroll-mt-24`}
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-medium text-indigo-600">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {section.title}
                          </h2>
                        </div>
                        <div className="text-gray-700 leading-relaxed">
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 via-indigo-100/20 to-purple-200/30 blur-2xl" />
              <div className="relative bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 rounded-lg p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-white/70 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                  ¿Tienes preguntas sobre privacidad?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-8">
                  Nuestro equipo está disponible 24/7 para resolver cualquier
                  duda sobre cómo manejamos tus datos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://t.me/SoporteJHS_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-300/30 transition-all duration-300 font-semibold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Soporte en Telegram
                  </a>
                  <a
                    href="https://wa.me/5493812531123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-indigo-700 px-8 py-4 rounded-xl hover:bg-indigo-100/50 transition-all duration-300 font-semibold"
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
        <footer className="py-6 sm:py-8 lg:py-10 xl:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
            <p className="text-gray-600">
              © {new Date().getFullYear()} JJSecure VPN - Todos los derechos
              reservados
            </p>
          </div>
        </footer>
      </main>

      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-indigo-100/50 text-indigo-700"
                  : "text-gray-600 hover:bg-indigo-50"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default PrivacyPage;
