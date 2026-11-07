import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface InstructorPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructorPromotionModal: React.FC<InstructorPromotionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Instructor Role Setup Guide</h3>
            <p className="text-xs text-slate-500">Security Architecture & Role Promotion</p>
          </div>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <p>
            In accordance with zero-trust database security standards, <strong className="text-slate-900">EduTrack</strong> prevents ordinary users from granting themselves instructor privileges from the client.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Your User ID (UID)
            </span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono font-bold text-slate-800 break-all">
                {user?.uid || 'Not signed in'}
              </code>
              {user?.uid && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy UID'}
                </button>
              )}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Current Role in Firestore:{' '}
              <span className="font-bold text-emerald-800 uppercase">{profile?.role || 'student'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-800" />
              How to Promote an Account in Firebase Console:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
              <li>
                Open the{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 font-semibold inline-flex items-center gap-0.5 hover:underline"
                >
                  Firebase Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and navigate to your project.
              </li>
              <li>Under Build, select <strong>Firestore Database</strong>.</li>
              <li>Click on the <strong>users</strong> collection.</li>
              <li>Select your document matching your UID above.</li>
              <li>
                Find the <code>role</code> field (or add a new field named <code>role</code> of type string).
              </li>
              <li>
                Set the value to <code className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">instructor</code> and click Save.
              </li>
              <li>Return to EduTrack. The role updates immediately without re-logging in!</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition-colors"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
