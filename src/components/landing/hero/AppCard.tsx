"use client";

import React from "react";

export interface AppCardProps {
  icon?: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AppCard({
  icon,
  label,
  children,
  className = "",
}: AppCardProps) {
  return (
    <div
      className={`
        w-full h-full flex flex-col overflow-hidden rounded-2xl border
        bg-[#1c1c1f] border-white/10 ${className}
      `.trim()}
    >
      {/* Title Bar */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/10 shrink-0">
        <span className="w-2 h-2 rounded-full bg-white/30" />
        <span className="flex items-center gap-1.5 text-xs text-white/55 font-medium tracking-wide">
          {icon && <span className="text-white/40">{icon}</span>}
          {label}
        </span>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
