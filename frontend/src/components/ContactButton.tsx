import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Mail, Send, Phone, ChevronRight } from "lucide-react";

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
      icon: <Phone className="w-4 h-4" />,
      description: "Chat directo",
      color: "hover:border-green-500/30 hover:bg-green-500/5",
      iconColor: "text-green-400",
    },
    {
      name: "Telegram",
      href: "https://t.me/JHServices",
      icon: <Send className="w-4 h-4" />,
      description: "Respuesta rápida",
      color: "hover:border-blue-500/30 hover:bg-blue-500/5",
      iconColor: "text-blue-400",
    },
    {
      name: "Email",
      href: "mailto:jjsecurevpn@gmail.com",
      icon: <Mail className="w-4 h-4" />,
      description: "Soporte técnico",
      color: "hover:border-purple-500/30 hover:bg-purple-500/5",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
          isOpen
            ? "bg-neutral-800 border-neutral-700 text-neutral-200"
            : "bg-transparent border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 hover:border-neutral-600"
        }`}
        aria-label="Contacto"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <MessageCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">Contáctanos</h3>
                <p className="text-xs text-neutral-500">Elige tu canal preferido</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-2">
            {contactOptions.map((option) => (
              <a
                key={option.name}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 px-3 py-3 rounded-lg border border-transparent transition-all ${option.color}`}
              >
                <div className={`p-2 bg-neutral-800 border border-neutral-700 rounded-lg ${option.iconColor} group-hover:scale-110 transition-transform`}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-200">{option.name}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{option.description}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-900/50">
            <p className="text-xs text-neutral-500 text-center">
              Disponible 24/7 para ayudarte
            </p>
          </div>
        </div>
      )}
    </div>
  );
}