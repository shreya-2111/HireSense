import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full space-y-3 p-4 bg-white rounded-xl border border-slate-200">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn("h-4", j === 0 ? "w-40" : j === cols - 1 ? "w-16 ml-auto" : "w-24")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
