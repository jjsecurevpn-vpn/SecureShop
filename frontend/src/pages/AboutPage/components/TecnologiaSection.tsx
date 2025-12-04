import { Lock, Server, TrendingUp, Zap, Shield, CheckCircle } from "lucide-react";
import { Title } from "../../../components/Title";
import { SectionTitle } from "./SectionTitle";

export function TecnologiaSection() {
  return (
    <section id="tecnologia" className="w-full px-4 md:px-8 xl:px-16 py-8 md:py-12 xl:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <SectionTitle
          icon={<Lock className="h-5 w-5" />}
          title="Tecnología VPN"
          subtitle="Stack diseñado para rotar y proteger"
        />

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {[
            {
              icon: <Server className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />,
              title: "Servidores inteligentes",
              desc: "Detectan cambios de la operadora y ajustan el túnel automáticamente.",
            },
            {
              icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />,
              title: "Rotación automática",
              desc: "Cuando un nodo cae, otro toma el control sin que tengas que tocar nada.",
            },
            {
              icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />,
              title: "Optimización mobile",
              desc: "Cifrado ligero pensado para no drenar batería ni recursos.",
            },
            {
              icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />,
              title: "Privacidad real",
              desc: "Sin logs y con tráfico cifrado de extremo a extremo.",
            },
          ].map((tech) => (
            <article key={tech.title} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5">
              <div className="mb-2 flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 items-center justify-center rounded-lg border border-gray-300 bg-indigo-50 text-emerald-600">
                {tech.icon}
              </div>
              <Title as="h3">{tech.title}</Title>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-700">{tech.desc}</p>
            </article>
          ))}
        </div>

        <div className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5">
          <Title as="h3">¿Por qué es diferente?</Title>
          <div className="mt-2 grid gap-3 text-xs sm:text-sm md:text-base text-gray-700 sm:grid-cols-2">
            {["Acceso sin saldo", "Fixes ante bloqueos en horas", "Diseñada para LATAM", "Soporte 24/7 real", "App liviana", "Sin logs"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}