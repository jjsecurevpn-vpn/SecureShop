import { Smartphone } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

export function CasosUsoSection() {
  return (
    <section id="casos-uso" className="mb-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          icon={<Smartphone className="h-5 w-5" />}
          title="Casos de uso"
          subtitle="Escenarios reales donde más ayudamos"
        />

        <div className="grid gap-4 md:grid-cols-2">
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
            <article key={use.title} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900">{use.title}</h3>
              <p className="mt-2 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700">{use.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}