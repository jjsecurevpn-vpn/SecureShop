import { Wifi, Smartphone, Globe } from "lucide-react";
import { Title } from "../../../components/Title";
import { SectionTitle } from "./SectionTitle";

export function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="w-full px-4 md:px-8 xl:px-16 py-8 md:py-12 xl:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <SectionTitle
          icon={<Wifi className="h-5 w-5" />}
          title="Cómo funciona"
          subtitle="Onboarding simple en tres pasos"
        />

        <div className="grid gap-4 md:gap-6">
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
            <article key={item.title} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-600">
                <span className="text-gray-800">{item.step}</span>
                <span className="text-emerald-600">{item.icon}</span>
              </div>
              <Title as="h3" className="mt-2">{item.title}</Title>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-700">{item.desc}</p>
            </article>
          ))}
        </div>

        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 md:p-4 xl:p-5 text-sm md:text-base xl:text-lg text-emerald-700">
          <p>
            JJSecure mantiene activa tu conexión incluso cuando no tenés saldo. Nuestros servidores rotan solos y los
            updates se comunican por el muro de estado y el canal de Telegram en tiempo real.
          </p>
        </div>
      </div>
    </section>
  );
}