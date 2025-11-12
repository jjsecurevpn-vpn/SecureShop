import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiService } from "../services/api.service";
import { Donacion } from "../types";
import { CheckCircle2, Loader2, Mail, AlertTriangle, ArrowRight } from "lucide-react";

const MAX_REINTENTOS = 15;

const DonationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [donacion, setDonacion] = useState<Donacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    const donacionId = searchParams.get("donacion_id");
    if (!donacionId) {
      setError("No encontramos la referencia de la donación");
      setLoading(false);
      return;
    }

    let timeout: number | undefined;

    const cargarDonacion = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.obtenerDonacion(donacionId);
        setDonacion(data);

        if (data.estado !== "aprobado" && reintentos < MAX_REINTENTOS) {
          timeout = window.setTimeout(() => {
            setReintentos((prev) => prev + 1);
          }, 2000);
        }
      } catch (err: any) {
        if (reintentos < MAX_REINTENTOS) {
          timeout = window.setTimeout(() => {
            setReintentos((prev) => prev + 1);
          }, 2000);
        } else {
          setError(err.mensaje || err.message || "No pudimos verificar la donación");
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDonacion();

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [searchParams, reintentos]);

  if (loading && !donacion) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          <p className="text-neutral-400 text-sm">
            Confirmando tu donación... ({reintentos}/{MAX_REINTENTOS})
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 mx-auto text-rose-400" />
          <h1 className="text-xl font-semibold">Estamos verificando tu aporte</h1>
          <p className="text-sm text-neutral-400">{error}</p>
          <Link
            to="/donaciones"
            className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl text-sm border border-neutral-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Intentar nuevamente
          </Link>
        </div>
      </div>
    );
  }

  if (!donacion) {
    return null;
  }

  const aprobada = donacion.estado === "aprobado";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-16 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center border ${
            aprobada
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20"
          }`}>
            <CheckCircle2
              className={`w-8 h-8 ${aprobada ? "text-emerald-400" : "text-amber-300"}`}
            />
          </div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            {aprobada ? "¡Gracias por tu donación!" : "Donación en proceso"}
          </h1>
          <p className="text-neutral-400">
            {aprobada
              ? "Tu apoyo nos ayuda a seguir creciendo y mejorar el servicio para toda la comunidad."
              : "Estamos esperando la confirmación del pago desde MercadoPago."}
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-500">
              Referencia
            </span>
            <p className="text-sm font-mono text-neutral-300 break-all mt-1">
              {donacion.id}
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-center">
            <span className="text-sm text-neutral-400">Monto donado</span>
            <p className="text-3xl font-bold text-emerald-300 mt-2">
              ${donacion.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
              <span className="text-xs uppercase tracking-wider text-neutral-500">
                Estado
              </span>
              <p className={`text-lg font-semibold mt-1 ${
                aprobada ? "text-emerald-300" : "text-amber-300"
              }`}>
                {aprobada ? "Aprobada" : "Pendiente"}
              </p>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
              <span className="text-xs uppercase tracking-wider text-neutral-500">
                Email informado
              </span>
              <p className="text-sm text-neutral-300 mt-1">
                {donacion.donante_email || "No informado"}
              </p>
            </div>
          </div>

          {donacion.mensaje && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-sm text-rose-100">
              <p className="font-medium mb-2">Tu mensaje</p>
              <p className="opacity-80">“{donacion.mensaje}”</p>
            </div>
          )}

          {aprobada ? (
            <div className="flex items-center gap-3 text-sm text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-xl p-4">
              <Mail className="w-5 h-5 text-neutral-500" />
              <span>
                Te enviamos un correo a <span className="text-neutral-200 font-medium">{donacion.donante_email}</span> con nuestro agradecimiento.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-xl p-4">
              <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
              <span>
                Apenas MercadoPago confirme tu pago, te enviaremos un email automático.
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link
            to="/"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-200 text-sm transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            to="/donaciones"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl text-white text-sm transition-colors"
          >
            Realizar otra donación
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccessPage;
