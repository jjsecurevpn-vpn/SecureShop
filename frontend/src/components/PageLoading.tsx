import React from "react";
import { Loader2 } from "lucide-react";

const PageLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-neutral-900/95 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-neutral-300 text-sm font-medium">Cargando...</p>
      </div>
    </div>
  );
};

export default PageLoading;
