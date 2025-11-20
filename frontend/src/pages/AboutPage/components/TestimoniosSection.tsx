import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SectionTitle } from "./SectionTitle";

const TESTIMONIALS = [
  {
    name: "Carlos Rodríguez",
    rating: 5,
    message: "Sin saldo y pude seguir usando internet. JJSecure me salvó el trabajo.",
    date: "Hace 2 días",
  },
  {
    name: "María González",
    rating: 5,
    message: "Tenía mis gigas congelados y gracias a JJSecure pude estudiar desde casa.",
    date: "Hace 1 semana",
  },
  {
    name: "Luis Martínez",
    rating: 5,
    message: "App ligera, funciona cuando otros no. Nunca más sin conexión.",
    date: "Hace 3 días",
  },
  {
    name: "Jazmin Cardozo",
    rating: 5,
    message: "El soporte responde rápido y la conexión VPN es súper estable.",
    date: "Hace 5 días",
  },
  {
    name: "Roberto Silva",
    rating: 5,
    message: "Excelente VPN regional, entiende las necesidades del mercado latinoamericano.",
    date: "Hace 1 día",
  },
  {
    name: "Ana López",
    rating: 5,
    message: "La mejor inversión que hice para mi negocio. Conexión estable 24/7.",
    date: "Hace 4 días",
  },
];

export function TestimoniosSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  // Detectar el tamaño de pantalla para ajustar visibleCount
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1280) {
        setVisibleCount(3); // xl: 3 testimonios
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2); // md-lg: 2 testimonios
      } else {
        setVisibleCount(1); // sm y abajo: 1 testimonio
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = TESTIMONIALS.length - visibleCount;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, TESTIMONIALS.length - visibleCount) : prevIndex - 1
    );
  };

  const visibleTestimonials = TESTIMONIALS.slice(currentIndex, currentIndex + visibleCount);

  return (
    <section id="testimonios" className="mb-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          icon={<Star className="h-5 w-5" />}
          title="Testimonios"
          subtitle="Feedback directo de la comunidad"
        />

        {/* Navegación arriba */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={prevTestimonial}
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Testimonio anterior"
            disabled={currentIndex === 0 && visibleCount >= TESTIMONIALS.length}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>

          {/* Indicadores */}
          <div className="flex gap-2">
            {Array.from({ length: Math.max(1, TESTIMONIALS.length - visibleCount + 1) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-indigo-600" : "bg-gray-300"
                }`}
                aria-label={`Ir al grupo de testimonios ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Testimonio siguiente"
            disabled={currentIndex >= TESTIMONIALS.length - visibleCount}
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Testimonios visibles */}
        <div className={`grid gap-4 ${visibleCount === 1 ? 'max-w-2xl mx-auto' : visibleCount === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'lg:grid-cols-2 xl:grid-cols-3 max-w-7xl mx-auto'}`}>
          {visibleTestimonials.map((testimonial) => (
            <article key={`${testimonial.name}-${currentIndex}`} className="rounded-lg bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-lg">
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${
                      index < testimonial.rating ? "text-emerald-600" : "text-gray-300"
                    }`}
                    fill={index < testimonial.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-800">"{testimonial.message}"</p>
              <div className="mt-4 flex items-center justify-between text-xs sm:text-sm lg:text-base text-gray-700">
                <span className="font-medium text-gray-900">{testimonial.name}</span>
                <span>{testimonial.date}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}