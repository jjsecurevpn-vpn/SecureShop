import { Target, CheckCircle } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

export function MisionSection() {
  return (
    <section id="mision" className="mb-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          icon={<Target className="h-5 w-5" />}
          title="Nuestra misión"
          subtitle="Lo que activamos cada día"
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-6 sm:p-8 lg:p-10 xl:p-12">
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900">¿Qué hacemos exactamente?</h3>
            <ul className="mt-5 space-y-4 text-sm sm:text-base lg:text-lg xl:text-xl">
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
                  <CheckCircle className="mt-1 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-600">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-6 sm:p-8 lg:p-10 xl:p-12">
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900">Nuestra promesa</h3>
            <p className="mt-4 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700">
              Nos comprometemos a mantener activa tu conexión incluso cuando el operador decide bloquearla. Cuando
              hay cambios, compartimos el estado en nuestra comunidad y priorizamos la solución de forma pública.
            </p>
            <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 sm:p-6 lg:p-8 xl:p-10 text-sm sm:text-base lg:text-lg xl:text-xl text-emerald-700">
              "Innovamos sin pausa para que nunca te quedes sin opciones."
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}