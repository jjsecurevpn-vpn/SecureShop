import { Zap } from "lucide-react";
import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { LinkButton } from "../../../components/Button";

export function CTAFinalSection() {
  return (
    <section className="w-full px-4 md:px-8 xl:px-16 py-8 md:py-12 xl:py-16">
      <div className="max-w-7xl mx-auto rounded-lg border border-gray-200 bg-gray-50 p-3 md:p-4 xl:p-5 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-600">Listo para conectarte</p>
        <Title as="h2" className="mt-2">Probá JJSecure y mantené tu línea activa</Title>
        <Subtitle className="mt-2">
          La app se actualiza con cada fix que lanzamos. Únete al canal para enterarte de las nuevas builds.
        </Subtitle>
        <LinkButton
          variant="primary"
          size="md"
          href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2"
        >
          Descargar JJSecure
          <Zap className="h-4 w-4" />
        </LinkButton>
      </div>
    </section>
  );
}