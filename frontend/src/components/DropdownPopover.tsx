import { ReactNode } from "react";
import { X } from "lucide-react";

interface DropdownPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  position?: string;
  arrowPosition?: string;
  width?: string;
}

export default function DropdownPopover({
  isOpen,
  onClose,
  title,
  icon,
  children,
  position = "right-4",
  arrowPosition = "right-8",
  width = "w-80",
}: DropdownPopoverProps) {
  if (!isOpen) return null;

  return (
    <div className={`${position} mt-2 ${width} rounded-xl py-2 shadow-lg bg-white ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
      {/* Arrow pointing up */}
      <div className={`absolute -top-2 ${arrowPosition} w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-white`}></div>

      <div className="px-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-gray-700">{icon}</span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2">
        {children}
      </div>
    </div>
  );
}
