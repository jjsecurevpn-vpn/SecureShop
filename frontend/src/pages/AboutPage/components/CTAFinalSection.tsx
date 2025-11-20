import { Zap } from "lucide-react";

export function CTAFinalSection() {
  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-10 sm:p-12 lg:p-16 xl:p-20 text-center">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-[0.3em] text-gray-600">Listo para conectarte</p>
        <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-gray-900">Probá JJSecure y mantené tu línea activa</h2>
        <p className="mt-3 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700">
          La app se actualiza con cada fix que lanzamos. Únete al canal para enterarte de las nuevas builds.
        </p>
        <a href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-white hover:bg-indigo-700">
          Descargar JJSecure
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
        </a>
      </div>
    </section>
  );
}