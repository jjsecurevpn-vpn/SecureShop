import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users, Gift, Shield, Zap, Globe2 } from "lucide-react";
import DemoModal from "../components/DemoModal";
import ActiveUsersCard from "../components/ActiveUsersCard";
import { Button } from "../components/Button";
import { HeroTitle, LeadText, SmallText } from "../components/Typography";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const goToPlans = () => navigate("/planes");
  const goToResellers = () => navigate("/revendedores");

  const features = [
    { icon: Shield, label: "Cifrado AES-256" },
    { icon: Zap, label: "Ultra rápido" },
    { icon: Globe2, label: "Multi-región" },
  ];

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12">
          {/* Main content */}
          <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
            {/* Active Users Card - Usuarios activos en vivo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <ActiveUsersCard />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-sm font-medium text-purple-700">De los creadores de JJSecure VPN</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              className="max-w-4xl space-y-4 sm:space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <HeroTitle className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                VPN Premium.
                <span className="block text-purple-700">Protege tu Privacidad.</span>
              </HeroTitle>
              <LeadText className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                Experimenta la <strong className="font-semibold text-gray-700">verdadera libertad online</strong>. 
                Acceso sin restricciones, bloqueo de anuncios y máxima privacidad con velocidad garantizada.
              </LeadText>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              className="flex flex-wrap gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-100 shadow-sm text-sm text-gray-600"
                >
                  <feature.icon className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{feature.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={goToPlans}
                variant="primary"
                size="md"
                fullWidthMobile
                className="group shadow-lg shadow-purple-200/50 bg-purple-700 hover:bg-purple-800 focus-visible:ring-purple-900"
              >
                Ver planes
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => setIsDemoOpen(true)}
                variant="secondary"
                size="md"
                fullWidthMobile
                className="text-purple-700 shadow-purple-700 shadow-[inset_0_0_0_2px] hover:bg-purple-700 hover:text-white hover:shadow-transparent focus-visible:ring-purple-900"
              >
                <Gift className="h-4 w-4" />
                Prueba Gratuita
              </Button>
              <Button
                onClick={goToResellers}
                variant="secondary"
                size="md"
                fullWidthMobile
                className="text-purple-700 shadow-purple-700 shadow-[inset_0_0_0_2px] hover:bg-purple-700 hover:text-white hover:shadow-transparent focus-visible:ring-purple-900"
              >
                <Users className="h-4 w-4" />
                Ser revendedor
              </Button>
            </motion.div>

            {/* Trust text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SmallText className="text-xs font-medium text-gray-500">
                ✓ Sin compromisos · Garantía de reembolso si no te sirve
              </SmallText>
            </motion.div>
          </div>
        </div>

        {/* Hero Image */}
        <motion.div
          className="relative w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Imagen para móvil */}
          <img
            src="/SecureVPNMovil.avif"
            alt="JJSecure VPN App"
            className="md:hidden w-full h-auto"
          />
          {/* Imagen para desktop */}
          <img
            src="/SecureVPN.avif"
            alt="JJSecure VPN App"
            className="hidden md:block w-full h-auto"
          />
        </motion.div>
      </section>
    </>
  );
}
