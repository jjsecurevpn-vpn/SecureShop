import { MessageCircle, Phone } from "lucide-react";

export function SupportSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-5 xl:mb-6 sm:text-3xl lg:text-4xl xl:text-5xl">¿Tienes dudas?</h2>
          <p className="text-sm text-gray-600 sm:text-base lg:text-lg xl:text-xl">Contacta a nuestro equipo de soporte</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 lg:gap-7 xl:gap-8 mx-auto">
          <a
            href="https://t.me/+rAuU1_uHGZthMWZh"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 hover:shadow-lg p-5 sm:p-6 lg:p-7 xl:p-8 text-center transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 xl:mb-5 sm:text-lg lg:text-xl xl:text-2xl">Telegram</h3>
            <p className="text-xs text-gray-600 sm:text-sm lg:text-base xl:text-lg">Respuesta inmediata</p>
          </a>

          <a
            href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 hover:shadow-lg p-5 sm:p-6 lg:p-7 xl:p-8 text-center transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 xl:mb-5 sm:text-lg lg:text-xl xl:text-2xl">WhatsApp</h3>
            <p className="text-xs text-gray-600 sm:text-sm lg:text-base xl:text-lg">Ayuda especializada</p>
          </a>
        </div>
      </div>
    </section>
  );
}
