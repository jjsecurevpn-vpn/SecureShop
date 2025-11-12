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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Menú" subtitle="Navega las secciones">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => {
            onSelectSection(section.id);
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 text-left ${
            activeSection === section.id
              ? "bg-violet-600/10 border-l-4 border-violet-500"
              : "hover:bg-neutral-800/50"
          }`}
        >
          {section.icon}
          <div>
            <div className="font-medium text-neutral-200">{section.label}</div>
          </div>
        </button>
      ))}
    </BottomSheet>
  );
}
