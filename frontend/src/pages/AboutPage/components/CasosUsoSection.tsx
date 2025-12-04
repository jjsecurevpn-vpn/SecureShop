import { Smartphone } from "lucide-react";
import { Title } from "../../../components/Title";
import { SectionTitle } from "./SectionTitle";

export function CasosUsoSection() {
  return (
    <section id="casos-uso" className="w-full px-4 md:px-8 xl:px-16 py-8 md:py-12 xl:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <SectionTitle
          icon={<Smartphone className="h-5 w-5" />}
          title="Casos de uso"
          subtitle="Escenarios reales donde más ayudamos"
        />

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {[
            {
              title: "Sin saldo",
              desc: "Seguís conectado para trabajar o estudiar aunque la recarga llegue más tarde.",
            },
            {
              title: "Bloqueos de operadora",
              desc: "Cuando hay bloqueos masivos, la app rota automáticamente al servidor sano.",
            },
            {
              title: "Emergencias",
              desc: "Podés pedir ayuda o compartir tu ubicación incluso si agotaste el plan.",
            },
            {
              title: "Viajes",
              desc: "Conectá desde cualquier punto del país sin depender de redes públicas inseguras.",
            },
          ].map((use) => (
            <article key={use.title} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5">
              <Title as="h3">{use.title}</Title>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-700">{use.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}