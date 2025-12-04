import { useState, useRef, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { ContactIcon } from "./Icons";

const WhatsAppIcon = () => (
  <img src="/whatsapp-color.svg" alt="WhatsApp" className="w-8 h-8" />
);

const InstagramIcon = () => (
  <img src="/instagram-2016-logo-svgrepo-com.svg" alt="Instagram" className="w-8 h-8" />
);

const TelegramIcon = () => (
  <img src="/telegramicon.svg" alt="Telegram" className="w-8 h-8" />
);

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const contactOptions = [
    {
      name: "WhatsApp",
      href: "https://wa.me/5493812531123",
      icon: <WhatsAppIcon />,
      description: "Chat directo",
    },
    {
      name: "Telegram",
      href: "https://t.me/JHServices",
      icon: <TelegramIcon />,
      description: "Respuesta rápida",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/jjsecure.vpn/",
      icon: <InstagramIcon />,
      description: "Síguenos",
    },
  ];

  return (
    <div className="relative overflow-visible" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
          isOpen
            ? "bg-purple-200 text-purple-700"
            : "bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Contacto"
      >
        {isOpen ? <X className="w-5 h-5" /> : <ContactIcon className="w-5 h-5" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 w-72 md:w-96 md:absolute md:top-full md:mt-2 rounded-xl py-2 shadow-lg bg-white ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 mx-auto">
          {/* Arrow pointing up - hidden on mobile */}
          <div className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-white"></div>

          {/* Header */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-xl">
                <ContactIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Contáctanos</h3>
                <p className="text-xs text-gray-500">Elige tu canal preferido</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="px-2 py-1">
            {contactOptions.map((option) => (
              <a
                key={option.name}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-gray-100"
              >
                {option.name === "Instagram" || option.name === "WhatsApp" || option.name === "Telegram" ? (
                  <div className="group-hover:scale-110 transition-transform">
                    {option.icon}
                  </div>
                ) : (
                  <div className="p-1.5 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform">
                    {option.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{option.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}