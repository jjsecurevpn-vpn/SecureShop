import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionTitleProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  iconColor?: string;
}

export function SectionTitle({ icon, title, subtitle, iconColor = "text-purple-500" }: SectionTitleProps) {
  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 ${iconColor}`}>
          {icon}
        </div>
        {subtitle && (
          <span className="text-sm text-gray-500">{subtitle}</span>
        )}
      </div>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-gray-900">{title}</h2>
    </motion.div>
  );
}