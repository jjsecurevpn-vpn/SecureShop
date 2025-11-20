import { Wifi, Smartphone, Globe } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

export function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="mb-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          icon={<Wifi className="h-5 w-5" />}
          title="Cómo funciona"
          subtitle="Onboarding simple en tres pasos"
        />

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Descarga la app",
              desc: "Android liviano, sin configuraciones raras. Instalás y listo.",
              icon: <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />,
            },
            {
              step: "02",
              title: "Activa la VPN",
              desc: "Un solo botón redirige todo tu tráfico a nuestros nodos.",
              icon: <Wifi className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />,
            },
            {
              step: "03",
              title: "Seguí conectado",
              desc: "Si la operadora bloquea, publicamos un parche y te avisamos.",
              icon: <Globe className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />,
            },
          ].map((item) => (
            <article key={item.title} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
              <div className="flex items-center gap-3 text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-[0.3em] text-gray-600">
                <span className="text-gray-800">{item.step}</span>
                <span className="text-emerald-600">{item.icon}</span>
              </div>
              <h3 className="mt-4 text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700">{item.desc}</p>
            </article>
          ))}
        </div>

        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 sm:p-8 lg:p-10 xl:p-12 text-sm sm:text-base lg:text-lg xl:text-xl text-emerald-700">
          <p>
            JJSecure mantiene activa tu conexión incluso cuando no tenés saldo. Nuestros servidores rotan solos y los
            updates se comunican por el muro de estado y el canal de Telegram en tiempo real.
          </p>
        </div>
      </div>
    </section>
  );
}