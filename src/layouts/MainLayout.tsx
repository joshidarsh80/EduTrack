import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 font-sans antialiased">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-800 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 font-sans">
                Edu<span className="text-emerald-800">Track</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Production-Oriented Learning Management System
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/courses" className="hover:text-emerald-800 transition-colors">
              Explore Courses
            </Link>
            <Link to="/dashboard" className="hover:text-emerald-800 transition-colors">
              Student Dashboard
            </Link>
            <Link to="/my-learning" className="hover:text-emerald-800 transition-colors">
              My Learning
            </Link>
            <Link to="/instructor" className="hover:text-emerald-800 transition-colors">
              Instructor Studio
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Built with React, TypeScript & Firebase</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
