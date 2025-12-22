import { motion } from "framer-motion";
import { Lock, Key, Server, Zap, Headphones, Sparkles, Shield } from "lucide-react";
import { BodyText, CardTitle, LeadText, SectionTitle, SmallText } from "../components/Typography";

interface InfrastructureFeature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

const infrastructureHighlights: InfrastructureFeature[] = [
  {
    title: "Política de no registros",
    description:
      "Nunca almacenamos tu tráfico ni compartimos datos con terceros. Rumanía y leyes europeas mantienen tu privacidad intacta.",
    icon: Lock,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    title: "Cifrado militar AES-256",
    description:
      "Ocultamos tus datos con cifrado AES-256, túneles TLS 1.3 y claves rotativas para máxima seguridad.",
    icon: Key,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    title: "Gran flota de servidores",
    description:
      "Operamos una flota selecta optimizada cada día, con nuevos servidores en América, Europa, Asia y África.",
    icon: Server,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    title: "Velocidades ultra rápidas",
    description:
      "Conexiones directas, sin cuellos de botella y balanceo inteligente que prioriza streaming y gaming.",
    icon: Zap,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    title: "Asistencia prioritaria",
    description:
      "Chat, WhatsApp y soporte 24/7 con equipos bilingües que responden en minutos.",
    icon: Headphones,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    title: "Tecnología renovada",
    description:
      "Auditorías regulares, monitoreo de amenazas y actualizaciones automáticas mantienen el servicio impecable.",
    icon: Sparkles,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
];

export default function InfrastructureFeaturesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-14"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <SmallText className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
              Infraestructura
            </SmallText>
          </div>
          <SectionTitle className="mb-3">Capacidades que sostienen tu seguridad</SectionTitle>
          <LeadText className="text-base sm:text-lg max-w-2xl mx-auto">
            Cada componente está pensado para proteger tu conexión, mantener privacidad y garantizar continuidad
          </LeadText>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {infrastructureHighlights.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`
                  bg-white rounded-2xl border ${feature.border} p-5 sm:p-6
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                `}
              >
                <div className={`w-11 h-11 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <CardTitle as="h3" className="text-base sm:text-lg mb-2">{feature.title}</CardTitle>
                <BodyText className="text-sm leading-relaxed">{feature.description}</BodyText>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom CTA hint */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <SmallText as="p" className="text-xs font-medium text-gray-500">
            ✓ Sin límites de ancho de banda · ✓ Conexiones ilimitadas · ✓ Actualizaciones gratuitas
          </SmallText>
        </motion.div>
      </div>
    </section>
  );
}