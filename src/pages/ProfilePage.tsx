import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Edit2,
  Save,
  Loader2,
  Sparkles,
  Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Enrollment, LessonProgress } from '../types';
import { getStudentEnrollments } from '../services/enrollmentService';
import { getAllStudentProgress } from '../services/progressService';
import { DashboardCard } from '../components/DashboardCard';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InstructorPromotionModal } from '../components/InstructorPromotionModal';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileInfo } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile form
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [enrolled, prog] = await Promise.all([
          getStudentEnrollments(user.uid),
          getAllStudentProgress(user.uid),
        ]);
        setEnrollments(enrolled);
        setProgressList(prog);
      } catch (err) {
        console.error('Failed to load profile learning stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileInfo({
        name: name.trim(),
        bio: bio.trim(),
        photoURL: photoURL.trim(),
      });
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading student profile from Firestore..." />;
  }

  const completedLessonsCount = progressList.filter((p) => p.completed).length;
  const completedCourses = enrollments.filter(
    (e) => (e.progressPercentage || 0) >= 100 || e.status === 'completed'
  );
  const totalLessonsAcrossAll = enrollments.reduce((sum, e) => sum + (e.totalLessons || 0), 0);
  const completionPercentage =
    totalLessonsAcrossAll > 0
      ? Math.min(100, Math.round((completedLessonsCount / totalLessonsAcrossAll) * 100))
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-800/20"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-800 text-white font-black text-2xl uppercase shadow-xs">
                  {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
              <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white p-1 shadow-xs border border-slate-200">
                <span className="block h-3 w-3 rounded-full bg-emerald-500" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                  {profile?.name || user?.email?.split('@')[0]}
                </h1>
                <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
                  {profile?.role || 'student'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Member since{' '}
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : 'Recent'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100/80 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Roles Guide</span>
            </button>
          </div>
        </div>

        {/* Bio preview */}
        {profile?.bio && !isEditing && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              About & Focus Area
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Success toast */}
        {savedSuccess && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avatar / Profile Picture URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bio & Technical Interests
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Computer engineering student specializing in distributed backend systems and frontend architecture..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Real Firestore Learning Stats */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Learning Mastery Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Enrolled Tracks"
            value={enrollments.length}
            subtitle="Registered curricula"
            icon={BookOpen}
          />
          <DashboardCard
            title="Lessons Completed"
            value={completedLessonsCount}
            subtitle="Verified progress entries"
            icon={CheckCircle2}
          />
          <DashboardCard
            title="Tracks Completed"
            value={completedCourses.length}
            subtitle="100% finished courses"
            icon={Award}
          />
          <DashboardCard
            title="Overall Mastery"
            value={`${completionPercentage}%`}
            subtitle="Aggregated progress"
            icon={Sparkles}
            badgeColor="emerald"
          />
        </div>
      </div>

      {/* Enrolled Courses Summary */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enrolled Engineering Tracks</h2>
            <p className="text-xs text-slate-500">Live progress synced with Firestore</p>
          </div>
          <Link to="/courses" className="text-xs font-semibold text-emerald-800 hover:underline">
            Explore More
          </Link>
        </div>

        {enrollments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {enrollments.map((e) => (
              <div key={e.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={
                        e.courseThumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80'
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{e.courseTitle}</h3>
                    <p className="text-[11px] text-slate-500">
                      {e.completedLessonsCount || 0} / {e.totalLessons || 0} lessons completed •{' '}
                      <span className="font-semibold text-emerald-800">{e.progressPercentage || 0}%</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-28 hidden sm:block">
                    <ProgressBar progress={e.progressPercentage || 0} size="sm" />
                  </div>
                  <Link
                    to={
                      e.lastAccessedLessonId
                        ? `/learn/${e.courseId}/${e.lastAccessedLessonId}`
                        : `/learn/${e.courseId}`
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Open Player
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            You have not enrolled in any courses yet.
          </p>
        )}
      </div>

      <InstructorPromotionModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />
    </div>
  );
};
