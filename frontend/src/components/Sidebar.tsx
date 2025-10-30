import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Home, Users, CreditCard, Store, FileText, Shield } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
  section: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      window.location.href = "/#" + sectionId;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: "Inicio",
      action: () => (window.location.href = "/"),
      section: "main",
    },
    {
      icon: Users,
      label: "Sobre Nosotros",
      action: () => scrollToSection("about-section"),
      section: "main",
    },
    {
      icon: CreditCard,
      label: "Planes",
      action: () => (window.location.href = "/planes"),
      section: "main",
    },
    {
      icon: Store,
      label: "Revendedores",
      action: () => (window.location.href = "/revendedores"),
      section: "main",
    },
    {
      icon: FileText,
      label: "Términos",
      action: () => (window.location.href = "/terminos"),
      section: "legal",
    },
    {
      icon: Shield,
      label: "Privacidad",
      action: () => (window.location.href = "/privacidad"),
      section: "legal",
    },
  ];

  // Determinar si el sidebar debe estar expandido
  const isExpanded = isOpen || isHovered;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-neutral-900 border-r border-neutral-800 transition-all duration-200 ease-out pt-14 ${
          isOpen ? "block" : "hidden md:block"
        }`}
        style={{ width: isExpanded ? "208px" : "56px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full py-2 px-2">
          {/* Menu Items */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isFirstItem = index === 0;
            const needsSeparator = index === 4; // Después de Revendedores

            return (
              <div key={index}>
                {needsSeparator && (
                  <div className="my-2 mx-0 border-t border-neutral-800" />
                )}
                <button
                  onClick={item.action}
                  className={`
                    flex items-center w-full h-9 mx-0 mb-1 px-3 rounded
                    text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800
                    transition-colors duration-150
                    ${isFirstItem ? "text-neutral-200 bg-neutral-800" : ""}
                  `}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <span
                    className={`
                      ml-3 text-sm whitespace-nowrap transition-opacity duration-200
                      ${isExpanded ? "opacity-100" : "opacity-0"}
                    `}
                    style={{
                      display: isExpanded ? "block" : "none",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}

          {/* Toggle button at bottom */}
          <div className="mt-auto mb-2 mx-0">
            <button className="flex items-center justify-center w-full h-9 px-3 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors duration-150">
              <div className="flex items-center justify-center w-5 h-5">
                <div className="w-3 h-3 border border-current rounded" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
