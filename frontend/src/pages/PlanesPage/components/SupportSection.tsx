import { MessageCircle, Phone } from "lucide-react";

export function SupportSection() {
  return (
    <>
      <section id="section-soporte" className="bg-white py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-16 text-center">
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-[0.3em] text-indigo-600 font-semibold">Soporte</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900">Estamos online 24/7</h2>
            <p className="mt-2 text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600">Canales directos para resolver cualquier duda o bloqueo</p>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:gap-8 xl:gap-10 md:grid-cols-2 lg:grid-cols-2">
            {[
              {
                label: "Telegram",
                description: "Respuesta inmediata",
                href: "https://t.me/+rAuU1_uHGZthMWZh",
                icon: MessageCircle,
              },
              {
                label: "WhatsApp",
                description: "Ayuda especializada",
                href: "https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja",
                icon: Phone,
              },
            ].map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-gray-900">{channel.label}</h3>
                      <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600">{channel.description}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 p-2 sm:p-3 lg:p-4 xl:p-5 text-indigo-600 group-hover:text-indigo-700">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gradient transition section - removed */}
    </>
  );
}
