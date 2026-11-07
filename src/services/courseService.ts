import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Course, CourseCategory, CourseDifficulty } from '../types';

export const COURSE_CATEGORIES: CourseCategory[] = [
  'Web Development',
  'Programming',
  'Computer Science',
  'Database Management',
  'Design',
  'Business',
];

export const COURSE_DIFFICULTIES: CourseDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

export async function getPublishedCourses(filters?: {
  category?: string;
  difficulty?: string;
  searchQuery?: string;
}): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'courses');
    // Query published courses
    const q = query(coursesRef, where('isPublished', '==', true));
    const snapshot = await getDocs(q);

    let courses: Course[] = snapshot.docs.map((d) => d.data() as Course);

    if (filters?.category && filters.category !== 'All') {
      courses = courses.filter((c) => c.category === filters.category);
    }
    if (filters?.difficulty && filters.difficulty !== 'All') {
      courses = courses.filter((c) => c.difficulty === filters.difficulty);
    }
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const qLower = filters.searchQuery.toLowerCase().trim();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(qLower) ||
          c.description.toLowerCase().includes(qLower) ||
          c.category.toLowerCase().includes(qLower) ||
          c.instructorName?.toLowerCase().includes(qLower)
      );
    }

    return courses.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error fetching published courses:', error);
    return [];
  }
}

export function subscribeToPublishedCourses(
  onUpdate: (courses: Course[]) => void,
  onError: (error: Error) => void
): () => void {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('isPublished', '==', true));
    return onSnapshot(
      q,
      (snapshot) => {
        const courses = snapshot.docs.map((d) => d.data() as Course);
        const sorted = courses.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(sorted);
      },
      (err) => {
        console.error('Snapshot listener error for published courses:', err);
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    );
  } catch (err) {
    console.error('Failed to attach course snapshot listener:', err);
    onError(err instanceof Error ? err : new Error(String(err)));
    return () => {};
  }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const snap = await getDoc(courseRef);
    if (!snap.exists()) return null;
    return snap.data() as Course;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return null;
  }
}

export async function getInstructorCourses(instructorId: string): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('instructorId', '==', instructorId));
    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map((d) => d.data() as Course);
    return courses.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return [];
  }
}

export async function createCourse(
  courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount' | 'totalLessons' | 'price'> & {
    id?: string;
    price?: number;
  }
): Promise<Course> {
  const courseId = courseData.id || `course_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newCourse: Course = {
    ...courseData,
    id: courseId,
    price: 0, // All courses free as per specifications
    totalLessons: 0,
    enrolledCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'courses', courseId), newCourse);
    return newCourse;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `courses/${courseId}`);
  }
}

export async function updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(courseRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `courses/${courseId}`);
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const courseRef = doc(db, 'courses', courseId);
    // Delete course document
    await deleteDoc(courseRef);

    // Delete associated lessons
    const lessonsRef = collection(db, 'lessons');
    const q = query(lessonsRef, where('courseId', '==', courseId));
    const lessonsSnap = await getDocs(q);
    if (!lessonsSnap.empty) {
      const batch = writeBatch(db);
      lessonsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
  }
}
