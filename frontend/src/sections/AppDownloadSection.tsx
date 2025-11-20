import { Download, Smartphone, Globe, Zap } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12 xl:mb-16 text-center">
          <p className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-600 mb-3 sm:mb-4">Descarga la app</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            JJSecure VPN en tu bolsillo
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-4xl mx-auto">
            Una aplicación completa, creada en Argentina, con toda la potencia de nuestra red VPN en tu dispositivo móvil.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 xl:p-10 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-10 xl:p-12 text-center hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-2">
            Descarga gratis hoy
          </h3>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 mb-6 sm:mb-8">
            Disponible para Android 6.0 o superior
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-4 xl:py-5 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-white transition"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            Descargar en Google Play
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 mt-8 sm:mt-10 lg:mt-12 xl:mt-16 pt-8 sm:pt-10 lg:pt-12 xl:pt-16 border-t border-gray-200">
          <div className="text-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 xl:p-10 hover:shadow-lg transition-all duration-300">
            <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-indigo-600 mb-2">
              100K+
            </div>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600">Descargas activas</p>
          </div>
          <div className="text-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 xl:p-10 hover:shadow-lg transition-all duration-300">
            <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-indigo-600 mb-2">
              4.8★
            </div>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600">Calificación en Play Store</p>
          </div>
          <div className="text-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 xl:p-10 hover:shadow-lg transition-all duration-300">
            <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-indigo-600 mb-2">
              24/7
            </div>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600">Soporte en vivo</p>
          </div>
        </div>
      </div>
    </section>
  );
}
