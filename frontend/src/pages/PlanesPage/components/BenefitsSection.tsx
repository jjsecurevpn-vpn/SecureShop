import { BENEFITS } from "../constants";
import { Title } from "../../../components/Title";

export function BenefitsSection() {
  return (
    <section id="section-beneficios" className="bg-white py-8 md:py-12 xl:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16">
        <div className="mb-16 text-center">
          <p className="text-xs sm:text-sm lg:text-base uppercase tracking-[0.3em] text-emerald-600 font-semibold">Beneficios</p>
          <Title as="h2" center className="mt-3">
            Lo que viene con cada plan
          </Title>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.title}
                className="flex gap-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm p-5 md:p-6 xl:p-8 shadow-lg transition"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 xl:h-14 xl:w-14 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex-shrink-0">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 xl:h-7 xl:w-7" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base xl:text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-1 text-xs md:text-sm xl:text-base text-gray-600">{benefit.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
