import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  MessageCircleQuestion,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import NavigationSidebar from "../components/NavigationSidebar";
import BottomSheet from "../components/BottomSheet";
import { Sponsor } from "../types";
import { apiService } from "../services/api.service";

interface SponsorsPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const SponsorsPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SponsorsPageProps) => {
  const [activeSection, setActiveSection] = useState("featured");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoadingSponsors(true);
        const data = await apiService.obtenerSponsors();
        setSponsors(data);
        setSponsorsError(null);
      } catch (error) {
        console.error("Error cargando sponsors:", error);
        setSponsorsError(error instanceof Error ? error.message : "Error al cargar sponsors");
      } finally {
        setLoadingSponsors(false);
      }
    };

    fetchSponsors();
  }, []);

  const sections = useMemo(
    () => [
      { id: "featured", label: "Destacados", icon: <Star className="h-4 w-4" /> },
      { id: "empresas", label: "Empresas", icon: <Building2 className="h-4 w-4" /> },
      { id: "personas", label: "Personas", icon: <Users className="h-4 w-4" /> },
      { id: "beneficios", label: "Beneficios", icon: <BadgeCheck className="h-4 w-4" /> },
      { id: "participar", label: "Participar", icon: <Sparkles className="h-4 w-4" /> },
      { id: "faq", label: "FAQ", icon: <MessageCircleQuestion className="h-4 w-4" /> },
    ],
    [],
  );

  const highlightedSponsors = useMemo(() => sponsors.filter((s) => s.highlight), [sponsors]);
  const companySponsors = useMemo(() => sponsors.filter((s) => s.category === "empresa"), [sponsors]);
  const individualSponsors = useMemo(() => sponsors.filter((s) => s.category === "persona"), [sponsors]);

  const SponsorCard = ({ sponsor, featured = false }: { sponsor: Sponsor; featured?: boolean }) => (
    <article
      className={`group rounded-lg border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        featured ? "border-violet-700/60 bg-violet-950/20" : "border-neutral-800/70 bg-neutral-900/40"
      }`}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                featured
                  ? "border-violet-600/60 bg-violet-600/15 text-violet-200"
                  : "border-neutral-700/60 bg-neutral-800/50 text-neutral-300"
              }`}
            >
              {sponsor.avatarUrl ? (
                <img
                  src={sponsor.avatarUrl}
                  alt={`Logo de ${sponsor.name}`}
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                sponsor.avatarInitials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white">{sponsor.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">
                {sponsor.category === "empresa" ? "Empresarial" : "Personal"}
              </p>
            </div>
          </div>
          {sponsor.link && (
            <a
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 transition-colors hover:text-violet-200"
            >
              <ArrowUpRight className="h-4 w-4 text-neutral-400" />
            </a>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Rol</p>
          <p className="text-sm text-neutral-100">{sponsor.role}</p>
        </div>

        <p className="line-clamp-2 text-sm text-neutral-300">{sponsor.message}</p>
      </div>
    </article>
  );

  const SponsorGrid = ({ items, featured = false, empty = "Sin sponsors en esta sección" }: { items: Sponsor[]; featured?: boolean; empty?: string }) => {
    if (loadingSponsors) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg border border-neutral-800/50 bg-neutral-900/40" />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-neutral-800/50 bg-neutral-900/20 py-12 text-center text-sm text-neutral-500">
          {empty}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} featured={featured} />
        ))}
      </div>
    );
  };

  const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 text-sm text-neutral-400">{description}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <NavigationSidebar
        title="Muro de Sponsors"
        subtitle="Agradecemos a quienes sostienen la red"
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sectionIdPrefix="section-"
      />

      <main className="flex min-h-screen flex-col md:ml-[312px]">
        <div className="flex-1">
          {/* Featured */}
          <section id="section-featured" className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
              <SectionHeader
                title="Destacados del mes"
                description="Empresas y personas que impulsan iniciativas clave de la red"
              />
              {sponsorsError && (
                <div className="mb-6 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-3 text-sm text-red-300">
                  {sponsorsError}
                </div>
              )}
              <SponsorGrid items={highlightedSponsors} featured empty="Aún no hay sponsors destacados" />
            </div>
          </section>

          {/* Companies */}
          <section id="section-empresas" className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
              <SectionHeader
                title="Empresas"
                description="Organizaciones que sostienen nuestra infraestructura"
              />
              <SponsorGrid
                items={companySponsors}
                empty="Este espacio está disponible para nuevas empresas patrocinadoras"
              />
            </div>
          </section>

          {/* Individuals */}
          <section id="section-personas" className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
              <SectionHeader
                title="Personas"
                description="Miembros de la comunidad que dejan huella en JJSecure"
              />
              <SponsorGrid
                items={individualSponsors}
                empty="Este espacio está disponible para nuevos perfiles personales"
              />
            </div>
          </section>

          {/* Benefits */}
          <section id="section-beneficios" className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">Beneficios</h2>
                <p className="mt-3 text-neutral-400">Diseñados para acompañar a quienes confían en nosotros</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Visibilidad activa",
                    description: "Exposición prioritaria en el muro y comunicación mensual dedicada",
                  },
                  {
                    title: "Acceso anticipado",
                    description: "Participación en betas privadas y lanzamientos tempranos",
                  },
                  {
                    title: "Reportes trimestrales",
                    description: "Detalle de impacto, roadmap y métricas clave de infraestructura",
                  },
                  {
                    title: "Mesa directa",
                    description: "Espacios de feedback con el equipo núcleo y acceso a soporte dedicado",
                  },
                  {
                    title: "Beneficios para tu equipo",
                    description: "Planes especiales para staff, comunidad y clientes",
                  },
                  {
                    title: "Eventos privados",
                    description: "Invitaciones a encuentros sobre seguridad, privacidad y redes",
                  },
                ].map((benefit) => (
                  <article
                    key={benefit.title}
                    className="rounded-lg border border-neutral-800/70 bg-neutral-900/40 p-6 transition-colors hover:border-neutral-700/70"
                  >
                    <h3 className="mb-2 font-semibold text-white">{benefit.title}</h3>
                    <p className="text-sm text-neutral-400">{benefit.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Participate */}
          <section id="section-participar" className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
              <div className="rounded-lg border border-neutral-800/70 bg-neutral-900/40 p-8 sm:p-12">
                <h2 className="mb-4 text-3xl font-semibold text-white sm:text-4xl">¿Cómo participar?</h2>
                <p className="mb-10 text-neutral-400">Tres pasos simples para sumarte y aparecer en el muro</p>

                <div className="mb-10 grid gap-6 sm:grid-cols-3">
                  {["Realiza tu donación", "Envíanos logo o mensaje", "Publicamos tu presencia"].map((step, i) => (
                    <article key={step} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-700/60 bg-neutral-800/50 text-sm font-semibold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-300">{step}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Link
                    to="/donaciones"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-neutral-100"
                  >
                    Empezar ahora
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="section-faq" className="py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
              <h2 className="mb-12 text-center text-3xl font-semibold text-white sm:text-4xl">
                Preguntas frecuentes
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "¿Hay un monto mínimo?",
                    a: "Coordinamos cada aporte de forma personalizada. Resguardamos siempre la confidencialidad del sponsor.",
                  },
                  {
                    q: "¿Puedo actualizar logo o mensaje?",
                    a: "Sí. Enviás los datos y los reflejamos en menos de 48 horas.",
                  },
                  {
                    q: "¿Cómo se validan las donaciones empresariales?",
                    a: "Solicitamos comprobantes o datos fiscales para asegurar transparencia y trazabilidad.",
                  },
                  {
                    q: "¿Es posible donar de forma anónima?",
                    a: "Claro. Podés aparecer con un alias o mantener total anonimato.",
                  },
                ].map((item) => (
                  <article
                    key={item.q}
                    className="rounded-lg border border-neutral-800/70 bg-neutral-900/40 p-6 transition-colors hover:border-neutral-700/70"
                  >
                    <h3 className="mb-2 font-semibold text-white">{item.q}</h3>
                    <p className="text-sm text-neutral-400">{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-neutral-900/50 py-12 md:ml-0">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 text-center text-sm text-neutral-500">
            Gracias por sostener la misión de privacidad abierta de JJSecure VPN.
          </div>
        </footer>
      </main>

      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document
                    .getElementById(`section-${section.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 300);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-violet-500/20 text-violet-200"
                  : "text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default SponsorsPage;
