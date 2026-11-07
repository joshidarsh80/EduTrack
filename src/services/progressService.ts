import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { LessonProgress } from '../types';
import { recalculateEnrollmentProgress } from './enrollmentService';

export function getProgressId(studentId: string, lessonId: string): string {
  return `${studentId}_${lessonId}`;
}

export async function getCourseProgress(studentId: string, courseId: string): Promise<LessonProgress[]> {
  try {
    const progressRef = collection(db, 'progress');
    const q = query(
      progressRef,
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => d.data() as LessonProgress);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'progress');
  }
}

export async function getAllStudentProgress(studentId: string): Promise<LessonProgress[]> {
  try {
    const progressRef = collection(db, 'progress');
    const q = query(progressRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => d.data() as LessonProgress);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'progress');
  }
}

export async function toggleLessonProgress(
  studentId: string,
  courseId: string,
  lessonId: string,
  completed: boolean,
  totalLessons: number
): Promise<LessonProgress> {
  const progressId = getProgressId(studentId, lessonId);
  const now = new Date().toISOString();

  const progressRecord: LessonProgress = {
    id: progressId,
    studentId,
    courseId,
    lessonId,
    completed,
    completedAt: completed ? now : undefined,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'progress', progressId), progressRecord);

    // Refresh course completed count
    const allForCourse = await getCourseProgress(studentId, courseId);
    const completedCount = allForCourse.filter((p) => p.completed).length;

    await recalculateEnrollmentProgress(studentId, courseId, completedCount, totalLessons);

    return progressRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `progress/${progressId}`);
  }
}
