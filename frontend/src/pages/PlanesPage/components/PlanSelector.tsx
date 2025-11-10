import { Check, Smartphone, Timer, Wifi } from "lucide-react";
import { Plan } from "../../../types";

interface PlanSelectorProps {
  diasDisponibles: number[];
  dispositivosDisponibles: number[];
  diasSeleccionados: number;
  dispositivosSeleccionados: number;
  onSelectDias: (dias: number) => void;
  onSelectDispositivos: (dispositivos: number) => void;
  planSeleccionado?: Plan;
  precioPorDia: string;
  onOpenDemo: () => void;
  onComprar: () => void;
}

export function PlanSelector({
  diasDisponibles,
  dispositivosDisponibles,
  diasSeleccionados,
  dispositivosSeleccionados,
  onSelectDias,
  onSelectDispositivos,
  planSeleccionado,
  precioPorDia,
  onOpenDemo,
  onComprar,
}: PlanSelectorProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide">Duración del plan</h3>
          <p className="text-xs text-neutral-500 mt-1">Selecciona cuántos días necesitas</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {diasDisponibles.map((dias) => (
            <button
              key={dias}
              onClick={() => onSelectDias(dias)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                diasSeleccionados === dias
                  ? "bg-purple-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              {dias}d
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide">
            Dispositivos simultáneos
          </h3>
          <p className="text-xs text-neutral-500 mt-1">¿Cuántos dispositivos necesitas conectar?</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dispositivosDisponibles.map((dispositivos) => (
            <button
              key={dispositivos}
              onClick={() => onSelectDispositivos(dispositivos)}
              className={`relative p-4 rounded-lg border transition-all duration-200 ${
                dispositivosSeleccionados === dispositivos
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600"
              }`}
            >
              {dispositivosSeleccionados === dispositivos && (
                <div className="absolute -top-2 -right-2 bg-purple-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <p className="text-xl font-bold text-neutral-50">{dispositivos}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {dispositivos === 1 ? "Dispositivo" : "Dispositivos"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {planSeleccionado && (
        <div className="space-y-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-neutral-400 text-sm">Costo diario</span>
              <span className="text-emerald-400 text-lg font-semibold">${precioPorDia}/día</span>
            </div>
            <div className="border-t border-neutral-800 pt-4 flex justify-between items-baseline">
              <span className="text-neutral-50 font-medium">Total</span>
              <span className="text-4xl font-bold text-neutral-50">
                ${planSeleccionado.precio.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenDemo}
              className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold text-neutral-200 transition-colors"
            >
              Prueba gratis (2 horas)
            </button>
            <button
              onClick={onComprar}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold text-white transition-colors"
            >
              Comprar ahora
            </button>
          </div>

          <div className="space-y-4 pt-4">
            {[
              {
                icon: Timer,
                title: `${planSeleccionado.dias} días de acceso`,
                desc: "Acceso completo a toda nuestra red de servidores VPN",
              },
              {
                icon: Smartphone,
                title: `${dispositivosSeleccionados} dispositivo${
                  dispositivosSeleccionados !== 1 ? "s" : ""
                } simultáneamente`,
                desc: "Conecta desde múltiples dispositivos al mismo tiempo",
              },
              {
                icon: Wifi,
                title: "Velocidad ilimitada",
                desc: "Disfruta de velocidades máximas sin restricciones",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-3">
                  <Icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-50">{feature.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
