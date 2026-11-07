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
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Lesson } from '../types';

export async function getLessonsByCourse(courseId: string, isInstructorOwner?: boolean): Promise<Lesson[]> {
  try {
    const lessonsRef = collection(db, 'lessons');
    const q = isInstructorOwner
      ? query(lessonsRef, where('courseId', '==', courseId))
      : query(lessonsRef, where('courseId', '==', courseId), where('isPublished', '==', true));
    const snapshot = await getDocs(q);

    const lessons = snapshot.docs.map((d) => d.data() as Lesson);
    return lessons.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error in getLessonsByCourse:', error);
    return [];
  }
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    const snap = await getDoc(lessonRef);
    if (!snap.exists()) return null;
    return snap.data() as Lesson;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `lessons/${lessonId}`);
  }
}

export async function createLesson(
  lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<Lesson> {
  const lessonId = lessonData.id || `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newLesson: Lesson = {
    ...lessonData,
    id: lessonId,
    isPublished: lessonData.isPublished ?? true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'lessons', lessonId), newLesson);

    // Update course totalLessons count
    const courseRef = doc(db, 'courses', lessonData.courseId);
    await updateDoc(courseRef, {
      totalLessons: increment(1),
      updatedAt: now,
    });

    return newLesson;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `lessons/${lessonId}`);
  }
}

export async function updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<void> {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    await updateDoc(lessonRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `lessons/${lessonId}`);
  }
}

export async function deleteLesson(lessonId: string, courseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));

    // Decrement course totalLessons count
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      totalLessons: increment(-1),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `lessons/${lessonId}`);
  }
}
