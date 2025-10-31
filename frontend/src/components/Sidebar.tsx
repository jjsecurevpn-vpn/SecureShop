import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, CreditCard, Store, FileText, Shield, ChevronLeft } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
  section: string;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: "Inicio",
      action: () => navigate("/"),
      section: "main",
      path: "/",
    },
    {
      icon: Users,
      label: "Sobre Nosotros",
      action: () => navigate("/sobre-nosotros"),
      section: "main",
      path: "/sobre-nosotros",
    },
    {
      icon: CreditCard,
      label: "Planes",
      action: () => navigate("/planes"),
      section: "main",
      path: "/planes",
    },
    {
      icon: Store,
      label: "Revendedores",
      action: () => navigate("/revendedores"),
      section: "main",
      path: "/revendedores",
    },
    {
      icon: FileText,
      label: "Términos",
      action: () => navigate("/terminos"),
      section: "legal",
      path: "/terminos",
    },
    {
      icon: Shield,
      label: "Privacidad",
      action: () => navigate("/privacidad"),
      section: "legal",
      path: "/privacidad",
    },
  ];

  const isExpanded = isOpen || isHovered;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-neutral-900 border-r border-neutral-800 pt-16 transition-all duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ width: isExpanded ? "208px" : "56px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const needsSeparator = index === 4;

              return (
                <React.Fragment key={index}>
                  {needsSeparator && (
                    <div className="my-2 border-t border-neutral-800" />
                  )}
                  <button
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className={`
                      flex items-center w-full h-9 px-3 rounded-md
                      transition-colors duration-150
                      ${
                        isActive
                          ? "text-neutral-200 bg-neutral-800"
                          : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    {isExpanded && (
                      <span className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200">
                        {item.label}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-neutral-800 p-2">
            <button
              onClick={() => setIsHovered(!isHovered)}
              className="flex items-center justify-center w-full h-9 px-3 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors duration-150"
              title={isExpanded ? "Contraer sidebar" : "Expandir sidebar"}
            >
              <div className="flex items-center justify-center w-5 h-5">
                <ChevronLeft
                  size={20}
                  strokeWidth={1.5}
                  className={`transition-transform duration-200 ${
                    isExpanded ? "rotate-0" : "rotate-180"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div
        className="hidden md:block flex-shrink-0 transition-all duration-200"
        style={{ width: isExpanded ? "208px" : "56px" }}
      />
    </>
  );
};

export default Sidebar;