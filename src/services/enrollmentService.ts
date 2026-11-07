import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Course, Enrollment } from '../types';

export function getEnrollmentId(studentId: string, courseId: string): string {
  return `${studentId}_${courseId}`;
}

export async function checkEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
  try {
    const enrollmentId = getEnrollmentId(studentId, courseId);
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    const snap = await getDoc(enrollmentRef);
    if (!snap.exists()) return null;
    return snap.data() as Enrollment;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `enrollments/${getEnrollmentId(studentId, courseId)}`);
  }
}

export async function enrollInCourse(
  studentId: string,
  course: Course,
  firstLessonId?: string
): Promise<Enrollment> {
  const enrollmentId = getEnrollmentId(studentId, course.id);
  const now = new Date().toISOString();

  // Check if already enrolled
  const existing = await checkEnrollment(studentId, course.id);
  if (existing) {
    return existing;
  }

  const enrollmentData: Enrollment = {
    id: enrollmentId,
    studentId,
    instructorId: course.instructorId,
    courseId: course.id,
    courseTitle: course.title,
    courseThumbnail: course.thumbnailUrl || '',
    category: course.category,
    enrolledAt: now,
    lastAccessedLessonId: firstLessonId || '',
    lastAccessedAt: now,
    completedLessonsCount: 0,
    totalLessons: course.totalLessons || 0,
    progressPercentage: 0,
    status: 'active',
  };

  try {
    await setDoc(doc(db, 'enrollments', enrollmentId), enrollmentData);

    // Increment enrolledCount on course
    const courseRef = doc(db, 'courses', course.id);
    await updateDoc(courseRef, {
      enrolledCount: increment(1),
    });

    return enrollmentData;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `enrollments/${enrollmentId}`);
  }
}

export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(enrollmentsRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((d) => d.data() as Enrollment);
    return list.sort((a, b) => (b.lastAccessedAt || b.enrolledAt).localeCompare(a.lastAccessedAt || a.enrolledAt));
  } catch (error) {
    console.error('Error in getStudentEnrollments:', error);
    return [];
  }
}

export async function getInstructorEnrollments(instructorId: string): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(enrollmentsRef, where('instructorId', '==', instructorId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => d.data() as Enrollment);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'enrollments');
  }
}

export async function updateEnrollmentActivity(
  studentId: string,
  courseId: string,
  lessonId: string
): Promise<void> {
  try {
    const enrollmentId = getEnrollmentId(studentId, courseId);
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentRef, {
      lastAccessedLessonId: lessonId,
      lastAccessedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `enrollments/${getEnrollmentId(studentId, courseId)}`);
  }
}

export async function recalculateEnrollmentProgress(
  studentId: string,
  courseId: string,
  completedCount: number,
  totalLessons: number
): Promise<void> {
  try {
    const enrollmentId = getEnrollmentId(studentId, courseId);
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isCompleted = totalLessons > 0 && completedCount >= totalLessons;

    await updateDoc(enrollmentRef, {
      completedLessonsCount: completedCount,
      totalLessons,
      progressPercentage: pct,
      status: isCompleted ? 'completed' : 'active',
      lastAccessedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `enrollments/${getEnrollmentId(studentId, courseId)}`);
  }
}
