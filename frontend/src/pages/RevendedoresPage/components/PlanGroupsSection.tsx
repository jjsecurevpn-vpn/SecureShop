import {
  AlertCircle,
  Check,
  ChevronRight,
  Maximize,
  RefreshCw,
  Star,
  Zap as Zap2,
  Clock,
  Users,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { PlanRevendedor } from "../../../types";
import { PlanGroup } from "../types";

interface PlanGroupsSectionProps {
  groups: PlanGroup[];
  expandedPlanId: number | null;
  onTogglePlan: (planId: number) => void;
  onConfirmarCompra: (plan: PlanRevendedor) => void;
}

const featureIconMap = {
  zap: Zap2,
  clock: Clock,
  users: Users,
  "check-circle": CheckCircle,
  "refresh-cw": RefreshCw,
  "dollar-sign": DollarSign,
  maximize: Maximize,
};

export function PlanGroupsSection({ groups, expandedPlanId, onTogglePlan, onConfirmarCompra }: PlanGroupsSectionProps) {
  return (
    <div className="space-y-16">
      {groups.map((group) => (
        <div key={group.id} id={`plan-${group.id}`} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${group.accent} flex-shrink-0`}>
                <div className={group.accentText}>{group.icon}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-3xl font-bold text-neutral-100">{group.title}</h2>
                  {group.recommended && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="w-3.5 h-3.5" />
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="text-lg text-neutral-300 font-medium">{group.subtitle}</p>
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
              <p className="text-neutral-300 leading-relaxed">{group.mainDescription}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {group.keyFeatures.map((feature, index) => {
                const IconComponent = featureIconMap[feature.icon];
                return (
                  <div key={index} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4">
                    <div className="mb-2">{IconComponent && <IconComponent className="w-6 h-6 text-neutral-300" />}</div>
                    <h4 className="font-semibold text-neutral-200 mb-1">{feature.title}</h4>
                    <p className="text-sm text-neutral-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                  <Check className={`w-4 h-4 ${group.accentText}`} />
                  Casos de uso ideales
                </h4>
                <ul className="space-y-2">
                  {group.useCases.map((useCase, index) => (
                    <li key={index} className="flex gap-2 text-neutral-400 text-sm">
                      <span className={`${group.accentText} flex-shrink-0`}>✓</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`border rounded-xl p-4 ${group.accent}`}>
                <h4 className={`font-semibold ${group.accentText} mb-2`}>Mejor para:</h4>
                <p className="text-sm text-neutral-300">{group.bestFor}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-neutral-200">Planes disponibles</h3>
            {group.items.length > 0 ? (
              group.items.map((plan) => (
                <div
                  key={plan.id}
                  id={`plan-${plan.id}`}
                  className={`bg-neutral-900 border rounded-xl overflow-hidden transition-all ${
                    expandedPlanId === plan.id
                      ? "ring-2 ring-violet-500/50 border-violet-500/50 bg-violet-500/5"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <button
                    onClick={() => onTogglePlan(plan.id)}
                    className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors"
                  >
                    <div className="text-left flex-1">
                      <div className="text-lg font-semibold text-neutral-200">{plan.nombre}</div>
                      <div className="text-sm text-neutral-500">
                        {group.id === "creditos" ? "Sistema de Créditos" : "Sistema de Validez"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">
                          ${plan.precio.toLocaleString("es-AR")}
                        </div>
                        <div className="text-xs text-neutral-500">
                          ${(plan.precio / plan.max_users).toFixed(0)} por {group.id === "creditos" ? "crédito" : "usuario"}
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-neutral-400 transition-transform ${
                          expandedPlanId === plan.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedPlanId === plan.id && (
                    <div className="border-t border-neutral-800 bg-neutral-900/50">
                      <div className="p-6 space-y-6">
                        {group.id === "creditos" ? (
                          <>
                            <div>
                              <h4 className="font-semibold text-neutral-200 mb-4">¿Cómo funciona?</h4>
                              <div className="space-y-3">
                                <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                  <div className="text-emerald-400 flex-shrink-0 font-bold min-w-6">1</div>
                                  <div>
                                    <p className="font-medium text-neutral-200">Compras {plan.max_users} créditos</p>
                                    <p className="text-sm text-neutral-400">Se almacenan en tu panel de control</p>
                                  </div>
                                </div>
                                <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                  <div className="text-emerald-400 flex-shrink-0 font-bold min-w-6">2</div>
                                  <div>
                                    <p className="font-medium text-neutral-200">Cómo gastar tus créditos</p>
                                    <p className="text-sm text-neutral-400">
                                      30 días = 1 crédito | 60 días = 2 créditos | 90 días = 3 créditos | etc.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                  <div className="text-emerald-400 flex-shrink-0 font-bold min-w-6">3</div>
                                  <div>
                                    <p className="font-medium text-neutral-200">Cada crédito = 1 conexión independiente</p>
                                    <p className="text-sm text-neutral-400">
                                      La cuenta se mantiene vigente incluso después de vencer tu suscripción
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                              <h4 className="font-semibold text-neutral-200 mb-3">Ejemplo de uso</h4>
                              <div className="space-y-2 text-sm">
                                <p className="text-neutral-300">Tienes {plan.max_users} créditos. Opciones:</p>
                                <ul className="space-y-1 text-neutral-400 ml-4">
                                  <li>• {plan.max_users} cuentas de 30 días ({plan.max_users} × 1 crédito = {plan.max_users} créditos)</li>
                                  <li>
                                    • {Math.floor(plan.max_users / 2)} cuentas de 60 días ({Math.floor(plan.max_users / 2)} × 2 créditos = {Math.floor(plan.max_users / 2) * 2} créditos)
                                  </li>
                                  <li>
                                    • O mezclar: 3 cuentas de 30 días (3 créditos) + 1 cuenta de 60 días (2 créditos) = 5 créditos total
                                  </li>
                                </ul>
                                <p className="text-neutral-300 mt-3">
                                  <strong>Cada crédito = 1 conexión independiente de 30 días</strong>
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h4 className="font-semibold text-neutral-200 mb-4">¿Cómo funciona?</h4>
                              <div className="space-y-3">
                                <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                  <div className="text-blue-400 flex-shrink-0 font-bold min-w-6">1</div>
                                  <div>
                                    <p className="font-medium text-neutral-200">
                                      Pagas suscripción mensual de {plan.max_users} cupos
                                    </p>
                                    <p className="text-sm text-neutral-400">
                                      Tienes <strong className="text-blue-300">30 días</strong> para usar tus {plan.max_users} usuarios
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                  <div className="text-blue-400 flex-shrink-0 font-bold min-w-6">2</div>
                                  <div>
                                    <p className="font-medium text-neutral-200">Creas cuentas durante ese mes</p>
                                    <p className="text-sm text-neutral-400">
                                      Distribuye tus {plan.max_users} usuarios en diferentes cuentas (cualquier duración dentro del mes)
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                  <div className="text-blue-400 flex-shrink-0 font-bold min-w-6">3</div>
                                  <div>
                                    <p className="font-medium text-neutral-200">
                                      Al vencer tu suscripción, todos los usuarios expiran
                                    </p>
                                    <p className="text-sm text-neutral-400">
                                      Los usuarios dependen de tu suscripción, no son independientes como en Créditos
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                              <h4 className="font-semibold text-neutral-200 mb-3">Ejemplo de uso</h4>
                              <div className="space-y-2 text-sm">
                                <p className="text-neutral-300">Tienes plan de {plan.max_users} usuarios por 30 días:</p>
                                <ul className="space-y-2 text-neutral-400 ml-4 font-mono">
                                  <li className="text-neutral-300">
                                    Día 1: <span className="text-blue-400">0/{plan.max_users}</span> usuarios
                                  </li>
                                  <li>→ Creas 3 cuentas de 20 días</li>
                                  <li className="text-neutral-300">
                                    Estado: <span className="text-blue-400">3/{plan.max_users}</span> usuarios
                                  </li>
                                  <li>→ Creas 2 cuentas de 10 días</li>
                                  <li className="text-neutral-300">
                                    Estado: <span className="text-blue-400">5/{plan.max_users}</span> usuarios
                                  </li>
                                  <li>→ Expiran las cuentas de 10 días (día 11)</li>
                                  <li className="text-neutral-300">
                                    Estado: <span className="text-blue-400">3/{plan.max_users}</span> usuarios
                                  </li>
                                  <li>→ Creas 2 nuevas cuentas de 19 días</li>
                                  <li className="text-neutral-300">
                                    Día 30: <span className="text-blue-300">Vence tu suscripción</span>
                                  </li>
                                  <li className="text-neutral-300">
                                    <strong>Todos los usuarios expiran, sin importar su duración individual</strong>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                              <div className="flex gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-blue-300 mb-1">Diferencia clave con Créditos</p>
                                  <p className="text-sm text-blue-200">
                                    Los usuarios están vinculados a tu suscripción mensual. Si esta vence, todos expiran. En Créditos, cada cuenta es independiente y se mantiene vigente después de que la suscripción termina.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <button
                          onClick={() => onConfirmarCompra(plan)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          Comprar ahora
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-neutral-500">No hay planes disponibles</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
