import { Wifi, Smartphone, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "./SectionTitle";

export function ComoFuncionaSection() {
  const steps = [
    {
      step: "01",
      title: "Descarga la app",
      desc: "Android liviano, sin configuraciones raras. Instalás y listo.",
      icon: Smartphone,
      color: "purple",
    },
    {
      step: "02",
      title: "Activa la VPN",
      desc: "Un solo botón redirige todo tu tráfico a nuestros nodos.",
      icon: Wifi,
      color: "sky",
    },
    {
      step: "03",
      title: "Seguí conectado",
      desc: "Si la operadora bloquea, publicamos un parche y te avisamos.",
      icon: Globe,
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; badge: string }> = {
    purple: { bg: "bg-purple-50", icon: "text-purple-500", badge: "bg-purple-100 text-purple-600" },
    sky: { bg: "bg-sky-50", icon: "text-sky-500", badge: "bg-sky-100 text-sky-600" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-600" },
  };

  return (
    <section id="como-funciona" className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <SectionTitle
          icon={<Wifi className="h-5 w-5" />}
          title="Cómo funciona"
          subtitle="Onboarding simple en tres pasos"
          iconColor="text-sky-500"
        />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((item, index) => {
            const colors = colorClasses[item.color];
            return (
              <motion.article 
                key={item.title} 
                className={`rounded-2xl ${colors.bg} border border-gray-100 p-6 sm:p-8 relative`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge} mb-4`}>
                  {item.step}
                </span>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm mb-4`}>
                  <item.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base">{item.desc}</p>
              </motion.article>
            );
          })}
        </div>

        <motion.div 
          className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 sm:p-8 flex items-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ArrowRight className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-700 text-sm sm:text-base lg:text-lg">
            JJSecure mantiene activa tu conexión incluso cuando no tenés saldo. Nuestros servidores rotan solos y los
            updates se comunican por el muro de estado y el canal de Telegram en tiempo real.
          </p>
        </motion.div>
      </div>
    </section>
  );
}