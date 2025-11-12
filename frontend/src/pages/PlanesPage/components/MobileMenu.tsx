import BottomSheet from "../../../components/BottomSheet";
import { SectionItem } from "../types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionItem[];
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export function MobileMenu({ isOpen, onClose, sections, activeSection, onSelectSection }: MobileMenuProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Navegación" subtitle="Secciones">
      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              onSelectSection(section.id);
              onClose();
              setTimeout(() => {
                document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeSection === section.id
                ? "bg-violet-900/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
