import { MessageCircle, Phone } from "lucide-react";

export function SupportSection() {
  return (
    <section id="section-soporte" className="py-20">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-50 mb-2">¿Necesitas ayuda?</h2>
          <p className="text-neutral-400">Disponibles 24/7 en múltiples canales</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="https://t.me/+rAuU1_uHGZthMWZh"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-neutral-900/50 border border-neutral-800 hover:border-violet-500/50 rounded-lg transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-neutral-50 mb-1">Telegram</h3>
                <p className="text-sm text-neutral-400">Respuesta inmediata</p>
              </div>
              <MessageCircle className="w-5 h-5 text-neutral-500 group-hover:text-violet-400 transition-colors" />
            </div>
          </a>

          <a
            href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-neutral-900/50 border border-neutral-800 hover:border-violet-500/50 rounded-lg transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-neutral-50 mb-1">WhatsApp</h3>
                <p className="text-sm text-neutral-400">Ayuda especializada</p>
              </div>
              <Phone className="w-5 h-5 text-neutral-500 group-hover:text-violet-400 transition-colors" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
