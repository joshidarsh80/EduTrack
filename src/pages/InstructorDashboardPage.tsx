import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Users,
  BookOpen,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import {
  getInstructorCourses,
  updateCourse,
  deleteCourse,
} from '../services/courseService';
import { getInstructorEnrollments } from '../services/enrollmentService';
import { seedSampleCurriculum } from '../services/sampleData';
import { DashboardCard } from '../components/DashboardCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';

export const InstructorDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalEnrolledCount, setTotalEnrolledCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const [instructorCourses, enrollments] = await Promise.all([
        getInstructorCourses(user.uid),
        getInstructorEnrollments(user.uid),
      ]);
      setCourses(instructorCourses);
      setTotalEnrolledCount(enrollments.length);
    } catch (err: unknown) {
      console.error('Failed to load instructor courses:', err);
      const msg = err instanceof Error ? err.message : 'Error fetching instructor courses.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleTogglePublish = async (course: Course) => {
    setActionLoadingId(course.id);
    setError(null);
    try {
      const nextStatus = !course.isPublished;
      await updateCourse(course.id, { isPublished: nextStatus });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: nextStatus } : c))
      );
      setSuccessMsg(
        `Course "${course.title}" is now ${nextStatus ? 'Published to marketplace' : 'saved as Draft'}.`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      console.error('Failed to toggle publish status:', err);
      setError('Failed to update course status. Ensure you own this course.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This cannot be undone.`)) {
      return;
    }

    setActionLoadingId(courseId);
    setError(null);
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setSuccessMsg(`Course "${courseTitle}" successfully deleted.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      console.error('Delete course error:', err);
      setError('Failed to delete course. You can only delete courses you own.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSeedSamples = async () => {
    if (!user) return;
    setSeeding(true);
    setError(null);
    try {
      await seedSampleCurriculum(
        user.uid,
        profile?.name || user.displayName || 'EduTrack Instructor',
        user.email || ''
      );
      await loadData();
      setSuccessMsg('Sample engineering courses successfully created and published!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      console.error('Failed to seed sample courses:', err);
      setError('Failed to seed curriculum. Check Firestore rules and permissions.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading instructor dashboard from Firestore..." />;
  }

  const publishedCoursesCount = courses.filter((c) => c.isPublished).length;
  const draftCoursesCount = courses.filter((c) => !c.isPublished).length;
  const totalLessonsCreated = courses.reduce((sum, c) => sum + (c.totalLessons || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
              Instructor Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Management</h1>
          <p className="text-xs text-slate-500">
            Create, publish, and monitor your engineering courses and curriculum
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {courses.length === 0 && (
            <button
              onClick={handleSeedSamples}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Seeding Curriculum...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Seed Sample Courses</span>
                </>
              )}
            </button>
          )}

          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && <ErrorMessage title="Instructor Studio Error" message={error} />}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Courses"
          value={courses.length}
          subtitle={`${publishedCoursesCount} published, ${draftCoursesCount} drafts`}
          icon={Layers}
        />
        <DashboardCard
          title="Total Students"
          value={totalEnrolledCount}
          subtitle="Enrolled across your courses"
          icon={Users}
        />
        <DashboardCard
          title="Total Lessons"
          value={totalLessonsCreated}
          subtitle="Curriculum modules created"
          icon={BookOpen}
        />
        <DashboardCard
          title="Course Status"
          value={`${publishedCoursesCount}/${courses.length}`}
          subtitle="Published courses ratio"
          icon={TrendingUp}
          badge={publishedCoursesCount > 0 ? 'Live' : 'Drafting'}
        />
      </div>

      {/* Courses List Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Authored Courses</h2>
            <p className="text-xs text-slate-500">
              Only courses owned by your instructor UID ({user?.uid}) are shown
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
          </span>
        </div>

        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Lessons</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {courses.map((course) => {
                  const isActionLoading = actionLoadingId === course.id;

                  return (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              course.thumbnailUrl ||
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80'
                            }
                            alt=""
                            className="h-10 w-14 shrink-0 rounded-lg object-cover bg-slate-100"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">
                              {course.title}
                            </p>
                            <span className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {course.category}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {course.difficulty}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {course.totalLessons || 0}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {course.enrolledCount || 0}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(course)}
                          disabled={isActionLoading}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                            course.isPublished
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {course.isPublished ? 'Published' : 'Draft (Click to Publish)'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/courses/${course.id}`}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View Public Course Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/instructor/courses/${course.id}/edit`}
                            className="rounded-lg p-1.5 text-emerald-800 hover:bg-emerald-50 transition-colors"
                            title="Edit Course & Lessons"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            disabled={isActionLoading}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Layers}
              title="No Courses Created Yet"
              description="You have not created any courses under this instructor account yet. Create your first course from scratch or seed sample engineering courses."
              actionText="Create New Course"
              actionLink="/instructor/courses/new"
            />
          </div>
        )}
      </div>
    </div>
  );
};
