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
    <div className={`absolute top-full ${position} mt-2 ${width} bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
      {/* Arrow pointing up */}
      <div className={`absolute -top-2 ${arrowPosition} w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-neutral-900`}></div>
      {/* Arrow border for better visibility */}
      <div className={`absolute -top-3 ${arrowPosition} w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-neutral-800`}></div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
