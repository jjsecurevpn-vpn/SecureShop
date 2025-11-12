import { ReactNode } from "react";

interface Section {
  id: string;
  label: string;
  icon: ReactNode;
  subtitle?: string;
}

interface NavigationSidebarProps {
  title: string;
  subtitle: string;
  sections: Section[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  sectionIdPrefix?: string;
  children?: ReactNode;
}

export default function NavigationSidebar({
  title,
  subtitle,
  sections,
  activeSection,
  onSectionChange,
  sectionIdPrefix = "",
  children,
}: NavigationSidebarProps) {
  const handleSectionClick = (id: string) => {
    onSectionChange(id);
    document
      .getElementById(`${sectionIdPrefix}${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <aside className="hidden md:block fixed left-14 top-12 bottom-0 w-64 bg-[#171717] border-r border-white/5 z-10">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>

      <nav className="p-4 space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
              activeSection === section.id
                ? "bg-violet-900/20 text-violet-300 border-l-2 border-violet-400"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {section.icon}
            <div className="text-left">
              <div>{section.label}</div>
              {section.subtitle && (
                <div className="text-xs opacity-70">{section.subtitle}</div>
              )}
            </div>
          </button>
        ))}
      </nav>

      {children}
    </aside>
  );
}
