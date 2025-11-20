import { ReactNode } from "react";

interface SectionTitleProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function SectionTitle({ icon, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 text-sm text-gray-700">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-indigo-50 text-emerald-600">
          {icon}
        </div>
        {subtitle && (
          <span className="text-xs uppercase tracking-[0.3em] text-gray-600">{subtitle}</span>
        )}
      </div>
      <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-gray-900">{title}</h2>
    </div>
  );
}