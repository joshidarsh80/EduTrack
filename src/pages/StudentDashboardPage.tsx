import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Enrollment, LessonProgress } from '../types';
import { getStudentEnrollments } from '../services/enrollmentService';
import { getAllStudentProgress } from '../services/progressService';
import { DashboardCard } from '../components/DashboardCard';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const StudentDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [enrolled, progress] = await Promise.all([
          getStudentEnrollments(user.uid),
          getAllStudentProgress(user.uid),
        ]);
        setEnrollments(enrolled);
        setProgressList(progress);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your student records from Firestore..." />;
  }

  // Calculate real metrics from Firestore data
  const totalEnrolled = enrollments.length;
  const completedLessons = progressList.filter((p) => p.completed).length;
  const totalCourseLessons = enrollments.reduce((sum, e) => sum + (e.totalLessons || 0), 0);
  const overallProgressPct =
    totalCourseLessons > 0 ? Math.min(100, Math.round((completedLessons / totalCourseLessons) * 100)) : 0;
  const completedCoursesCount = enrollments.filter(
    (e) => e.status === 'completed' || (e.progressPercentage || 0) >= 100
  ).length;

  const activeEnrollments = enrollments.filter((e) => (e.progressPercentage || 0) < 100);
  const mostRecentCourse = enrollments.length > 0 ? enrollments[0] : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 px-3 py-1 text-[11px] font-semibold text-emerald-100 mb-3">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.name || user?.displayName || 'Learner'}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {totalEnrolled > 0
              ? `You're currently active in ${activeEnrollments.length} course${
                  activeEnrollments.length === 1 ? '' : 's'
                }. Keep up the momentum to reach your computer engineering goals.`
              : 'Welcome to EduTrack! Explore our engineering catalog and enroll in your first free course to start tracking your mastery.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-xs hover:bg-emerald-50 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-800" />
              Explore New Courses
            </Link>
            {mostRecentCourse && (
              <Link
                to={
                  mostRecentCourse.lastAccessedLessonId
                    ? `/learn/${mostRecentCourse.courseId}/${mostRecentCourse.lastAccessedLessonId}`
                    : `/learn/${mostRecentCourse.courseId}`
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-800/80 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Resume {mostRecentCourse.courseTitle}
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-700/20 blur-2xl pointer-events-none" />
      </div>

      {/* Real Firestore Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Enrolled Courses"
          value={totalEnrolled}
          subtitle={`${activeEnrollments.length} active in progress`}
          icon={BookOpen}
        />
        <DashboardCard
          title="Completed Lessons"
          value={completedLessons}
          subtitle={`Across all curriculum tracks`}
          icon={CheckCircle2}
        />
        <DashboardCard
          title="Overall Progress"
          value={`${overallProgressPct}%`}
          subtitle="Cumulative completion rate"
          icon={TrendingUp}
          badge={overallProgressPct > 75 ? 'Advanced' : 'In Progress'}
        />
        <DashboardCard
          title="Completed Courses"
          value={completedCoursesCount}
          subtitle="Certificates ready"
          icon={Award}
          badgeColor="emerald"
        />
      </div>

      {/* Continue Learning Section */}
      {mostRecentCourse && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Pick up where you left off
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Continue Learning</h2>
            </div>
            <Link
              to="/my-learning"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              View all my courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                <img
                  src={
                    mostRecentCourse.courseThumbnail ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={mostRecentCourse.courseTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="inline-block text-[10px] font-semibold text-slate-600 uppercase">
                  {mostRecentCourse.category || 'Engineering'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {mostRecentCourse.courseTitle}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{mostRecentCourse.completedLessonsCount || 0} / {mostRecentCourse.totalLessons || 0} lessons done</span>
                  <span className="font-semibold text-emerald-800">{mostRecentCourse.progressPercentage || 0}%</span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-36">
                <ProgressBar progress={mostRecentCourse.progressPercentage || 0} size="sm" />
              </div>
              <Link
                to={
                  mostRecentCourse.lastAccessedLessonId
                    ? `/learn/${mostRecentCourse.courseId}/${mostRecentCourse.lastAccessedLessonId}`
                    : `/learn/${mostRecentCourse.courseId}`
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Resume Lesson
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recently Enrolled Courses</h2>
            <p className="text-xs text-slate-500">Courses you have joined on EduTrack</p>
          </div>
          {enrollments.length > 0 && (
            <Link
              to="/my-learning"
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              See all ({enrollments.length})
            </Link>
          )}
        </div>

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.slice(0, 3).map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {enrollment.category || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {enrollment.courseTitle}
                  </h3>
                  <div className="mt-4">
                    <ProgressBar
                      progress={enrollment.progressPercentage || 0}
                      showLabel
                      size="sm"
                      labelPrefix="Course Progress"
                    />
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {enrollment.completedLessonsCount || 0} of {enrollment.totalLessons || 0} lessons
                  </span>
                  <Link
                    to={
                      enrollment.lastAccessedLessonId
                        ? `/learn/${enrollment.courseId}/${enrollment.lastAccessedLessonId}`
                        : `/learn/${enrollment.courseId}`
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    Open <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Course Enrollments Yet"
            description="You haven't enrolled in any courses yet. Browse our comprehensive course catalog and enroll for free."
            actionText="Explore Course Catalog"
            actionLink="/courses"
          />
        )}
      </div>

      {/* Upcoming Activities & Study Plan */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-800" />
          <h2 className="text-base font-bold text-slate-900">Upcoming Learning Activities</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Complete Next Lesson in Active Track
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mark your lesson complete to maintain your daily study consistency.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Active Task
            </span>
          </div>
          <div className="py-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-800">Review Code Architecture Exercises</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Practice clean component design and data structure optimizations.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              Self-Paced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
