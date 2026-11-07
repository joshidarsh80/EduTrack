import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Video,
  BarChart3,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Course } from '../types';
import { getPublishedCourses } from '../services/courseService';
import { CourseCard } from '../components/CourseCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const list = await getPublishedCourses();
        setCourses(list.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Learning Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Learn with Clarity.{' '}
            <span className="text-emerald-800">
              Track Your Mastery.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            EduTrack gives computer engineering students and instructors a streamlined, distraction-free LMS.
            Engage with high-quality video lessons, monitor real-time progress, and master technical skills.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-900 transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              Explore Courses
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Create Student Account
              </Link>
            )}
          </div>

          {/* Key Value Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% Free Open Learning
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Real-time Firestore Progress
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Integrated Video Player
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zero-Trust Role Permissions
            </span>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Curated Curriculum
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Featured Engineering Courses
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse technical topics designed for modern software development.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            Browse all courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading courses from database..." />
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-slate-400 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Published Courses Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Instructors can create and publish courses in the Instructor Studio or seed sample courses with one click.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to="/courses"
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900"
              >
                Go to Catalog
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="border-t border-slate-200/80 bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Built for Engineering Portfolios
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              A Complete, Production-Grade Architecture
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Engineered with clean separation of concerns, persistent Firestore documents, and robust role-based security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Embedded Video Learning</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Clean, side-by-side video playback with modular lesson outlines, auto-resuming from last viewed position, and text reading notes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Firestore Progress Tracking</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Persistent progress records save every completed lesson into Cloud Firestore. Progress remains safe across logins and devices.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero-Trust Role Permissions</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Enforced by server-side Firestore security rules. Ordinary users cannot tamper with roles or modify courses they do not own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-emerald-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <Award className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to Elevate Your Knowledge?</h2>
          <p className="mt-3 text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of software engineering students mastering modern programming, algorithms, and databases on EduTrack.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto rounded-xl bg-white text-emerald-950 px-6 py-3 text-xs font-bold shadow-md hover:bg-emerald-50 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto rounded-xl border border-emerald-700 bg-emerald-800/80 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
            >
              Browse Course Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
