import { motion } from "framer-motion";
import { BENEFITS } from "../constants";
import { SectionTitle, LeadText, CardTitle, BodyText } from "../../../components/Typography";

const benefitColors = [
  { bg: "bg-white/95", border: "border-purple-100", icon: "bg-purple-100 text-purple-600" },
  { bg: "bg-purple-50/60", border: "border-purple-100", icon: "bg-purple-100 text-purple-600" },
  { bg: "bg-white/95", border: "border-purple-100", icon: "bg-purple-100 text-purple-600" },
  { bg: "bg-purple-50/60", border: "border-purple-100", icon: "bg-purple-100 text-purple-600" },
];

export function BenefitsSection() {
  return (
    <section id="section-beneficios" className="relative bg-gradient-to-b from-white to-gray-50/50 py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-semibold">
            ✨ Beneficios incluidos
          </span>
          <SectionTitle as="h2" className="mb-4">Lo que viene con cada plan</SectionTitle>
          <LeadText as="p" className="max-w-2xl mx-auto text-base sm:text-lg">
            Todas las herramientas que necesitas para navegar seguro
          </LeadText>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            const colors = benefitColors[index % benefitColors.length];
            return (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex gap-4 rounded-2xl ${colors.bg} border ${colors.border} p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300`}
              >
                <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${colors.icon} flex-shrink-0`}>
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <CardTitle as="h3" className="text-base sm:text-lg mb-1">{benefit.title}</CardTitle>
                  <BodyText className="text-sm sm:text-base">{benefit.description}</BodyText>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
