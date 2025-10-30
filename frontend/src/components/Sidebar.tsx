import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
        className={`fixed inset-y-0 left-0 z-50 bg-neutral-900 border-r border-neutral-800 pt-14 ${
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
            const isActive = location.pathname === item.path;
            const needsSeparator = index === 4; // Después de Revendedores

            return (
              <div key={index}>
                {needsSeparator && (
                  <div className="my-2 mx-0 border-t border-neutral-800" />
                )}
                <button
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`
                    flex items-center w-full h-9 mx-0 mb-1 px-3 rounded
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
                  <span
                    className={`
                      ml-3 text-sm whitespace-nowrap
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

          <div className="mt-auto mb-2 mx-0">
            <button className="flex items-center justify-center w-full h-9 px-3 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800">
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
