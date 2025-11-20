import { BENEFITS } from "../constants";

export function BenefitsSection() {
  return (
    <section id="section-beneficios" className="bg-white py-12 sm:py-16 lg:py-20 xl:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-16 text-center">
          <p className="text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-[0.3em] text-emerald-600 font-semibold">Beneficios</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900">Lo que viene con cada plan</h2>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 xl:gap-10 md:grid-cols-2 lg:grid-cols-2">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.title}
                className="flex gap-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm p-5 sm:p-6 lg:p-8 xl:p-10 shadow-lg transition"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex-shrink-0">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600">{benefit.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
