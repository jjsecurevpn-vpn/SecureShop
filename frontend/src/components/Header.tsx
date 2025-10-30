import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-neutral-900 text-white text-sm py-3 w-full border-b border-neutral-800 z-[9999] flex items-center justify-between px-4">
        {/* Left side: Menu button and logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="JJSecure VPN"
          >
            <img
              src="/LogoJJSecure.png"
              alt="JJSecure VPN"
              className="h-8 w-auto"
            />
            <span className="hidden md:inline text-lg font-bold text-white">
              JJSecure VPN
            </span>
          </Link>
        </div>

        {/* Right side: Empty for now, can add user info later */}
        <div className="flex items-center gap-3">
          {/* Placeholder for future user info */}
        </div>
      </header>

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Spacer for fixed header */}
      <div className="hidden md:block" style={{ height: "3rem" }} />
    </>
  );
};

export default Header;
