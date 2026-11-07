import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ExploreCoursesPage } from '../pages/ExploreCoursesPage';
import { CourseDetailsPage } from '../pages/CourseDetailsPage';
import { StudentDashboardPage } from '../pages/StudentDashboardPage';
import { MyLearningPage } from '../pages/MyLearningPage';
import { LearningPlayerPage } from '../pages/LearningPlayerPage';
import { InstructorDashboardPage } from '../pages/InstructorDashboardPage';
import { CreateCoursePage } from '../pages/CreateCoursePage';
import { EditCoursePage } from '../pages/EditCoursePage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<ExploreCoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* Student Protected Pages in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout mode="student" />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<StudentDashboardPage />} />
        <Route path="/my-learning" element={<MyLearningPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Instructor Protected Pages in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute requireInstructor={true}>
            <DashboardLayout mode="instructor" />
          </ProtectedRoute>
        }
      >
        <Route path="/instructor" element={<InstructorDashboardPage />} />
        <Route path="/instructor/courses/new" element={<CreateCoursePage />} />
        <Route path="/instructor/courses/:courseId/edit" element={<EditCoursePage />} />
      </Route>

      {/* Dedicated Immersive Learning Player */}
      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute>
            <LearningPlayerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:courseId/:lessonId"
        element={
          <ProtectedRoute>
            <LearningPlayerPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
