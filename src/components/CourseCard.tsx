import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Users, Award, Play } from 'lucide-react';
import { Course } from '../types';
import { ProgressBar } from './ProgressBar';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  progressPercentage?: number;
  lastLessonId?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolled = false,
  progressPercentage,
  lastLessonId,
}) => {
  const difficultyColors = {
    Beginner: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Intermediate: 'bg-blue-50 text-blue-800 border-blue-200',
    Advanced: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  const defaultThumbnail =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div>
        {/* Course Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={course.thumbnailUrl || defaultThumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultThumbnail;
            }}
          />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-xs">
              {course.category}
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs ${
                difficultyColors[course.difficulty] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {course.difficulty}
            </span>
          </div>
          {course.price === 0 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-emerald-800 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
              FREE
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed">
            {course.description}
          </p>

          {/* Instructor line */}
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 uppercase">
              {course.instructorName ? course.instructorName.charAt(0) : 'I'}
            </div>
            <span className="text-xs text-slate-600 font-medium truncate">
              {course.instructorName || 'EduTrack Instructor'}
            </span>
          </div>

          {/* Metadata badges */}
          <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.duration || 'Flexible'}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.totalLessons || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.enrolledCount || 0} students</span>
            </div>
          </div>

          {/* Progress bar if enrolled */}
          {isEnrolled && progressPercentage !== undefined && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <ProgressBar progress={progressPercentage} showLabel size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-5 pt-0">
        {isEnrolled ? (
          <Link
            to={lastLessonId ? `/learn/${course.id}/${lastLessonId}` : `/learn/${course.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Continue Learning
          </Link>
        ) : (
          <Link
            to={`/courses/${course.id}`}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 transition-colors"
          >
            View Course Details
          </Link>
        )}
      </div>
    </div>
  );
};
