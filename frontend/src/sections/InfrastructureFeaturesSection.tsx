import { Lock, Key, Server, Zap, Headphones, Sparkles } from "lucide-react";
import { Title } from "../components/Title";
import { Subtitle } from "../components/Subtitle";

interface InfrastructureFeature {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const infrastructureHighlights: InfrastructureFeature[] = [
  {
    title: "Política de no registros",
    description:
      "Nunca almacenamos tu tráfico ni compartimos datos con terceros: Rumanía y leyes europeas mantienen tu privacidad intacta.",
    icon: Lock,
    color: "text-red-400",
  },
  {
    title: "Cifrado militar AES-256",
    description:
      "Ocultamos tus datos con cifrado AES-256, túneles TLS 1.3 y claves rotativas para que nadie te pueda rastrear.",
    icon: Key,
    color: "text-blue-400",
  },
  {
    title: "Gran flota de servidores",
    description:
      "Actualmente operamos una flota selecta que optimizamos cada día; seguimos esforzándonos para incorporar nuevos servidores en América, Europa, Asia y África.",
    icon: Server,
    color: "text-purple-400",
  },
  {
    title: "Velocidades ultra rápidas",
    description:
      "Conexiones directas, sin cuellos de botella y balanceo inteligente de tráfico que prioriza tu streaming o gaming.",
    icon: Zap,
    color: "text-yellow-400",
  },
  {
    title: "Asistencia prioritaria",
    description:
      "Chat, WhatsApp y soporte 24/7 con equipos bilingües: respondemos en minutos y guiamos cada configuración.",
    icon: Headphones,
    color: "text-green-400",
  },
  {
    title: "Tecnología en continua renovación",
    description:
      "Auditorías regulares, monitoreo de amenazas y actualizaciones automáticas reducen riesgos y mantienen el servicio impecable.",
    icon: Sparkles,
    color: "text-cyan-400",
  },
];

export default function InfrastructureFeaturesSection() {
  return (
    <section className="bg-white py-8 sm:py-10 lg:py-12 xl:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 sm:mb-10 lg:mb-12 max-w-3xl text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-600">Nuestra infraestructura</p>
          <Title as="h2" className="mt-3">
            Capacidades que sostienen tu seguridad
          </Title>
          <Subtitle className="mt-3">
            Cada componente está pensado para proteger tu conexión, mantener privacidad y garantizar continuidad sin
            sorpresas.
          </Subtitle>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {infrastructureHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-all duration-300"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                </div>
                <h3 className="mt-4 text-sm sm:text-base lg:text-lg font-serif font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}