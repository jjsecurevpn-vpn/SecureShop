import { motion } from "framer-motion";
import { Activity, Globe2, Shield, Zap } from "lucide-react";
import Lottie from "lottie-react";
import serversAnimation from "../../../assets/lottie/servers-hero.json";

export function ServersHero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:gap-12 items-center lg:grid-cols-2">
            {/* Content */}
            <motion.div 
              className="space-y-6 order-2 lg:order-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-700 text-sm font-medium">Red operativa</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-gray-900 leading-tight tracking-tight">
                Estado de la red
                <span className="block text-purple-600">en tiempo real</span>
              </h1>

              {/* Description */}
              <p className="text-gray-500 text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Monitorea el rendimiento, disponibilidad y recursos de todos nuestros servidores con actualizaciones instantáneas.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                {[
                  { icon: Activity, label: "Tiempo real" },
                  { icon: Shield, label: "99.9% uptime" },
                  { icon: Globe2, label: "Multi-región" },
                  { icon: Zap, label: "Baja latencia" },
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
            </motion.div>

            {/* Animation */}
            <motion.div 
              className="order-1 lg:order-2 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <Lottie animationData={serversAnimation as unknown as object} autoplay loop />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
