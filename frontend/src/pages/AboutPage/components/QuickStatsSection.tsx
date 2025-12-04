import { Title } from "../../../components/Title";

const STATS = [
  { label: "Usuarios Activos", value: "15K+" },
  { label: "Disponibilidad", value: "99.9%" },
  { label: "Soporte", value: "24/7" },
];

export function QuickStatsSection() {
  return (
    <section className="w-full px-4 md:px-8 xl:px-16 py-8 md:py-12 xl:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-4 md:gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-3 md:p-4 xl:p-5 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-600">{stat.label}</p>
              <Title as="h3" className="mt-1 !text-2xl sm:!text-3xl lg:!text-4xl xl:!text-5xl !text-emerald-600">{stat.value}</Title>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}