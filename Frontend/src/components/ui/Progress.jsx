import React from 'react';
import { cn } from '../../utils/cn';

export function LinearProgress({ value = 0, max = 100, color = 'blue', className, showLabel = false, label }) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const colorStyles = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
          <span>{label}</span>
          <span className="font-semibold text-slate-900">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorStyles[color] || colorStyles.blue)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CircularScore({
  score = 0,
  size = 110,
  strokeWidth = 9,
  subtitle = "Job Fit",
  className,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  let strokeColor = "#10b981"; // Strong match (emerald)
  let textColor = "text-emerald-700";
  let bgBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let label = "Strong Match";

  if (clamped < 60) {
    strokeColor = "#94a3b8"; // Slate
    textColor = "text-slate-700";
    bgBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";
    label = "Low Match";
  } else if (clamped < 70) {
    strokeColor = "#f59e0b"; // Amber
    textColor = "text-amber-700";
    bgBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Potential Match";
  } else if (clamped < 85) {
    strokeColor = "#2563eb"; // Blue
    textColor = "text-blue-700";
    bgBadgeColor = "bg-blue-50 text-blue-700 border-blue-200";
    label = "Good Match";
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={cn("text-2xl font-bold tracking-tight", textColor)}>
            {clamped}%
          </span>
          {subtitle && (
            <span className="text-[10px] uppercase font-semibold text-slate-600 tracking-wider">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2.5">
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", bgBadgeColor)}>
          {label}
        </span>
      </div>
    </div>
  );
}
