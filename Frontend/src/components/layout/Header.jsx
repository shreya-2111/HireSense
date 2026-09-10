import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Calendar,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useRecruitment } from '../../context/RecruitmentContext';

export function Header({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, settings, scheduledInterviewsCount, candidates, logout } = useRecruitment();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pendingCount = candidates.filter((c) => c.status === 'Under Review').length;

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  const displayName = user?.name || settings.recruiterName || 'Sarah Lin';
  const displayEmail = user?.email || settings.recruiterEmail || 'sarah.lin@hiresense.internal';
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SL';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Recruiter Search */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search candidates, jobs, or skills..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/candidates?q=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
            className="w-full pl-9 pr-12 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[10px] font-mono text-slate-400">
            ↵ Enter
          </span>
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Interview Alert Tag */}
        {scheduledInterviewsCount > 0 && (
          <button
            onClick={() => navigate('/interviews')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-[11px] font-medium text-blue-700 transition-colors"
          >
            <Calendar className="w-3 h-3 text-blue-600" />
            <span>{scheduledInterviewsCount} interviews today</span>
          </button>
        )}

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] text-blue-600 font-medium cursor-pointer">Clear all</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs">
                  <p className="font-medium text-slate-800">New 92% match candidate</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Aarav Shah applied for Frontend Developer</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">15 minutes ago</span>
                </div>
                <div className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs">
                  <p className="font-medium text-slate-800">Interview scheduled</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Elena Rostova with Rachel Torres at 2:00 PM</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
              <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50/60 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/candidates');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View all candidate updates
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Primary Action Button (Desktop) */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/jobs/create')}
          className="hidden sm:inline-flex shadow-xs text-xs font-semibold"
        >
          Create Job
        </Button>

        {/* Recruiter Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Avatar initials={displayInitials} size="sm" />
            <span className="hidden xl:inline-block text-xs font-semibold text-slate-800">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:inline-block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
