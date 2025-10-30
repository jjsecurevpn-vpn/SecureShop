import { MessageCircle, Star, Share2 } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Carlos Rodríguez",
    rating: 5,
    message:
      "Excelente servicio! Llevo 3 meses usando JJSecure y nunca me ha fallado. La velocidad es increíble y el soporte es muy rápido.",
    date: "Hace 2 días",
  },
  {
    name: "María González",
    rating: 5,
    message:
      "Perfecto para estudiar desde casa. Puedo ver videos en HD sin problemas y conectar hasta 3 dispositivos al mismo tiempo.",
    date: "Hace 1 semana",
  },
  {
    name: "Luis Martínez",
    rating: 5,
    message:
      "La app es súper liviana y fácil de usar. Me encanta que pueda compartir la conexión sin root. Precio muy accesible.",
    date: "Hace 3 días",
  },
  {
    name: "Jazmin Cardozo",
    rating: 4,
    message:
      "Muy buena experiencia. La conexión es estable y me permite trabajar desde cualquier lugar. El soporte es excelente.",
    date: "Hace 5 días",
  },
] as const;

interface Testimonial {
  name: string;
  rating: number;
  message: string;
  date: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => (
  <div className="group bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 hover:bg-neutral-800/80 transition-all">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-white">{testimonial.name}</h4>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < testimonial.rating
                ? "text-purple-400 fill-current"
                : "text-neutral-600"
            }`}
          />
        ))}
      </div>
    </div>

    <div className="h-px bg-neutral-700/50 mb-4" />

    <p className="text-neutral-300 leading-relaxed mb-4 text-sm">
      {testimonial.message}
    </p>
    <div className="text-xs text-neutral-500">{testimonial.date}</div>
  </div>
);

export default function TestimonialsSection() {
  return (
    <>
      {/* Community Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header compacto */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-xs text-neutral-400">Comunidad</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Únete a Nuestra Comunidad
            </h2>

            <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
              Miles de usuarios ya forman parte. Recibe soporte instantáneo y
              ofertas exclusivas.
            </p>
          </div>

          {/* Grid de comunidad compacto */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-3">
              {/* Telegram Card */}
              <div className="group bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6 hover:border-purple-500/30 hover:bg-neutral-800/80 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-neutral-700 border border-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Grupo de Soporte
                    </h3>
                    <p className="text-xs text-neutral-500">Telegram</p>
                  </div>
                </div>

                <div className="h-px bg-neutral-700/50 mb-4" />

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs font-medium">
                      +5,000 miembros activos
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs font-medium">Soporte 24/7</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs font-medium">
                      Respuesta promedio: 5 min
                    </span>
                  </div>
                </div>

                <a
                  href="https://t.me/+rAuU1_uHGZthMWZh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm w-full text-center block"
                >
                  Unirse al Grupo
                </a>
              </div>

              {/* WhatsApp Card */}
              <div className="group bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6 hover:border-purple-500/30 hover:bg-neutral-800/80 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-neutral-700 border border-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Canal de WhatsApp
                    </h3>
                    <p className="text-xs text-neutral-500">Actualizaciones</p>
                  </div>
                </div>

                <div className="h-px bg-neutral-700/50 mb-4" />

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs font-medium">
                      Actualizaciones diarias
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs font-medium">
                      Ofertas exclusivas
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs font-medium">
                      Noticias importantes
                    </span>
                  </div>
                </div>

                <a
                  href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm w-full text-center block"
                >
                  Unirse al Canal
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header compacto */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-xs text-neutral-400">Testimonios</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Lo que dicen nuestros usuarios
            </h2>

            <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
              Miles de usuarios confían en JJSecure. Estas son sus experiencias
              reales.
            </p>
          </div>

          {/* Grid de testimonios compacto */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid md:grid-cols-2 gap-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>
          </div>

          {/* CTA minimalista */}
          <div className="text-center">
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6 max-w-md mx-auto hover:border-purple-500/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Listo para unirte?
              </h3>
              <p className="text-neutral-400 text-sm mb-4">
                Miles de usuarios ya confían en JJSecure.
              </p>
              <a
                href="https://t.me/+rAuU1_uHGZthMWZh"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm inline-block"
              >
                Comenzar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
