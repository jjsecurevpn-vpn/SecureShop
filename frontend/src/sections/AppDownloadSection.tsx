import { Download, Smartphone, Globe, Zap } from "lucide-react";
import { LinkButton } from "../components/Button";
import { Title } from "../components/Title";
import { Subtitle } from "../components/Subtitle";

export default function AppDownloadSection() {
  const features = [
    {
      icon: Smartphone,
      title: "Aplicación nativa",
      description: "Diseñada específicamente para Android con máximo rendimiento",
    },
    {
      icon: Zap,
      title: "Velocidad ultra rápida",
      description: "Conexión inmediata sin demoras ni buffers",
    },
    {
      icon: Globe,
      title: "Servidores globales",
      description: "Acceso a nuestra red completa desde tu dispositivo",
    },
  ];

  return (
    <section className="bg-white py-8 sm:py-10 lg:py-12 xl:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-600 mb-3 sm:mb-4">Descarga la app</p>
          <Title as="h2" className="mb-3 sm:mb-4">
            JJSecure VPN en tu bolsillo
          </Title>
          <Subtitle className="max-w-3xl mx-auto">
            Una aplicación completa, creada en Argentina, con toda la potencia de nuestra red VPN en tu dispositivo móvil.
          </Subtitle>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-5 sm:p-6 lg:p-8 text-center hover:shadow-lg transition-all duration-300">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">
            Descarga gratis hoy
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
            Disponible para Android 6.0 o superior
          </p>
          <LinkButton
            href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="md"
          >
            <Download className="h-4 w-4" />
            Descargar en Google Play
          </LinkButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10 lg:mt-12 pt-8 sm:pt-10 lg:pt-12 border-t border-gray-200">
          <div className="text-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">
              100K+
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Descargas activas</p>
          </div>
          <div className="text-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">
              4.8★
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Calificación en Play Store</p>
          </div>
          <div className="text-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">
              24/7
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Soporte en vivo</p>
          </div>
        </div>
      </div>
    </section>
  );
}
