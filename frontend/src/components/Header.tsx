import { Link } from "react-router-dom";
import { Menu, X, HandHeart } from "lucide-react";
import ContactButton from "./ContactButton";
import NoticiasPopover from "./NoticiasPopover";
import CuponesPopover from "./CuponesPopover";

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
}

const Header = ({ sidebarOpen, onSidebarToggle }: HeaderProps) => {

  return (
    <>
      {/* Fixed Header */}
      <header className="sticky top-0 left-0 right-0 bg-neutral-900 text-white text-sm py-3 w-full z-[9999] flex items-center justify-between px-4">
        {/* Left side: Menu button and logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSidebarToggle(!sidebarOpen)}
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
            <img
              src="/JJSecureLogoTXT.svg"
              alt="JJSecure VPN"
              className="hidden md:inline h-6 w-auto"
            />
          </Link>
        </div>

        {/* Right side: Download button, Notifications and user info */}
        <div className="flex items-center gap-3">
          <Link
            to="/donaciones"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-200 text-sm font-medium hover:bg-indigo-500/20 transition-colors"
          >
            <HandHeart className="w-4 h-4" />
            <span className="hidden sm:inline">Donar</span>
          </Link>
          {/* Contact Button */}
          <ContactButton />
          {/* Cupones Popover */}
          <CuponesPopover />
          {/* News Popover */}
          <NoticiasPopover />
        </div>
      </header>
    </>
  );
};

export default Header;
