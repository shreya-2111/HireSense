import React from 'react';
import { cn } from '../../utils/cn';

export function PageContainer({
  title,
  subtitle,
  children,
  actions,
  breadcrumbs,
  className,
}) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6", className)}>
      {/* Header section if title provided */}
      {(title || breadcrumbs) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            {breadcrumbs && (
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5 font-medium">
                {breadcrumbs}
              </div>
            )}
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main page content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
