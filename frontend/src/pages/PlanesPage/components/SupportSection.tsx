import { MessageCircle, Phone } from "lucide-react";
import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";

export function SupportSection() {
  return (
    <>
      <section id="section-soporte" className="bg-white py-8 md:py-12 xl:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16">
          <div className="mb-16 text-center">
            <p className="text-xs sm:text-sm lg:text-base uppercase tracking-[0.3em] text-indigo-600 font-semibold">Soporte</p>
            <Title as="h2" center className="mt-3">
              Estamos online 24/7
            </Title>
            <Subtitle center className="mt-2 max-w-2xl mx-auto">
              Canales directos para resolver cualquier duda o bloqueo
            </Subtitle>
          </div>

          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
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
                  className="group rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 md:p-6 xl:p-8 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm md:text-base xl:text-lg font-semibold text-gray-900">{channel.label}</h3>
                      <p className="text-xs md:text-sm xl:text-base text-gray-600">{channel.description}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 p-2 md:p-3 xl:p-4 text-indigo-600 group-hover:text-indigo-700">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 xl:h-7 xl:w-7" />
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
