const STATS = [
  { label: "Usuarios Activos", value: "15K+" },
  { label: "Disponibilidad", value: "99.9%" },
  { label: "Soporte", value: "24/7" },
];

export function QuickStatsSection() {
  return (
    <section className="mb-16 grid gap-4 p-6 sm:p-8 lg:p-10 xl:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-6 lg:p-8 xl:p-10 text-center">
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-[0.3em] text-gray-600">{stat.label}</p>
              <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-emerald-600">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}