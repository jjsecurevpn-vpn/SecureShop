import { Shield, Zap, Globe, Users, Sparkles } from "lucide-react";

interface AvisoConfig {
  habilitado?: boolean;
  texto?: string;
  bgColor?: string;
  textColor?: string;
  subtitulo?: string;
  variant?: "pill" | "banner";
  icon?: string;
  compact?: boolean;
}

interface NewsBannerProps {
  aviso: AvisoConfig;
}

export default function NewsBanner({ aviso }: NewsBannerProps) {
  if (!aviso?.habilitado) return null;

  const iconKey = aviso.icon ? aviso.icon.toLowerCase() : "sparkles";
  const Icon =
    iconKey === "shield"
      ? Shield
      : iconKey === "zap"
      ? Zap
      : iconKey === "globe"
      ? Globe
      : iconKey === "users"
      ? Users
      : Sparkles;

  if (aviso.variant === "banner") {
    return (
      <div
        className={`w-full py-3 mt-8 text-center backdrop-blur-sm ${
          aviso.bgColor ? aviso.bgColor : "bg-purple-600/90"
        }`}
        role="status"
        aria-live="polite"
      >
        <p
          className={`font-medium text-sm md:text-base ${
            aviso.textColor || "text-white"
          }`}
        >
          {aviso.texto || ""}
        </p>
      </div>
    );
  }

  // Default: pill variant (compact and elegant)
  return (
    <div className="flex justify-center">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
          aviso.bgColor ? aviso.bgColor : "bg-white/3"
        } ${aviso.textColor ? aviso.textColor : "text-white/90"}`}
        role="status"
        aria-live="polite"
      >
        <Icon className="w-4 h-4 text-yellow-300" />
        <span className="max-w-[24rem] truncate">{aviso.texto || ""}</span>
      </div>
    </div>
  );
}
