import React from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function MobileNav({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Slide-over sidebar container */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-in-out">
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar className="w-full border-r-0" onCloseMobile={onClose} />
      </div>
    </div>
  );
}
