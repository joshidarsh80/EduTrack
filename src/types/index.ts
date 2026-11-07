export type UserRole = 'student' | 'instructor';

export type CourseCategory =
  | 'Web Development'
  | 'Programming'
  | 'Computer Science'
  | 'Database Management'
  | 'Design'
  | 'Business';

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  thumbnailUrl?: string;
  learningObjectives?: string;
  duration?: string;
  price: number;
  isPublished: boolean;
  instructorId: string;
  instructorName?: string;
  instructorEmail?: string;
  totalLessons?: number;
  enrolledCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  instructorId: string;
  title: string;
  description?: string;
  moduleTitle?: string;
  order: number;
  videoUrl?: string;
  content?: string;
  durationMinutes?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: string; // `${studentId}_${courseId}`
  studentId: string;
  instructorId?: string;
  courseId: string;
  courseTitle?: string;
  courseThumbnail?: string;
  category?: string;
  enrolledAt: string;
  lastAccessedLessonId?: string;
  lastAccessedAt?: string;
  completedLessonsCount?: number;
  totalLessons?: number;
  progressPercentage?: number;
  status: 'active' | 'completed';
}

export interface LessonProgress {
  id: string; // `${studentId}_${lessonId}`
  studentId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export interface CourseStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  averageProgress: number;
}
