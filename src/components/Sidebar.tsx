import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  User,
  PlusCircle,
  ShieldCheck,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  mode?: 'student' | 'instructor';
  onOpenRolesGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mode = 'student', onOpenRolesGuide }) => {
  const location = useLocation();
  const { profile, isInstructor } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] p-4">
      {/* Role Badge Card */}
      <div className="mb-6 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-white text-xs font-bold uppercase">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{profile?.name || 'Student'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {profile?.role || 'student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {mode === 'student' ? (
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Learning Space
            </p>
            <nav className="space-y-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-800" />
                Dashboard Overview
              </Link>
              <Link
                to="/my-learning"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive('/my-learning')
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-800" />
                Enrolled Courses
              </Link>
              <Link
                to="/courses"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive('/courses')
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-800" />
                Course Catalog
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive('/profile')
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-800" />
                Account Profile
              </Link>
            </nav>
          </div>

          {isInstructor && (
            <div className="pt-4 border-t border-slate-100">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Instructor Mode
              </p>
              <Link
                to="/instructor"
                className="flex items-center gap-2.5 rounded-xl bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
              >
                <Layers className="w-4 h-4 text-emerald-800" />
                Go to Instructor Hub
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Instructor Studio
            </p>
            <nav className="space-y-1">
              <Link
                to="/instructor"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive('/instructor')
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-800" />
                Course Studio
              </Link>
              <Link
                to="/instructor/courses/new"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive('/instructor/courses/new')
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-800" />
                Create New Course
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <GraduationCap className="w-4 h-4 text-emerald-800" />
                Student View
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Promotion Guide trigger in sidebar */}
      <div className="mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={onOpenRolesGuide}
          className="w-full flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-slate-900">Role Permissions</p>
            <p className="text-[10px] text-slate-600">Console Promotion Steps</p>
          </div>
        </button>
      </div>
    </aside>
  );
};
