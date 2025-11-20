import { HeroSection } from "./components/HeroSection";
import { QuickStatsSection } from "./components/QuickStatsSection";
import { MisionSection } from "./components/MisionSection";
import { ComoFuncionaSection } from "./components/ComoFuncionaSection";
import { CasosUsoSection } from "./components/CasosUsoSection";
import { TecnologiaSection } from "./components/TecnologiaSection";
import { ValoresSection } from "./components/ValoresSection";
import { TestimoniosSection } from "./components/TestimoniosSection";
import { CTAFinalSection } from "./components/CTAFinalSection";

interface AboutPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export default function AboutPage({ }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Main Content */}
      <main className="pb-20 md:ml-14">
        <HeroSection />
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
            <QuickStatsSection />
            <MisionSection />
            <ComoFuncionaSection />
            <CasosUsoSection />
            <TecnologiaSection />
            <ValoresSection />
            <TestimoniosSection />
            <CTAFinalSection />
          </div>
        </div>
      </main>
    </div>
  );
}