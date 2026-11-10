"use client";

import React from "react";
import clsx from "clsx";

interface Option<T extends string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={clsx(
        "flex p-1 rounded-xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-xl shadow-inner",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "flex-1 relative flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 select-none font-medium",
              size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs",
              isSelected
                ? "bg-slate-800 text-white shadow-md border border-white/10 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            )}
          >
            {option.icon && (
              <span className={clsx("transition-colors", isSelected ? "text-emerald-400" : "text-slate-500")}>
                {option.icon}
              </span>
            )}
            <div className="flex flex-col items-center">
              <span>{option.label}</span>
              {option.sublabel && (
                <span className={clsx("text-[9px] font-normal", isSelected ? "text-emerald-300/80" : "text-slate-500")}>
                  {option.sublabel}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
