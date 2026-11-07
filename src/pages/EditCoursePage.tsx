import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Video,
  Save,
  Loader2,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Course, Lesson, CourseCategory, CourseDifficulty } from '../types';
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  COURSE_CATEGORIES,
  COURSE_DIFFICULTIES,
} from '../services/courseService';
import {
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../services/lessonService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const EditCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Web Development');
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('Beginner');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [duration, setDuration] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId || !user) return;
      setLoading(true);
      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourse(courseId, true),
        ]);

        if (!courseData) {
          setError('Course not found.');
          setLoading(false);
          return;
        }

        // Verify ownership
        if (courseData.instructorId !== user.uid) {
          setError('Unauthorized: You do not own this course.');
          setLoading(false);
          return;
        }

        setCourse(courseData);
        setLessons(lessonsData);

        // Prepopulate form
        setTitle(courseData.title);
        setDescription(courseData.description);
        setCategory(courseData.category);
        setDifficulty(courseData.difficulty);
        setThumbnailUrl(courseData.thumbnailUrl || '');
        setLearningObjectives(courseData.learningObjectives || '');
        setDuration(courseData.duration || '');
        setIsPublished(courseData.isPublished);
      } catch (err: unknown) {
        console.error('Failed to load course for editing:', err);
        const msg = err instanceof Error ? err.message : 'Error loading course.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId, user]);

  const handleLessonChange = (
    index: number,
    field: keyof Lesson,
    value: string | number
  ) => {
    setLessons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddNewLesson = () => {
    if (!courseId || !user) return;
    const nextOrder = lessons.length + 1;
    const newLessonPlaceholder: Lesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      courseId,
      instructorId: user.uid,
      title: `Lesson ${nextOrder}: New Section`,
      moduleTitle: lessons[lessons.length - 1]?.moduleTitle || 'Module 1: Foundations',
      order: nextOrder,
      videoUrl: '',
      description: '',
      content: '',
      durationMinutes: 15,
      isPublished: true,
    };
    setLessons((prev) => [...prev, newLessonPlaceholder]);
  };

  const handleDeleteLesson = async (lessonIndex: number) => {
    const lesson = lessons[lessonIndex];
    if (lessons.length <= 1) {
      alert('A course must retain at least one lesson.');
      return;
    }

    if (window.confirm(`Delete lesson "${lesson.title}"?`)) {
      try {
        if (courseId) {
          await deleteLesson(lesson.id, courseId);
        }
        setLessons((prev) => prev.filter((_, i) => i !== lessonIndex));
      } catch (err) {
        console.error('Failed to delete lesson:', err);
        setError('Failed to delete lesson.');
      }
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !user) return;
    setError(null);
    setSuccessMsg(null);

    if (!title.trim() || !description.trim()) {
      setError('Please provide course title and description.');
      return;
    }

    setSaving(true);
    try {
      // 1. Update course metadata
      await updateCourse(courseId, {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        thumbnailUrl: thumbnailUrl.trim(),
        learningObjectives: learningObjectives.trim(),
        duration: duration.trim(),
        isPublished,
        totalLessons: lessons.length,
      });

      // 2. Persist lesson updates
      let order = 1;
      for (const lesson of lessons) {
        const payload: Partial<Lesson> = {
          title: lesson.title.trim(),
          moduleTitle: lesson.moduleTitle?.trim() || 'Core Curriculum',
          description: lesson.description?.trim() || '',
          videoUrl: lesson.videoUrl?.trim() || '',
          content: lesson.content?.trim() || '',
          durationMinutes: Number(lesson.durationMinutes) || 10,
          order: order++,
        };

        // If exists, update; if new, create
        if (lesson.createdAt) {
          await updateLesson(lesson.id, payload);
        } else {
          await createLesson({
            id: lesson.id,
            courseId,
            instructorId: user.uid,
            title: payload.title!,
            moduleTitle: payload.moduleTitle,
            description: payload.description,
            videoUrl: payload.videoUrl,
            content: payload.content,
            durationMinutes: payload.durationMinutes,
            order: payload.order!,
            isPublished: true,
          });
        }
      }

      setSuccessMsg('Course and curriculum updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      console.error('Failed to update course:', err);
      const msg = err instanceof Error ? err.message : 'Error updating course.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntireCourse = async () => {
    if (!courseId) return;
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${title}"? All course data and lessons will be removed.`
      )
    ) {
      try {
        await deleteCourse(courseId);
        navigate('/instructor');
      } catch (err: unknown) {
        console.error('Delete course error:', err);
        setError('Failed to delete course.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading course editor from Firestore..." />;
  }

  if (error && !course) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <ErrorMessage title="Access Denied" message={error} />
        <div className="mt-4 text-center">
          <Link to="/instructor" className="text-xs font-semibold text-emerald-800 hover:underline">
            Return to Instructor Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            to="/instructor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Instructor Studio</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Course</h1>
          <p className="text-xs text-slate-500">Update metadata, publish state, and curriculum lessons</p>
        </div>

        <div className="flex items-center gap-2">
          {courseId && (
            <Link
              to={`/courses/${courseId}`}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleDeleteEntireCourse}
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Course</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage title="Error" message={error} />}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveCourse} className="space-y-8">
        {/* Course Details */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">1. Course Details</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-600 focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                {COURSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as CourseDifficulty)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                {COURSE_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 4h 10m"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Learning Objectives (One per line)
            </label>
            <textarea
              rows={3}
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden leading-relaxed"
            />
          </div>
        </div>

        {/* Curriculum Lessons */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Course Curriculum & Lessons</h2>
              <p className="text-xs text-slate-500">
                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} configured
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddNewLesson}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lesson
            </button>
          </div>

          <div className="space-y-4">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Lesson #{idx + 1}
                  </span>
                  {lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(idx)}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Module Section
                    </label>
                    <input
                      type="text"
                      value={lesson.moduleTitle || ''}
                      onChange={(e) => handleLessonChange(idx, 'moduleTitle', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(idx, 'title', e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-emerald-800" />
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      value={lesson.videoUrl || ''}
                      onChange={(e) => handleLessonChange(idx, 'videoUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Duration (Mins)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={lesson.durationMinutes || 10}
                      onChange={(e) =>
                        handleLessonChange(idx, 'durationMinutes', parseInt(e.target.value) || 10)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lesson Description
                  </label>
                  <input
                    type="text"
                    value={lesson.description || ''}
                    onChange={(e) => handleLessonChange(idx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Text-Based Content & Study Reference
                  </label>
                  <textarea
                    rows={2}
                    value={lesson.content || ''}
                    onChange={(e) => handleLessonChange(idx, 'content', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publish and Save Footer */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublishedEdit"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600"
            />
            <label htmlFor="isPublishedEdit" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Published on Marketplace ({isPublished ? 'Live for students' : 'Draft mode'})
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/instructor"
              className="flex-1 sm:flex-initial text-center rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
