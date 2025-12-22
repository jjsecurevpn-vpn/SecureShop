import { motion } from "framer-motion";
import { Download, Smartphone, Globe, Zap, Star, Clock } from "lucide-react";
import { LinkButton } from "../components/Button";
import { BodyText, CardTitle, LeadText, SectionTitle, SmallText } from "../components/Typography";

export default function AppDownloadSection() {
  const features = [
    {
      icon: Smartphone,
      title: "Aplicación nativa",
      description: "Diseñada para Android con máximo rendimiento y bajo consumo de batería",
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      icon: Zap,
      title: "Conexión instantánea",
      description: "Un toque para conectar sin demoras, buffers ni interrupciones",
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      icon: Globe,
      title: "Red global",
      description: "Acceso completo a todos nuestros servidores desde tu dispositivo",
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ];

  const stats = [
    { value: "100K+", label: "Descargas", icon: Download },
    { value: "4.8★", label: "Calificación", icon: Star },
    { value: "24/7", label: "Soporte", icon: Clock },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-purple-50/30 to-white">
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
            <Smartphone className="w-3.5 h-3.5 text-purple-700" />
            <SmallText className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
              App móvil
            </SmallText>
          </div>
          <SectionTitle className="mb-3">JJSecure VPN en tu bolsillo</SectionTitle>
          <LeadText className="text-base sm:text-lg max-w-2xl mx-auto">
            Una aplicación completa, creada en Argentina, con toda la potencia de nuestra red VPN
          </LeadText>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 mb-12 sm:mb-14">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`
                bg-white rounded-2xl border ${feature.border} p-5 sm:p-6
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300
              `}
            >
              <div className={`w-11 h-11 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <CardTitle as="h3" className="text-base sm:text-lg mb-2">{feature.title}</CardTitle>
              <BodyText className="text-sm leading-relaxed">{feature.description}</BodyText>
            </motion.div>
          ))}
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-8 sm:p-10 text-center text-white"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full mb-4">
              <span className="text-xs font-medium">Descarga gratuita</span>
            </div>
            <CardTitle as="h3" className="text-xl sm:text-2xl text-white mb-2">Disponible en Google Play</CardTitle>
            <BodyText className="text-white/80 text-sm sm:text-base mb-6 max-w-md mx-auto">
              Compatible con Android 6.0 o superior. Instalación rápida y segura.
            </BodyText>
            <LinkButton
              href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="md"
              className="bg-white text-purple-700 hover:bg-gray-100 border-white shadow-lg"
            >
              <Download className="h-4 w-4" />
              Descargar ahora
            </LinkButton>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex justify-center mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
                {stat.value}
              </div>
              <SmallText as="p" className="text-xs sm:text-sm font-medium">{stat.label}</SmallText>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
