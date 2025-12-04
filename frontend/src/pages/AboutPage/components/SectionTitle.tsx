import { ReactNode } from "react";
import { Title } from "../../../components/Title";

interface SectionTitleProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function SectionTitle({ icon, title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm text-gray-700">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-indigo-50 text-emerald-600">
          {icon}
        </div>
        {subtitle && (
          <span className="text-xs uppercase tracking-[0.3em] text-gray-600">{subtitle}</span>
        )}
      </div>
      <Title as="h2">{title}</Title>
    </div>
  );
}