import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileSearch,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useRecruitment } from '../../context/RecruitmentContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Candidates', path: '/candidates', icon: Users },
  { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileSearch },
  { name: 'Interviews', path: '/interviews', icon: Calendar },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ className, onCloseMobile }) {
  const navigate = useNavigate();
  const { user, settings, activeJobsCount, scheduledInterviewsCount, logout } = useRecruitment();

  const displayName = user?.name || settings.recruiterName || 'Sarah Lin';
  const displayCompany = user?.company || settings.companyName || 'Acme Cloud Technologies';
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SL';

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn("w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none shrink-0", className)}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <NavLink to="/" className="flex items-center gap-2.5" onClick={onCloseMobile}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <span className="text-sm tracking-tight font-black">H</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 tracking-tight leading-tight">HireSense</span>
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Recruitment Suite</span>
          </div>
        </NavLink>
      </div>

      {/* Primary Action Button */}
      <div className="p-4 border-b border-slate-100/80">
        <Button
          variant="primary"
          className="w-full justify-center shadow-xs py-2 text-sm font-semibold"
          icon={Plus}
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            navigate('/jobs/create');
          }}
        >
          Create Job
        </Button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
          Main Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-blue-600" : "text-slate-600 group-hover:text-slate-600"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.name === 'Jobs' && activeJobsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                      {activeJobsCount}
                    </span>
                  )}
                  {item.name === 'Interviews' && scheduledInterviewsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">
                      {scheduledInterviewsCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Recruiter Notice Badge */}
      <div className="mx-3 mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Recruiter Support</span>
        </div>
        HireSense aids resume screening. Human recruiters make final hiring decisions.
      </div>

      {/* User Profile Info Card with Sign Out Button */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors group flex-1 min-w-0"
        >
          <Avatar initials={displayInitials} size="sm" status="online" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{displayCompany}</p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          title="Sign out of HireSense"
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
