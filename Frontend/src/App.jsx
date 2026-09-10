import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RecruitmentProvider, useRecruitment } from './context/RecruitmentContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/ui/Toast';

// Main Application Pages
import { DashboardPage } from './pages/DashboardPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailsPage } from './pages/CandidateDetailsPage';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useRecruitment();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area with Sticky Header */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-slate-50/60 focus:outline-none">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/create" element={<CreateJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:id" element={<CandidateDetailsPage />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/resume-analysis" element={<Navigate to="/resume-analyzer" replace />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function MainRoutes() {
  return (
    <>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Application Shell */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <RecruitmentProvider>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </RecruitmentProvider>
  );
}
