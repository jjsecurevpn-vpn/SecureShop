import { Heart } from "lucide-react";
import { Title } from "../../../components/Title";
import { SectionTitle } from "./SectionTitle";

export function ValoresSection() {
  return (
    <section id="valores" className="w-full px-4 md:px-8 xl:px-16 py-8 md:py-12 xl:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <SectionTitle
          icon={<Heart className="h-5 w-5" />}
          title="Nuestros valores"
          subtitle="Principios que sostienen la red"
        />

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
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
            <article key={value.title} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5 text-center">
              <Title as="h3">{value.title}</Title>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-700">{value.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}