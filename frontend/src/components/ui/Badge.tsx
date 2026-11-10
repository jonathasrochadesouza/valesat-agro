"use client";

import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "emerald" | "cyan" | "amber" | "rose" | "violet" | "slate";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "emerald",
  size = "md",
  dot = false,
  className,
}) => {
  const variantStyles = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    slate: "bg-slate-800/60 text-slate-300 border-slate-700/50",
  };

  const dotStyles = {
    emerald: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
    cyan: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
    amber: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
    rose: "bg-rose-400 shadow-[0_0_8px_#f87171]",
    violet: "bg-violet-400 shadow-[0_0_8px_#a78bfa]",
    slate: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 tracking-tight font-medium",
    md: "text-xs px-2.5 py-1 tracking-normal font-semibold",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border shadow-sm backdrop-blur-md transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={clsx("w-1.5 h-1.5 rounded-full", dotStyles[variant])} />}
      {children}
    </span>
  );
};
