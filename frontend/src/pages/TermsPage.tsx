import { useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Ban,
  CreditCard,
  FileWarning,
  CheckCircle,
  MessageCircle,
  Phone,
} from "lucide-react";
import MobilePageHeader from "../components/MobilePageHeader";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";

const sectionsData = [
  {
    title: "Aceptación de Términos",
    icon: ShieldCheck,
    content: (
      <p className="text-gray-400 leading-relaxed">
        Al acceder y utilizar JJSecure VPN, confirmas que has leído, entendido y
        aceptas estos términos. Si no estás de acuerdo, no debes usar el
        servicio.
      </p>
    ),
  },
  {
    title: "Descripción del Servicio",
    icon: RefreshCw,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          JJSecure VPN es un servicio de proxy/VPN que te permite:
        </p>
        <ul className="space-y-2 text-gray-400">
          <li>• Navegar de forma más privada y segura</li>
          <li>• Acceder a contenido con restricciones geográficas</li>
          <li>• Proteger tu conexión en redes WiFi públicas</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Uso Responsable",
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          Te comprometes a usar el servicio de manera responsable y legal. Está
          prohibido usar el servicio para:
        </p>
        <ul className="space-y-2 text-gray-400">
          <li>• Actividades ilegales o maliciosas</li>
          <li>• Spam, phishing o distribución de malware</li>
          <li>• Ataques contra otros servicios o usuarios</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Limitaciones del Servicio",
    icon: FileWarning,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          El servicio se proporciona "tal como es", con las siguientes
          consideraciones:
        </p>
        <ul className="space-y-2 text-gray-400">
          <li>• Puede haber interrupciones ocasionales por mantenimiento</li>
          <li>• La velocidad puede variar según la congestión de la red</li>
          <li>• Nos reservamos el derecho de limitar conexiones simultáneas</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Responsabilidad y Garantías",
    icon: Ban,
    content: (
      <div className="space-y-4">
        <p className="text-gray-400">
          JJSecure VPN no se hace responsable de daños directos o indirectos
          derivados del uso del servicio. El usuario es el único responsable de
          sus actividades mientras usa el servicio.
        </p>
      </div>
    ),
  },
  {
    title: "Reembolso y Compra de Logins",
    icon: CreditCard,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-white font-medium mb-2">
              Política de reembolso:
            </p>
            <p className="text-gray-400 text-sm">
              Tendrás derecho al reembolso solamente si se comprueba que el
              problema está relacionado con nuestros servidores y no con
              bloqueos de las operadoras. Debes proporcionar pruebas del
              problema.
            </p>
          </div>

          <div>
            <p className="text-white font-medium mb-2">
              Congelamiento de planes:
            </p>
            <p className="text-gray-400 text-sm">
              En casos de bloqueos por parte de las operadoras, los planes se
              congelarán hasta que se encuentre un nuevo método funcional. Se
              reintegrarán todos los días restantes.
            </p>
          </div>

          <div>
            <p className="text-white font-medium mb-2">Importante:</p>
            <p className="text-gray-400 text-sm">
              No se realizarán reembolsos por bloqueos de operadoras o problemas
              de conectividad del usuario, pero los días pagados se preservarán
              mediante el sistema de congelamiento.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Modificaciones",
    icon: FileWarning,
    content: (
      <p className="text-gray-400 leading-relaxed">
        Nos reservamos el derecho de modificar estos términos en cualquier
        momento. Los cambios entrarán en vigor inmediatamente después de su
        publicación.
      </p>
    ),
  },
  {
    title: "Contacto y Soporte",
    icon: ShieldCheck,
    content: (
      <div className="space-y-3">
        <p className="text-gray-400">
          Para consultas o soporte, contáctanos por Telegram:
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

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState("aceptación-de-términos");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    {
      id: "aceptacion-de-terminos",
      label: "Aceptación",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "descripcion-del-servicio",
      label: "Descripción",
      icon: <RefreshCw className="w-4 h-4" />,
    },
    {
      id: "uso-responsable",
      label: "Uso Responsable",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: "limitaciones-del-servicio",
      label: "Limitaciones",
      icon: <Ban className="w-4 h-4" />,
    },
    {
      id: "responsabilidad-y-garantias",
      label: "Responsabilidad",
      icon: <FileWarning className="w-4 h-4" />,
    },
    {
      id: "reembolso-y-compra-de-logins",
      label: "Reembolso",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: "modificaciones",
      label: "Modificaciones",
      icon: <RefreshCw className="w-4 h-4" />,
    },
    {
      id: "contacto-y-soporte",
      label: "Contacto",
      icon: <MessageCircle className="w-4 h-4" />,
    },
  ];
  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Mobile Header */}
      <MobilePageHeader
        title="Términos y Condiciones"
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Sidebar */}
      <NavigationSidebar
        title="Términos y Condiciones"
        subtitle="Condiciones de uso"
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
                  Términos y Condiciones
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Términos de uso del servicio
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Al usar JJSecure VPN, aceptas los siguientes términos y
                condiciones. Te recomendamos leerlos detenidamente para entender
                tus derechos y responsabilidades.
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
                  ¿Tienes preguntas sobre los términos?
                </h2>
                <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
                  Nuestro equipo de soporte está disponible para aclarar
                  cualquier duda sobre nuestros términos de servicio.
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
        title="Términos y Condiciones"
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

export default TermsPage;
