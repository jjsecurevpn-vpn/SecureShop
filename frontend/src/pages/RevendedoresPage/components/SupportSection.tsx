import { MessageCircle, Phone } from "lucide-react";

export function SupportSection() {
  return (
    <section className="py-20 border-t border-neutral-800 bg-gradient-to-b from-transparent to-neutral-900/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-200 mb-3">¿Tienes dudas?</h2>
          <p className="text-neutral-400">Contacta a nuestro equipo de soporte</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <a
            href="https://t.me/+rAuU1_uHGZthMWZh"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-xl p-6 text-center transition-all"
          >
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-2">Telegram</h3>
            <p className="text-sm text-neutral-400">Respuesta inmediata</p>
          </a>

          <a
            href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-xl p-6 text-center transition-all"
          >
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-2">WhatsApp</h3>
            <p className="text-sm text-neutral-400">Ayuda especializada</p>
          </a>
        </div>
      </div>
    </section>
  );
}
