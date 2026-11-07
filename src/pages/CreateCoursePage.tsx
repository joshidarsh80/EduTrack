import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Video,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CourseCategory, CourseDifficulty } from '../types';
import {
  createCourse,
  COURSE_CATEGORIES,
  COURSE_DIFFICULTIES,
} from '../services/courseService';
import { createLesson } from '../services/lessonService';
import { ErrorMessage } from '../components/ErrorMessage';

interface DraftLesson {
  id: string;
  title: string;
  moduleTitle: string;
  description: string;
  videoUrl: string;
  content: string;
  durationMinutes: number;
}

export const CreateCoursePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Course Details Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Web Development');
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('Beginner');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [duration, setDuration] = useState('2h 30m');
  const [isPublished, setIsPublished] = useState(true);

  // Modular Lessons
  const [lessons, setLessons] = useState<DraftLesson[]>([
    {
      id: `temp_${Date.now()}_1`,
      title: 'Introduction & Core Foundations',
      moduleTitle: 'Module 1: Foundations',
      description: 'An overview of what we will build and core design principles.',
      videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      content: 'Welcome to this engineering course. Read through the syllabus before watching the video demonstration.',
      durationMinutes: 15,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLesson = () => {
    const nextOrder = lessons.length + 1;
    const lastModule = lessons[lessons.length - 1]?.moduleTitle || 'Module 1: Foundations';

    setLessons((prev) => [
      ...prev,
      {
        id: `temp_${Date.now()}_${nextOrder}`,
        title: `Lesson ${nextOrder}: New Topic`,
        moduleTitle: lastModule,
        description: '',
        videoUrl: '',
        content: '',
        durationMinutes: 15,
      },
    ]);
  };

  const handleRemoveLesson = (index: number) => {
    if (lessons.length <= 1) {
      alert('Every course must have at least one lesson.');
      return;
    }
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLessonChange = (
    index: number,
    field: keyof DraftLesson,
    value: string | number
  ) => {
    setLessons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Please provide a course title and description.');
      return;
    }

    if (lessons.some((l) => !l.title.trim())) {
      setError('All lessons must have a title.');
      return;
    }

    setSaving(true);
    try {
      // 1. Create course document
      const newCourse = await createCourse({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        thumbnailUrl:
          thumbnailUrl.trim() ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        learningObjectives: learningObjectives.trim(),
        duration: duration.trim(),
        price: 0,
        isPublished,
        instructorId: user.uid,
        instructorName: profile?.name || user.displayName || 'EduTrack Instructor',
        instructorEmail: user.email || '',
      });

      // 2. Create lessons
      let order = 1;
      for (const draft of lessons) {
        await createLesson({
          courseId: newCourse.id,
          instructorId: user.uid,
          title: draft.title.trim(),
          description: draft.description.trim(),
          moduleTitle: draft.moduleTitle.trim() || 'Core Curriculum',
          order: order++,
          videoUrl: draft.videoUrl.trim(),
          content: draft.content.trim(),
          durationMinutes: Number(draft.durationMinutes) || 10,
          isPublished: true,
        });
      }

      navigate('/instructor');
    } catch (err: unknown) {
      console.error('Course creation error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create course.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          to="/instructor"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Instructor Studio</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Course</h1>
        <p className="text-xs text-slate-500">
          Design your technical curriculum, organize lessons into modules, and publish to the marketplace.
        </p>
      </div>

      {error && <ErrorMessage title="Failed to Save Course" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Course Overview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">1. Course Information</h2>
            <p className="text-xs text-slate-500">Primary metadata, target domain, and difficulty</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems Architecture & Microservices"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
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
              placeholder="A comprehensive breakdown of distributed consensus, message brokers, and fault-tolerant architecture..."
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden leading-relaxed"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-600 block mt-1">
                Optional: leave blank for an automatically themed engineering thumbnail.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Course Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3h 45m"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
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
              placeholder="Design fault-tolerant backend microservices&#10;Implement distributed transactions with Saga pattern&#10;Tune latency and throughput on message queues"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Pricing indicator */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-900">Course Pricing</span>
              <p className="text-[11px] text-slate-500">
                All EduTrack courses are 100% free for educational and open research purposes.
              </p>
            </div>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              FREE ($0.00)
            </span>
          </div>
        </div>

        {/* Step 2: Curriculum Lessons Builder */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Curriculum Lessons & Modules</h2>
              <p className="text-xs text-slate-500">
                Group lessons by module, embed YouTube video URLs, and provide text study notes
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLesson}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lesson
            </button>
          </div>

          <div className="space-y-5">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-800 text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Lesson #{idx + 1}
                    </span>
                  </div>
                  {lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Module / Section Name
                    </label>
                    <input
                      type="text"
                      value={lesson.moduleTitle}
                      onChange={(e) => handleLessonChange(idx, 'moduleTitle', e.target.value)}
                      placeholder="e.g. Module 1: Foundations"
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
                      placeholder="e.g. Setting Up High-Performance Indexes"
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
                      value={lesson.videoUrl}
                      onChange={(e) => handleLessonChange(idx, 'videoUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={lesson.durationMinutes}
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
                    value={lesson.description}
                    onChange={(e) => handleLessonChange(idx, 'description', e.target.value)}
                    placeholder="Brief explanation of concepts covered in this lesson..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Text-Based Content & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={lesson.content}
                    onChange={(e) => handleLessonChange(idx, 'content', e.target.value)}
                    placeholder="Markdown notes, code snippets, or reference links for learners..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddLesson}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Lesson
            </button>
          </div>
        </div>

        {/* Step 3: Publishing Options & Save */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600"
            />
            <label htmlFor="isPublished" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Publish immediately to the course marketplace
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
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Course</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
