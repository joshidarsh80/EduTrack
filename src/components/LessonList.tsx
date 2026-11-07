import React from 'react';
import { CheckCircle2, Circle, Play, Lock, Clock } from 'lucide-react';
import { Lesson, LessonProgress } from '../types';

interface LessonListProps {
  lessons: Lesson[];
  activeLessonId?: string;
  progressList?: LessonProgress[];
  onSelectLesson?: (lesson: Lesson) => void;
  isEnrolled?: boolean;
  interactive?: boolean;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  activeLessonId,
  progressList = [],
  onSelectLesson,
  isEnrolled = false,
  interactive = true,
}) => {
  // Group lessons by moduleTitle
  const grouped = React.useMemo(() => {
    const map = new Map<string, Lesson[]>();
    lessons.forEach((lesson) => {
      const moduleName = lesson.moduleTitle || 'Course Curriculum';
      if (!map.has(moduleName)) {
        map.set(moduleName, []);
      }
      map.get(moduleName)!.push(lesson);
    });
    return Array.from(map.entries());
  }, [lessons]);

  const completedMap = React.useMemo(() => {
    const map = new Set<string>();
    progressList.forEach((p) => {
      if (p.completed) map.add(p.lessonId);
    });
    return map;
  }, [progressList]);

  if (lessons.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500">
        No curriculum lessons added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([moduleTitle, moduleLessons], groupIndex) => (
        <div key={moduleTitle} className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>{moduleTitle}</span>
              <span className="text-[11px] font-normal text-slate-500">
                {moduleLessons.length} {moduleLessons.length === 1 ? 'lesson' : 'lessons'}
              </span>
            </h4>
          </div>
          <div className="divide-y divide-slate-100">
            {moduleLessons.map((lesson, idx) => {
              const isActive = lesson.id === activeLessonId;
              const isCompleted = completedMap.has(lesson.id);
              const canClick = interactive && (isEnrolled || idx === 0);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  disabled={!canClick && !interactive}
                  onClick={() => canClick && onSelectLesson?.(lesson)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                    isActive
                      ? 'bg-emerald-50/70 text-emerald-950 font-medium'
                      : canClick
                      ? 'hover:bg-slate-50/80 text-slate-700'
                      : 'text-slate-400 bg-slate-50/20 cursor-not-allowed'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isActive ? (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-800 text-white">
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </div>
                    ) : !isEnrolled && idx > 0 ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${isActive ? 'font-bold text-emerald-900' : 'font-medium'}`}>
                        {lesson.order}. {lesson.title}
                      </p>
                      {lesson.durationMinutes && (
                        <span className="text-[10px] text-slate-600 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {lesson.durationMinutes}m
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-1">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
