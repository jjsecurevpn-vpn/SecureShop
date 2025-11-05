import { Menu } from "lucide-react";

interface MobilePageHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function MobilePageHeader({
  title,
  onMenuClick,
}: MobilePageHeaderProps) {
  return (
    <div className="sticky top-0 left-0 right-0 z-30 bg-[#171717] border-b border-white/5 px-5 py-3 flex items-center justify-between md:hidden">
      <h1 className="text-lg font-medium">{title}</h1>
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}
