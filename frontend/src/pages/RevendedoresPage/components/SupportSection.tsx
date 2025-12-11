import { MessageCircle, Phone } from "lucide-react";

export function SupportSection() {
  return (
    <section className="py-8 md:py-12 xl:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-normal text-gray-900 mb-3 sm:mb-4">¿Tienes dudas?</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Contacta a nuestro equipo de soporte</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mx-auto">
          <a
            href="https://t.me/+rAuU1_uHGZthMWZh"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 hover:shadow-lg p-4 sm:p-5 lg:p-6 text-center transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:text-base md:text-lg">Telegram</h3>
            <p className="text-xs text-gray-600 sm:text-sm">Respuesta inmediata</p>
          </a>

          <a
            href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 hover:shadow-lg p-4 sm:p-5 lg:p-6 text-center transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:text-base md:text-lg">WhatsApp</h3>
            <p className="text-xs text-gray-600 sm:text-sm">Ayuda especializada</p>
          </a>
        </div>
      </div>
    </section>
  );
}
