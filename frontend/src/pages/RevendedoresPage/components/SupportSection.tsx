import { MessageCircle, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { BodyText, CardTitle, LeadText, SectionTitle } from "../../../components/Typography";

export function SupportSection() {
  const channels = [
    {
      label: "Telegram",
      description: "Respuesta inmediata de nuestro equipo",
      href: "https://t.me/+rAuU1_uHGZthMWZh",
      icon: MessageCircle,
    },
    {
      label: "WhatsApp",
      description: "Ayuda especializada y personalizada",
      href: "https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja",
      icon: Phone,
    },
  ];

  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-semibold">
            💬 Soporte dedicado
          </span>
          <SectionTitle className="mb-3">¿Tienes dudas?</SectionTitle>
          <LeadText>Contacta a nuestro equipo de soporte</LeadText>
        </motion.div>

        {/* Support Channels */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-white/95 backdrop-blur-sm border border-purple-100 hover:border-purple-200 p-5 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-700 flex-shrink-0">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <CardTitle as="h3" className="text-base sm:text-lg">{channel.label}</CardTitle>
                    <BodyText className="text-sm">{channel.description}</BodyText>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
