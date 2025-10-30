import {
  Download,
  Tv,
  Smartphone,
  DollarSign,
  Wifi,
  MapPin,
  User,
  ArrowRight,
} from "lucide-react";

export default function AppDownloadSection() {
  const features = [
    {
      icon: <Tv className="w-4 h-4" />,
      title: "Modo TV",
      description: "Adaptación perfecta para Smart TV",
    },
    {
      icon: <Smartphone className="w-4 h-4" />,
      title: "Modo Móvil",
      description: "Optimizado para tablets y móviles",
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      title: "Precios Inigualables",
      description: "Mejor relación calidad-precio",
    },
    {
      icon: <Wifi className="w-4 h-4" />,
      title: "Hotspot Sharing",
      description: "Comparte tu conexión VPN",
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      title: "Mapa en Tiempo Real",
      description: "Visualiza latitud y longitud",
    },
    {
      icon: <User className="w-4 h-4" />,
      title: "Perfil en Tiempo Real",
      description: "Datos actualizados al instante",
    },
  ];

  return (
    <section className="relative py-16">
      <div className="relative container mx-auto px-6 max-w-6xl">
        {/* Header compacto */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span className="text-xs text-neutral-400">Aplicación Premium</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            ¿Por qué nuestra app es la más completa?
          </h2>

          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            Descubre todas las funcionalidades que hacen de JJSecure VPN la
            mejor opción.
          </p>
        </div>

        {/* Features Grid minimalista */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 hover:border-purple-500/30 hover:bg-neutral-800/80 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-purple-400 group-hover:text-purple-300 transition-colors">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section compacto */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-green-500/30 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-xs text-neutral-400">¡Y mucho más!</span>
          </div>

          <p className="text-sm text-neutral-400 mb-6 max-w-2xl mx-auto">
            Conecta automáticamente, cambia servidores al instante, modo oscuro,
            notificaciones inteligentes y muchas funcionalidades más.
          </p>

          {/* Download Button */}
          <a
            href="https://play.google.com/store/apps/details?id=com.jjsecure.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium text-white transition-colors mb-4"
          >
            <Download className="w-4 h-4" />
            Descargar App
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Additional Info minimalista */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Gratis en Google Play</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Actualizaciones constantes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
