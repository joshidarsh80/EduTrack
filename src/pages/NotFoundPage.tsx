import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-8 ring-emerald-50/50">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl font-black text-slate-900 tracking-tight block mb-2 font-mono">
            404
          </span>
          <h1 className="text-xl font-bold text-slate-900">Page Not Found</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            The page or curriculum track you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
