import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden transition-all duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-900 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn("text-xs text-slate-500 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn("px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500", className)} {...props}>
      {children}
    </div>
  );
}
