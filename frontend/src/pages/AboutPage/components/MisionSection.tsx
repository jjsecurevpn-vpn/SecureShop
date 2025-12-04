import { Target, CheckCircle } from "lucide-react";
import { Title } from "../../../components/Title";
import { SectionTitle } from "./SectionTitle";

export function MisionSection() {
  return (
    <section id="mision" className="w-full px-4 md:px-8 xl:px-16 py-8 md:py-12 xl:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <SectionTitle
          icon={<Target className="h-5 w-5" />}
          title="Nuestra misión"
          subtitle="Lo que activamos cada día"
        />

        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <article className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5">
            <Title as="h3">¿Qué hacemos exactamente?</Title>
            <ul className="mt-4 space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
              {[
                {
                  title: "Acceso sin saldo",
                  copy: "Si tu saldo se agota, la app mantiene la sesión activa mientras encuentras una recarga.",
                },
                {
                  title: "Servidores que congelan megas",
                  copy: "Nuestros nodos especializados evitan que tus datos se descuenten mientras navegas.",
                },
                {
                  title: "Respuesta a bloqueos",
                  copy: "Detectamos cambios de la operadora y lanzamos un fix en horas, no en semanas.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3 text-gray-700">
                  <CheckCircle className="mt-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-600">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5">
            <Title as="h3">Nuestra promesa</Title>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-700">
              Nos comprometemos a mantener activa tu conexión incluso cuando el operador decide bloquearla. Cuando
              hay cambios, compartimos el estado en nuestra comunidad y priorizamos la solución de forma pública.
            </p>
            <div className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 md:p-4 xl:p-5 text-xs sm:text-sm md:text-base text-emerald-700">
              "Innovamos sin pausa para que nunca te quedes sin opciones."
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}