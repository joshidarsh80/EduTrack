import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, CheckCircle2, Play, ArrowRight, Award, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Enrollment } from '../types';
import { getStudentEnrollments } from '../services/enrollmentService';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const MyLearningPage: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      try {
        const list = await getStudentEnrollments(user.uid);
        setEnrollments(list);
      } catch (err) {
        console.error('Failed to load my learning list:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollments();
  }, [user]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && (e.progressPercentage || 0) < 100) ||
        (filter === 'completed' && ((e.progressPercentage || 0) >= 100 || e.status === 'completed'));

      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !queryLower ||
        (e.courseTitle && e.courseTitle.toLowerCase().includes(queryLower)) ||
        (e.category && e.category.toLowerCase().includes(queryLower));

      return matchesFilter && matchesSearch;
    });
  }, [enrollments, filter, searchQuery]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your enrolled tracks from Firestore..." />;
  }

  const completedCount = enrollments.filter(
    (e) => (e.progressPercentage || 0) >= 100 || e.status === 'completed'
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
              Student Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Learning</h1>
          <p className="text-xs text-slate-500">
            Track your ongoing curriculum, resume lessons, and celebrate completed engineering courses
          </p>
        </div>

        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors self-start sm:self-auto"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Browse More Courses</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Courses ({enrollments.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            In Progress ({enrollments.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enrolled courses..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Courses List */}
      {filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => {
            const isFinished =
              (enrollment.progressPercentage || 0) >= 100 || enrollment.status === 'completed';

            return (
              <div
                key={enrollment.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={
                        enrollment.courseThumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={enrollment.courseTitle}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-xs">
                        {enrollment.category || 'Engineering'}
                      </span>
                    </div>
                    {isFinished && (
                      <div className="absolute top-3 right-3 rounded-md bg-emerald-800 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-200" />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
                      {enrollment.courseTitle}
                    </h3>

                    <div className="mt-4">
                      <ProgressBar
                        progress={enrollment.progressPercentage || 0}
                        showLabel
                        size="sm"
                        labelPrefix="Progress"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>
                        {enrollment.completedLessonsCount || 0} of {enrollment.totalLessons || 0} lessons done
                      </span>
                      <span>
                        Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={
                      enrollment.lastAccessedLessonId
                        ? `/learn/${enrollment.courseId}/${enrollment.lastAccessedLessonId}`
                        : `/learn/${enrollment.courseId}`
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isFinished ? 'Review Course Material' : 'Continue Learning'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={enrollments.length === 0 ? 'No Enrolled Courses' : 'No Matching Courses Found'}
          description={
            enrollments.length === 0
              ? 'You have not enrolled in any courses yet. Browse our catalog to start learning computer engineering.'
              : 'No courses match your active filter or search query.'
          }
          actionText={enrollments.length === 0 ? 'Explore Catalog' : 'Clear Filters'}
          actionLink={enrollments.length === 0 ? '/courses' : undefined}
          onAction={
            enrollments.length > 0
              ? () => {
                  setFilter('all');
                  setSearchQuery('');
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
