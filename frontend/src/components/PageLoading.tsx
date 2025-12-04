import React from "react";
import { Loader2 } from "lucide-react";

const PageLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[rgb(17,7,35)] z-[99999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-neutral-300 text-sm font-medium">Cargando...</p>
      </div>
    </div>
  );
};

export default PageLoading;
