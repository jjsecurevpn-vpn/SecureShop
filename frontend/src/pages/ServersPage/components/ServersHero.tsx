import Lottie from "lottie-react";
import serversAnimation from "../../../assets/lottie/servers-hero.json";

export function ServersHero() {
  return (
    <section className="w-full bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white pt-8 sm:pt-10 lg:pt-12 xl:pt-16 pb-12 sm:pb-16 lg:pb-20 xl:pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12 items-center lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-6 order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-300 px-4 py-2 text-emerald-700 text-sm sm:text-base lg:text-lg xl:text-xl font-medium">
                Red global segura
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Monitoreo en tiempo real de todos los servidores
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto lg:mx-0">
                Visualiza el estado, consumo de recursos y disponibilidad de la red JJSecure con datos actualizados cada pocos segundos.
              </p>
            </div>

            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="w-full max-w-sm md:max-w-md">
                <Lottie animationData={serversAnimation as unknown as object} autoplay loop />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
