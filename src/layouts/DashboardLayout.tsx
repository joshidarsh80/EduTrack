import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { InstructorPromotionModal } from '../components/InstructorPromotionModal';

interface DashboardLayoutProps {
  mode?: 'student' | 'instructor';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ mode = 'student' }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans antialiased">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode={mode} onOpenRolesGuide={() => setModalOpen(true)} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <InstructorPromotionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
