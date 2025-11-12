import { ChevronDown } from "lucide-react";
import BottomSheet from "../../../components/BottomSheet";
import { MobileSection } from "../types";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  sections: MobileSection[];
  activeSection: string;
  onSelectGroup: (section: MobileSection) => void;
  onSelectPlan: (section: MobileSection) => void;
  onSelectSection: (section: MobileSection) => void;
};

export function MobileMenu({
  isOpen,
  onClose,
  sections,
  activeSection,
  onSelectGroup,
  onSelectPlan,
  onSelectSection,
}: MobileMenuProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Planes Revendedor"
      subtitle="Elige tu sistema"
    >
      {sections.map((section) => {
        if (section.isGroup) {
          return (
            <button
              key={section.id}
              onClick={() => onSelectGroup(section)}
              className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 ${
                activeSection === section.id
                  ? "bg-violet-600/10 border-l-4 border-violet-500"
                  : "hover:bg-neutral-800"
              }`}
            >
              {section.icon}
              <div className="text-left flex-1">
                <div className="font-medium">{section.label}</div>
                {section.subtitle && <div className="text-xs text-gray-400">{section.subtitle}</div>}
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  section.isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          );
        }

        if (section.isPlan && section.planId) {
          return (
            <button
              key={section.id}
              onClick={() => onSelectPlan(section)}
              className={`w-full flex items-center gap-3 px-4 py-3 ml-8 border-b border-neutral-800/20 ${
                activeSection === section.id
                  ? "bg-violet-600/5 border-l-2 border-violet-500"
                  : "hover:bg-neutral-800/50"
              }`}
            >
              {section.icon}
              <div className="text-left">
                <div className="font-medium text-sm">{section.label}</div>
                {section.subtitle && <div className="text-xs text-gray-500">{section.subtitle}</div>}
              </div>
            </button>
          );
        }

        return (
          <button
            key={section.id}
            onClick={() => onSelectSection(section)}
            className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 ${
              activeSection === section.id
                ? "bg-violet-600/10 border-l-4 border-violet-500"
                : "hover:bg-neutral-800"
            }`}
          >
            {section.icon}
            <div className="text-left">
              <div className="font-medium">{section.label}</div>
              {section.subtitle && <div className="text-xs text-gray-400">{section.subtitle}</div>}
            </div>
          </button>
        );
      })}
    </BottomSheet>
  );
}
