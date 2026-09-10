import React from 'react';
import { cn } from '../../utils/cn';

export function Tabs({ tabs = [], activeTab, onChange, className }) {
  return (
    <div className={cn("border-b border-slate-200 flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-150 flex items-center gap-2",
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
