import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Compass, RefreshCw, AlertCircle, Sparkles, PlusCircle } from 'lucide-react';
import { Course, CourseCategory, CourseDifficulty, Enrollment } from '../types';
import {
  subscribeToPublishedCourses,
  getPublishedCourses,
  COURSE_CATEGORIES,
  COURSE_DIFFICULTIES,
} from '../services/courseService';
import { getStudentEnrollments } from '../services/enrollmentService';
import { seedSampleCurriculum } from '../services/sampleData';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/CourseCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Link } from 'react-router-dom';

export const ExploreCoursesPage: React.FC = () => {
  const { user, profile, isInstructor } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const fetchEnrollments = async (uid: string) => {
    try {
      const studentEnrollments = await getStudentEnrollments(uid);
      setEnrollments(studentEnrollments);
    } catch (err) {
      console.warn('Could not load user enrollments:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch user enrollments if logged in
    if (user?.uid) {
      fetchEnrollments(user.uid);
    } else {
      setEnrollments([]);
    }

    let isMounted = true;

    // Safety timeout: Ensure loading spinner never hangs indefinitely
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 12000);

    // Set up real-time listener for published courses
    const unsubscribe = subscribeToPublishedCourses(
      (publishedCourses) => {
        if (!isMounted) return;
        clearTimeout(safetyTimer);
        setCourses(publishedCourses);
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (!isMounted) return;
        clearTimeout(safetyTimer);
        console.error('Subscription error for courses:', err);
        setError('Unable to connect to Firestore. Please check your network or try again.');
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [user?.uid]);

  const handleManualRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [published, studentEnrollments] = await Promise.all([
        getPublishedCourses(),
        user?.uid ? getStudentEnrollments(user.uid) : Promise.resolve([]),
      ]);
      setCourses(published);
      setEnrollments(studentEnrollments);
    } catch (err: unknown) {
      console.error('Manual refresh error:', err);
      setError('Failed to refresh courses from Firestore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedFromEmpty = async () => {
    if (!user) return;
    setSeeding(true);
    setError(null);
    try {
      await seedSampleCurriculum(
        user.uid,
        profile?.name || user.displayName || 'EduTrack Instructor',
        user.email || ''
      );
      setSeedSuccess('Sample engineering courses successfully published to Firestore!');
      await handleManualRefresh();
      setTimeout(() => setSeedSuccess(null), 5000);
    } catch (err: unknown) {
      console.error('Seeding error:', err);
      setError('Failed to seed curriculum. Please ensure your account has instructor permissions.');
    } finally {
      setSeeding(false);
    }
  };

  // Enrollment map for fast lookup
  const enrollmentMap = useMemo(() => {
    const map = new Map<string, Enrollment>();
    enrollments.forEach((e) => map.set(e.courseId, e));
    return map;
  }, [enrollments]);

  // Client-side filtering
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'All' || course.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !queryLower ||
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower) ||
        course.category.toLowerCase().includes(queryLower) ||
        (course.instructorName && course.instructorName.toLowerCase().includes(queryLower));

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [courses, selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Course Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Explore Engineering Courses
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
            Discover peer-reviewed courses in web systems, algorithms, databases, and computer science.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Notifications / Error Banner */}
      {error && (
        <ErrorMessage
          title="Firestore Connection Issue"
          message={error}
          onRetry={handleManualRefresh}
        />
      )}

      {seedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{seedSuccess}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course title, keywords, or instructor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 transition-all"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="All">All Difficulties</option>
              {COURSE_DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'All'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {COURSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 py-16 px-4">
          <LoadingSpinner
            size="lg"
            message="Connecting to Firestore and fetching published courses..."
          />
        </div>
      ) : (
        <>
          {/* Results Summary Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredCourses.length}</strong> published courses
            </span>
            {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }}
                className="text-emerald-800 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Courses Grid or Empty State */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const enrollment = enrollmentMap.get(course.id);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={Boolean(enrollment)}
                    progressPercentage={enrollment?.progressPercentage}
                    lastLessonId={enrollment?.lastAccessedLessonId}
                  />
                );
              })}
            </div>
          ) : courses.length === 0 ? (
            /* Database is empty */
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-8 ring-emerald-50/50">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">No Published Courses Yet</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  The Firestore database does not have any published courses yet. As an instructor, you can create a custom course or seed initial sample curricula.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {user ? (
                  <>
                    <Link
                      to="/instructor/courses/new"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create New Course</span>
                    </Link>

                    <button
                      onClick={handleSeedFromEmpty}
                      disabled={seeding}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{seeding ? 'Seeding Sample Tracks...' : 'Seed Sample Courses'}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    <Link
                      to="/login"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Sign In to Create Courses
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900"
                    >
                      Register as Instructor
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Filters yielded no matches */
            <EmptyState
              icon={BookOpen}
              title="No Courses Match Your Filters"
              description="No published courses matched your search query or category/difficulty selections. Try clearing your filters to see all available tracks."
              actionText="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
