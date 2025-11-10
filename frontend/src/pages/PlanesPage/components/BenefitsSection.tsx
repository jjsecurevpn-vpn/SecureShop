import { BENEFITS } from "../constants";

export function BenefitsSection() {
  return (
    <section id="section-beneficios" className="py-16 border-b border-neutral-800">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-50 mb-1">{benefit.title}</h3>
                  <p className="text-sm text-neutral-400">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
