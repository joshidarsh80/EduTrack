import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Menu,
  X,
  BookOpen,
  ArrowLeft,
  Award,
  Sparkles,
  Loader2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Course, Lesson, Enrollment, LessonProgress } from '../types';
import { getCourseById } from '../services/courseService';
import { getLessonsByCourse } from '../services/lessonService';
import {
  checkEnrollment,
  enrollInCourse,
  updateEnrollmentActivity,
} from '../services/enrollmentService';
import {
  getCourseProgress,
  toggleLessonProgress,
} from '../services/progressService';
import { VideoPlayer } from '../components/VideoPlayer';
import { LessonList } from '../components/LessonList';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const LearningPlayerPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [error, setError] = useState<string | null>(null);

  // Load course and curriculum
  useEffect(() => {
    async function loadLearningContext() {
      if (!courseId || !user) return;
      setLoading(true);
      try {
        const courseData = await getCourseById(courseId);

        if (!courseData) {
          setError('Course not found.');
          setLoading(false);
          return;
        }

        const isOwner = courseData.instructorId === user.uid;
        const [lessonsData, enrollData, progData] = await Promise.all([
          getLessonsByCourse(courseId, isOwner),
          checkEnrollment(user.uid, courseId),
          getCourseProgress(user.uid, courseId),
        ]);

        setCourse(courseData);
        setLessons(lessonsData);
        setProgressList(progData);

        // Auto-enroll if instructor viewing their own course or user visits directly
        let currentEnrollment = enrollData;
        if (!currentEnrollment && courseData.instructorId !== user.uid) {
          // If not enrolled, create enrollment for student
          currentEnrollment = await enrollInCourse(user.uid, courseData, lessonsData[0]?.id);
        }
        setEnrollment(currentEnrollment);

        // Determine current lesson
        let targetLesson: Lesson | undefined;
        if (lessonId) {
          targetLesson = lessonsData.find((l) => l.id === lessonId);
        } else if (currentEnrollment?.lastAccessedLessonId) {
          targetLesson = lessonsData.find((l) => l.id === currentEnrollment?.lastAccessedLessonId);
        }

        if (!targetLesson && lessonsData.length > 0) {
          targetLesson = lessonsData[0];
        }

        setCurrentLesson(targetLesson || null);

        // Update last accessed activity
        if (targetLesson && currentEnrollment) {
          updateEnrollmentActivity(user.uid, courseId, targetLesson.id);
        }
      } catch (err: unknown) {
        console.error('Failed to load learning player:', err);
        const msg = err instanceof Error ? err.message : 'Error loading learning module.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadLearningContext();
  }, [courseId, user]);

  // When URL lessonId changes
  useEffect(() => {
    if (!lessonId || lessons.length === 0) return;
    const match = lessons.find((l) => l.id === lessonId);
    if (match && match.id !== currentLesson?.id) {
      setCurrentLesson(match);
      if (user && courseId) {
        updateEnrollmentActivity(user.uid, courseId, match.id);
      }
    }
  }, [lessonId, lessons, user, courseId, currentLesson?.id]);

  // Progress helpers
  const isCurrentLessonCompleted = useMemo(() => {
    if (!currentLesson) return false;
    return progressList.some((p) => p.lessonId === currentLesson.id && p.completed);
  }, [currentLesson, progressList]);

  const completedCount = useMemo(() => {
    return progressList.filter((p) => p.completed).length;
  }, [progressList]);

  const progressPercentage = useMemo(() => {
    if (lessons.length === 0) return 0;
    return Math.min(100, Math.round((completedCount / lessons.length) * 100));
  }, [completedCount, lessons.length]);

  // Navigation indices
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSidebarOpen(false);
    navigate(`/learn/${courseId}/${lesson.id}`);
  };

  const handleToggleComplete = async () => {
    if (!user || !courseId || !currentLesson) return;
    setTogglingProgress(true);
    try {
      const nextState = !isCurrentLessonCompleted;
      const updatedRecord = await toggleLessonProgress(
        user.uid,
        courseId,
        currentLesson.id,
        nextState,
        lessons.length
      );

      setProgressList((prev) => {
        const filtered = prev.filter((p) => p.lessonId !== currentLesson.id);
        return [...filtered, updatedRecord];
      });

      // If just completed and next lesson exists, smoothly recommend moving forward
      if (nextState && nextLesson) {
        // user can proceed
      }
    } catch (err: unknown) {
      console.error('Failed to update progress:', err);
    } finally {
      setTogglingProgress(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Setting up your interactive study environment..." />;
  }

  if (error || !course) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <ErrorMessage title="Player Error" message={error || 'Could not load player.'} />
        <div className="mt-4 text-center">
          <Link to="/courses" className="text-xs font-semibold text-emerald-800 hover:underline">
            Return to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Top Study Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/courses/${course.id}`}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Course Overview</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs md:max-w-md">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {completedCount} / {lessons.length} completed
            </span>
            <div className="w-28">
              <ProgressBar progress={progressPercentage} size="sm" />
            </div>
            <span className="text-xs font-bold text-emerald-400">{progressPercentage}%</span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Curriculum</span>
          </button>
        </div>
      </header>

      {/* Main Learning Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Player & Lesson Notes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player */}
            {currentLesson ? (
              <VideoPlayer
                videoUrl={currentLesson.videoUrl}
                title={currentLesson.title}
              />
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 text-sm">
                No lesson selected
              </div>
            )}

            {/* Lesson Navigation & Completion Toolbar */}
            {currentLesson && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleToggleComplete}
                    disabled={togglingProgress}
                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      isCurrentLessonCompleted
                        ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600/60 hover:bg-emerald-800'
                        : 'bg-emerald-700 text-white hover:bg-emerald-600 shadow-sm'
                    } disabled:opacity-50`}
                  >
                    {togglingProgress ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrentLessonCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Circle className="w-4 h-4 text-emerald-100" />
                    )}
                    <span>
                      {isCurrentLessonCompleted ? 'Completed (Click to Undo)' : 'Mark Lesson as Completed'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    type="button"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && handleSelectLesson(prevLesson)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && handleSelectLesson(nextLesson)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Current Lesson Notes / Content */}
            {currentLesson && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    {currentLesson.moduleTitle || 'Core Module'} • Lesson {currentLesson.order}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {currentLesson.title}
                  </h2>
                  {currentLesson.durationMinutes && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{currentLesson.durationMinutes} minutes duration</span>
                    </div>
                  )}
                </div>

                {currentLesson.description && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Lesson Overview
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {currentLesson.description}
                    </p>
                  </div>
                )}

                {currentLesson.content && (
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Study Material & Code Reference
                    </h3>
                    <div className="prose prose-invert prose-emerald text-xs sm:text-sm leading-relaxed max-w-none whitespace-pre-wrap font-sans text-slate-300">
                      {currentLesson.content}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completion celebratory banner */}
            {progressPercentage === 100 && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-emerald-200">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-200">
                  Congratulations! Course 100% Completed!
                </h3>
                <p className="text-xs text-emerald-300/80 max-w-md mx-auto">
                  You have successfully completed all lessons in this curriculum track. Check your Student Profile to see your updated statistics.
                </p>
                <div>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    View Student Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Course Curriculum Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 right-0 z-40 w-80 sm:w-96 shrink-0 border-l border-slate-800 bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Syllabus
              </h3>
              <p className="text-xs text-slate-300 font-medium truncate max-w-[220px]">
                {course.title}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-800/80 bg-slate-950/30">
            <ProgressBar
              progress={progressPercentage}
              showLabel
              size="sm"
              labelPrefix="Track Progress"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <LessonList
              lessons={lessons}
              activeLessonId={currentLesson?.id}
              progressList={progressList}
              onSelectLesson={handleSelectLesson}
              isEnrolled={true}
              interactive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
