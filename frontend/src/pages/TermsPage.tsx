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
import BottomSheet from "../components/BottomSheet";
import { Title } from "../components/Title";

interface TermsPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const sectionsData = [
  {
    title: "Aceptación de Términos",
    icon: ShieldCheck,
    content: (
      <p className="text-gray-700 leading-relaxed">
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
        <p className="text-gray-700">
          JJSecure VPN es un servicio de proxy/VPN que te permite:
        </p>
        <ul className="space-y-2 text-gray-700">
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
        <p className="text-gray-700">
          Te comprometes a usar el servicio de manera responsable y legal. Está
          prohibido usar el servicio para:
        </p>
        <ul className="space-y-2 text-gray-700">
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
        <p className="text-gray-700">
          El servicio se proporciona "tal como es", con las siguientes
          consideraciones:
        </p>
        <ul className="space-y-2 text-gray-700">
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
        <p className="text-gray-700">
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
            <p className="text-gray-900 font-medium mb-2">
              Política de reembolso:
            </p>
            <p className="text-gray-700 text-sm">
              Tendrás derecho al reembolso solamente si se comprueba que el
              problema está relacionado con nuestros servidores y no con
              bloqueos de las operadoras. Debes proporcionar pruebas del
              problema.
            </p>
          </div>

          <div>
            <p className="text-gray-900 font-medium mb-2">
              Congelamiento de planes:
            </p>
            <p className="text-gray-700 text-sm">
              En casos de bloqueos por parte de las operadoras, los planes se
              congelarán hasta que se encuentre un nuevo método funcional. Se
              reintegrarán todos los días restantes.
            </p>
          </div>

          <div>
            <p className="text-gray-900 font-medium mb-2">Importante:</p>
            <p className="text-gray-700 text-sm">
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
      <p className="text-gray-700 leading-relaxed">
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
        <p className="text-gray-700">
          Para consultas o soporte, contáctanos por Telegram:
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

const TermsPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: TermsPageProps) => {
  const [activeSection, setActiveSection] = useState("aceptacion-de-terminos");

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
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main>
        {/* Header */}
        <section className="relative pt-12 sm:pt-16 lg:pt-20 xl:pt-24 pb-12 sm:pb-16 lg:pb-20 xl:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-purple-50/30 to-white" />
          <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 mb-6">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-700">
                  Términos y Condiciones
                </span>
              </div>
              <Title as="h1" className="mb-6">
                Términos de uso del servicio
              </Title>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 leading-relaxed">
                Al usar JJSecure VPN, aceptas los siguientes términos y
                condiciones. Te recomendamos leerlos detenidamente para entender
                tus derechos y responsabilidades.
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
                  ¿Tienes preguntas sobre los términos?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Nuestro equipo de soporte está disponible para aclarar
                  cualquier duda sobre nuestros términos de servicio.
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

export default TermsPage;
