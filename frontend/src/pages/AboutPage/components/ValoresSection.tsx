import { Heart } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

export function ValoresSection() {
  return (
    <section id="valores" className="mb-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          icon={<Heart className="h-5 w-5" />}
          title="Nuestros valores"
          subtitle="Principios que sostienen la red"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Accesibilidad",
              desc: "Internet como derecho. Diseñamos pensando en contextos reales.",
            },
            {
              title: "Transparencia",
              desc: "Compartimos el estado, los fixes y el roadmap sin adornos.",
            },
            {
              title: "Resiliencia",
              desc: "Bloqueos van a suceder, reaccionamos rápido y con la comunidad.",
            },
          ].map((value) => (
            <article key={value.title} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10 text-center">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900">{value.title}</h3>
              <p className="mt-2 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700">{value.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}