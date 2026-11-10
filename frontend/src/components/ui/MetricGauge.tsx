"use client";

import React from "react";

interface MetricGaugeProps {
  score: number; // 0 to 100
  label: string;
  sublabel?: string;
  size?: number;
}

export const MetricGauge: React.FC<MetricGaugeProps> = ({
  score,
  label,
  sublabel,
  size = 110,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc of 260 degrees
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  // Determine color based on score
  const getColor = () => {
    if (score >= 75) return "#10b981"; // Emerald
    if (score >= 50) return "#a3e635"; // Lime
    if (score >= 35) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const strokeColor = getColor();

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Animated fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Central content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-xl font-bold font-mono text-white tracking-tight leading-none">
          {Math.round(score)}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
          {label}
        </span>
        {sublabel && <span className="text-[9px] text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
};
