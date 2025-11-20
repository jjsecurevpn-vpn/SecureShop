import { Lock, Key, Server, Zap, Headphones, Sparkles } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto mb-8 sm:mb-10 lg:mb-12 xl:mb-16 max-w-4xl text-center">
          <p className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-600">Nuestra infraestructura</p>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900">
            Capacidades que sostienen tu seguridad
          </h2>
          <p className="mt-3 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
            Cada componente está pensado para proteger tu conexión, mantener privacidad y garantizar continuidad sin
            sorpresas.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 xl:gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {infrastructureHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 xl:p-10 text-left hover:shadow-lg transition-all duration-300"
              >
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 ${feature.color}`} />
                </div>
                <h3 className="mt-4 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-700 leading-relaxed">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}