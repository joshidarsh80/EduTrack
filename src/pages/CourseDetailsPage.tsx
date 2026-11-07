import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Users,
  Award,
  Play,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Course, Lesson, Enrollment } from '../types';
import { getCourseById } from '../services/courseService';
import { getLessonsByCourse } from '../services/lessonService';
import { checkEnrollment, enrollInCourse } from '../services/enrollmentService';
import { useAuth } from '../context/AuthContext';
import { LessonList } from '../components/LessonList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourseDetails() {
      if (!courseId) return;
      setLoading(true);
      try {
        const courseData = await getCourseById(courseId);

        if (!courseData) {
          setError('The requested course could not be found.');
          setLoading(false);
          return;
        }

        setCourse(courseData);

        const isOwner = user?.uid === courseData.instructorId;
        const lessonsData = await getLessonsByCourse(courseId, isOwner);
        setLessons(lessonsData);

        if (user) {
          const enrollData = await checkEnrollment(user.uid, courseId);
          setEnrollment(enrollData);
        }
      } catch (err: unknown) {
        console.error('Failed to load course details:', err);
        const msg = err instanceof Error ? err.message : 'Error loading course details.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadCourseDetails();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${courseId}` } } });
      return;
    }

    if (!course) return;

    setEnrolling(true);
    setError(null);
    try {
      const firstLesson = lessons[0];
      const newEnrollment = await enrollInCourse(user.uid, course, firstLesson?.id);
      setEnrollment(newEnrollment);

      // Navigate straight to learning player
      navigate(firstLesson ? `/learn/${course.id}/${firstLesson.id}` : `/learn/${course.id}`);
    } catch (err: unknown) {
      console.error('Enrollment error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to complete enrollment.';
      setError(msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading course curriculum from database..." />;
  }

  if (error || !course) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorMessage
          title="Course Not Found"
          message={error || 'Course does not exist or has been removed.'}
        />
        <div className="mt-4 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
          >
            ← Back to Course Catalog
          </Link>
        </div>
      </div>
    );
  }

  const objectivesList = course.learningObjectives
    ? course.learningObjectives.split('\n').filter((l) => l.trim().length > 0)
    : [
        'Understand foundational engineering principles and implementation paradigms.',
        'Gain practical competency with industry-standard development workflows.',
        'Build real-world mental models with structured code examples.',
      ];

  const defaultThumbnail =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="space-y-10 pb-16">
      {/* Course Hero Banner */}
      <div className="border-b border-slate-200/80 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/70">
                {course.category}
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {course.difficulty} Level
              </span>
              {course.price === 0 && (
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                  100% Free
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                  {course.instructorName ? course.instructorName.charAt(0) : 'I'}
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                    Instructor
                  </span>
                  <span className="font-semibold text-slate-800">
                    {course.instructorName || 'EduTrack Staff'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                  Course Length
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {course.duration || 'Self-Paced'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                  Curriculum
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                  Learners
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {course.enrolledCount || 0} enrolled
                </span>
              </div>
            </div>
          </div>

          {/* Action Card (Desktop / Sticky) */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-lg space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 relative">
                <img
                  src={course.thumbnailUrl || defaultThumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-emerald-800 shadow-md">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                <span className="text-2xl font-black text-slate-900">Free</span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Full Lifetime Access
                </span>
              </div>

              {/* Enrollment CTA */}
              {enrollment ? (
                <div className="space-y-2">
                  <div className="rounded-xl bg-emerald-50/80 p-3 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>You are enrolled in this course!</span>
                  </div>
                  <Link
                    to={
                      enrollment.lastAccessedLessonId
                        ? `/learn/${course.id}/${enrollment.lastAccessedLessonId}`
                        : `/learn/${course.id}`
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Continue Learning
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-900 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enrolling in Course...</span>
                    </>
                  ) : (
                    <>
                      <span>Enroll in Free Course</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              <div className="space-y-2 pt-2 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Structured video & reading curriculum
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Track completed lessons in real time
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Self-paced computer engineering syllabus
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: Objectives & Curriculum */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Learning Objectives */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-800" />
              What You'll Learn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              {objectivesList.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Course Curriculum</h2>
                <p className="text-xs text-slate-500">
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} organized into modules
                </p>
              </div>
            </div>

            <LessonList
              lessons={lessons}
              isEnrolled={Boolean(enrollment)}
              interactive={Boolean(enrollment)}
              onSelectLesson={(lesson) => {
                if (enrollment) {
                  navigate(`/learn/${course.id}/${lesson.id}`);
                }
              }}
            />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Instructor Information</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-emerald-800 font-bold text-sm uppercase">
                {course.instructorName ? course.instructorName.charAt(0) : 'I'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {course.instructorName || 'EduTrack Instructor'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {course.instructorEmail || 'Verified Instructor'}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Course creator and computer engineering mentor. Designed to equip students with industry-proven software development skills.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5">
            <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>Verified Certificate of Completion</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Complete 100% of the lessons in this track to record your verified certificate on your EduTrack student profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
