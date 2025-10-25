import { MessageCircle, Star, Share2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Carlos Rodríguez',
    rating: 5,
    message:
      'Excelente servicio! Llevo 3 meses usando JJSecure y nunca me ha fallado. La velocidad es increíble y el soporte es muy rápido.',
    date: 'Hace 2 días',
  },
  {
    name: 'María González',
    rating: 5,
    message:
      'Perfecto para estudiar desde casa. Puedo ver videos en HD sin problemas y conectar hasta 3 dispositivos al mismo tiempo.',
    date: 'Hace 1 semana',
  },
  {
    name: 'Luis Martínez',
    rating: 5,
    message:
      'La app es súper liviana y fácil de usar. Me encanta que pueda compartir la conexión sin root. Precio muy accesible.',
    date: 'Hace 3 días',
  },
  {
    name: 'Jazmin Cardozo',
    rating: 4,
    message:
      'Muy buena experiencia. La conexión es estable y me permite trabajar desde cualquier lugar. El soporte es excelente.',
    date: 'Hace 5 días',
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
  <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-gray-100">{testimonial.name}</h4>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? 'text-purple-400 fill-current' : 'text-gray-700'}`}
          />
        ))}
      </div>
    </div>
    <p className="text-gray-300 leading-relaxed mb-4 text-sm">
      {testimonial.message}
    </p>
    <div className="text-xs text-gray-500">{testimonial.date}</div>
  </div>
);

export default function TestimonialsSection() {
  return (
    <>
      {/* Community Section */}
      <section className="bg-gray-950 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 rounded-full px-4 py-2 mb-6 border border-purple-500/30">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Únete a Nuestra Comunidad
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comunidad Telegram & WhatsApp
            </h2>

            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Únete a miles de usuarios que ya forman parte de nuestra
              comunidad. Recibe soporte instantáneo, actualizaciones y ofertas
              exclusivas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Telegram Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 flex flex-col items-center text-center hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-500/15 border border-purple-500/30 rounded-lg mb-6">
                <MessageCircle className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-6">
                Grupo de Soporte
              </h3>
              <div className="space-y-3 mb-8 w-full">
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="font-medium text-sm">
                    +5,000 miembros activos
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="font-medium text-sm">Soporte 24/7</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="font-medium text-sm">
                    Respuesta promedio: 5 min
                  </span>
                </div>
              </div>
              <a
                href="https://t.me/+rAuU1_uHGZthMWZh"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 w-full hover:shadow-lg hover:shadow-purple-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Unirse al Grupo</span>
                </div>
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 flex flex-col items-center text-center hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-500/15 border border-purple-500/30 rounded-lg mb-6">
                <Share2 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-6">
                Canal de WhatsApp
              </h3>
              <div className="space-y-3 mb-8 w-full">
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="font-medium text-sm">
                    Actualizaciones diarias
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="font-medium text-sm">Ofertas exclusivas</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="font-medium text-sm">Noticias importantes</span>
                </div>
              </div>
              <a
                href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 w-full hover:shadow-lg hover:shadow-purple-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>Unirse al Canal</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-950 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 rounded-full px-4 py-2 mb-6 border border-purple-500/30">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Testimonios Reales</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Lo que dicen nuestros usuarios
            </h2>

            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Miles de usuarios confían en JJSecure para su conexión diaria.
              Estas son algunas de sus experiencias reales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 max-w-2xl mx-auto hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <h3 className="text-xl font-semibold text-white mb-3">
                ¿Listo para unirte a ellos?
              </h3>
              <p className="text-gray-300 mb-6">
                Únete a miles de usuarios satisfechos y experimenta la
                diferencia de JJSecure.
              </p>
              <a
                href="https://t.me/+rAuU1_uHGZthMWZh"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 inline-block hover:shadow-lg hover:shadow-purple-500/30"
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
