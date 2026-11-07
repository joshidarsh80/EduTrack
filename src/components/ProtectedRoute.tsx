import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireInstructor?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireInstructor = false,
}) => {
  const { user, profile, loading, isInstructor } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireInstructor && !isInstructor) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50/50">
        <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-8 ring-amber-50/50 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Instructor Access Restricted</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your account currently has the <span className="font-semibold text-slate-900 uppercase">student</span> role.
            Instructor access requires promotion in the Firestore Database.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="rounded-xl bg-emerald-800 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors"
            >
              Return to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
