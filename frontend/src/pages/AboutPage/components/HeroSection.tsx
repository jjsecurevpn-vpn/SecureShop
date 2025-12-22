import { ArrowRight, Shield, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import aboutHeroAnimation from "../../../assets/lottie/about-hero.json";

export function HeroSection() {
  return (
    <section id="hero-section" className="bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid gap-8 lg:gap-12 items-center lg:grid-cols-2">
          {/* Content */}
          <motion.div 
            className="space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-purple-700 text-sm font-medium">Sobre JJSecure VPN</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-gray-900 leading-tight">
              Nunca más sin conexión
              <span className="block text-purple-600">cuando más la necesitas</span>
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              JJSecure es una VPN creada en la región para mantener tu línea activa incluso sin saldo. Nos movemos rápido ante bloqueos y compartimos cada iteración con la comunidad.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Users, label: "15K+ usuarios" },
                { icon: Shield, label: "99.9% uptime" },
                { icon: Zap, label: "Soporte 24/7" },
              ].map((feature) => (
                <div 
                  key={feature.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-100 shadow-sm text-sm text-gray-600"
                >
                  <feature.icon className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg shadow-purple-200"
              >
                Descargar JJSecure
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>

          {/* Animation */}
          <motion.div 
            className="flex items-center justify-center order-first lg:order-last"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-full max-w-md">
              <Lottie animationData={aboutHeroAnimation as unknown as object} loop autoplay />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}