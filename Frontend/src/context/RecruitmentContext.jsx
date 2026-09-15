import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { jobsService } from '../services/jobsService';
import { candidateService } from '../services/candidateService';
import { interviewService } from '../services/interviewService';
import { analyticsService } from '../services/analyticsService';

const RecruitmentContext = createContext(null);

export function RecruitmentProvider({ children }) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('hiresense_token') || sessionStorage.getItem('hiresense_token');
    return Boolean(token);
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('hiresense_token') || sessionStorage.getItem('hiresense_token');
    if (!token) return null;
    const saved = localStorage.getItem('hiresense_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: "Shreya Raval",
      email: "shreyaraval482@gmail.com",
      role: "Talent Acquisition Lead",
      avatar: "SR",
      company: "HireSense AI",
    };
  });

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hiresense_settings');
    return saved ? JSON.parse(saved) : {
      recruiterName: "Shreya Raval",
      recruiterTitle: "Talent Acquisition Lead",
      recruiterEmail: "shreyaraval482@gmail.com",
      companyName: "HireSense AI",
      department: "Talent Acquisition",
      timezone: "Asia/Kolkata (IST, UTC+5:30)",
      emailNewApplicants: true,
      highMatchThreshold: 85,
      dailyInterviewDigest: true,
      skillMatchingSensitivity: "Balanced (Recommended)",
      exportFormat: "PDF",
    };
  });

  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial Fetch from Backend only when Authenticated
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [fetchedJobs, fetchedCandidates, fetchedInterviews] = await Promise.all([
        jobsService.getJobs(),
        candidateService.getCandidates(),
        interviewService.getInterviews(),
      ]);
      setJobs(fetchedJobs || []);
      setCandidates(fetchedCandidates || []);
      setInterviews(fetchedInterviews || []);

      // Sync local storage with true backend data
      localStorage.setItem('hiresense_jobs', JSON.stringify(fetchedJobs || []));
      localStorage.setItem('hiresense_candidates', JSON.stringify(fetchedCandidates || []));
      localStorage.setItem('hiresense_interviews', JSON.stringify(fetchedInterviews || []));
    } catch (err) {
      console.warn('Initial data load from backend error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Persist settings & user
  useEffect(() => {
    if (user) {
      localStorage.setItem('hiresense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hiresense_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hiresense_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast Notification helper
  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Actions
  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const loggedUser = {
      id: res.user?.id || 1,
      name: res.user?.name || "Shreya Raval",
      email: res.user?.email || email,
      role: res.user?.role || "Talent Acquisition Lead",
      company: settings.companyName || "HireSense AI",
    };
    setUser(loggedUser);
    localStorage.setItem('hiresense_user', JSON.stringify(loggedUser));
    setIsAuthenticated(true);
    addToast(`Welcome back, ${loggedUser.name}!`);
    return true;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const newUser = {
      id: res.user?.id || 1,
      name: res.user?.name || userData.name,
      email: res.user?.email || userData.email,
      role: res.user?.role || userData.role || "Talent Acquisition Lead",
      company: userData.company || "HireSense AI",
    };
    setUser(newUser);
    localStorage.setItem('hiresense_user', JSON.stringify(newUser));
    setSettings((prev) => ({
      ...prev,
      recruiterName: newUser.name,
      recruiterEmail: newUser.email,
      companyName: newUser.company,
      recruiterTitle: newUser.role,
    }));
    setIsAuthenticated(true);
    addToast(`Account created! Welcome to HireSense, ${newUser.name}.`);
    return true;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('hiresense_user');
    localStorage.removeItem('hiresense_token');
    sessionStorage.removeItem('hiresense_token');
    setUser(null);
    setIsAuthenticated(false);
    addToast("You have been signed out.", "info");
  };

  // Job Actions
  const addJob = async (newJobData) => {
    try {
      const created = await jobsService.createJob(newJobData);
      setJobs((prev) => [created, ...prev]);
      addToast(`Job opening "${created.title}" created successfully!`);
      return created;
    } catch (err) {
      addToast(err.message || "Failed to create job", "warning");
      throw err;
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    let jobTitle = "Job";
    try {
      await jobsService.updateJobStatus(jobId, newStatus);
    } catch (e) {
      console.warn('Backend updateJobStatus fallback:', e.message);
    }

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          jobTitle = job.title;
          return { ...job, status: newStatus };
        }
        return job;
      })
    );

    if (newStatus === 'Closed') {
      addToast(`Job "${jobTitle}" has been closed.`, "warning");
    } else if (newStatus === 'Active') {
      addToast(`Job "${jobTitle}" is now active and accepting applicants!`, "success");
    } else {
      addToast(`Job "${jobTitle}" status updated to ${newStatus}.`, "info");
    }
  };

  // Candidate Actions
  const updateCandidateStatus = async (candidateId, newStatus) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    try {
      await candidateService.updateCandidateStatus(candidateId, newStatus, candidate?.applicationId);
    } catch (e) {
      console.warn('Backend updateCandidateStatus fallback:', e.message);
    }

    setCandidates((prev) =>
      prev.map((c) => (String(c.id) === String(candidateId) ? { ...c, status: newStatus } : c))
    );
    
    const candidateName = candidate ? candidate.name : "Candidate";
    
    if (newStatus === "Shortlisted") {
      addToast(`${candidateName} marked as Shortlisted!`, "success");
    } else if (newStatus === "Maybe") {
      addToast(`${candidateName} marked for review (Maybe)`, "info");
    } else if (newStatus === "Rejected") {
      addToast(`${candidateName} marked as Rejected`, "warning");
    } else {
      addToast(`Candidate status updated to ${newStatus}`, "info");
    }
  };

  const addCandidate = async (candidateData) => {
    try {
      const created = await candidateService.createCandidate(candidateData);
      setCandidates((prev) => [created, ...prev]);
      if (created.appliedJobId) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === created.appliedJobId
              ? { ...j, candidatesCount: (j.candidatesCount || 0) + 1 }
              : j
          )
        );
      }
      addToast(`Candidate ${created.name} added to pipeline!`);
      return created;
    } catch (err) {
      addToast(err.message || "Failed to create candidate", "warning");
      throw err;
    }
  };

  // Interview Actions
  const scheduleInterview = async (interviewData) => {
    try {
      const created = await interviewService.scheduleInterview(interviewData);
      setInterviews((prev) => [created, ...prev]);
      if (created.candidateId) {
        updateCandidateStatus(created.candidateId, "Interview Scheduled");
      }
      addToast(`Interview scheduled for ${created.candidateName}`);
      return created;
    } catch (err) {
      addToast(err.message || "Failed to schedule interview", "warning");
      throw err;
    }
  };

  const updateInterviewStatus = async (interviewId, newStatus) => {
    try {
      await interviewService.updateInterviewStatus(interviewId, newStatus);
    } catch (e) {
      console.warn('Backend updateInterviewStatus fallback:', e.message);
    }

    let candName = "Candidate";
    setInterviews((prev) =>
      prev.map((i) => {
        if (i.id === interviewId) {
          candName = i.candidateName;
          return { ...i, status: newStatus };
        }
        return i;
      })
    );

    if (newStatus === 'Completed') {
      addToast(`Interview for ${candName} marked as Completed.`, "success");
    } else if (newStatus === 'Pending Feedback') {
      addToast(`Interview for ${candName} marked as Pending Feedback.`, "info");
    } else if (newStatus === 'Cancelled') {
      addToast(`Interview for ${candName} has been cancelled.`, "warning");
    } else {
      addToast(`Interview for ${candName} status set to ${newStatus}.`, "info");
    }
  };

  const attachCandidateToJob = async (candidateId, targetJobId, targetJobTitle) => {
    let candidateName = "Candidate";
    let oldJobId = null;

    try {
      if (typeof candidateId === 'number' && typeof targetJobId === 'number') {
        await candidateService.attachCandidateToJob(candidateId, targetJobId);
      }
    } catch (e) {
      console.warn('Backend attachCandidateToJob fallback:', e.message);
    }

    setCandidates((prev) =>
      prev.map((c) => {
        if (String(c.id) === String(candidateId)) {
          candidateName = c.name;
          oldJobId = c.appliedJobId;
          return {
            ...c,
            appliedJobId: targetJobId,
            appliedRole: targetJobTitle || c.appliedRole,
          };
        }
        return c;
      })
    );

    setJobs((prev) =>
      prev.map((j) => {
        if (String(j.id) === String(targetJobId)) {
          return { ...j, candidatesCount: (j.candidatesCount || 0) + 1 };
        }
        if (oldJobId && String(j.id) === String(oldJobId) && String(j.id) !== String(targetJobId)) {
          return { ...j, candidatesCount: Math.max(0, (j.candidatesCount || 1) - 1) };
        }
        return j;
      })
    );

    addToast(`${candidateName} attached to ${targetJobTitle} pipeline!`);
  };

  const updateInterviewNotes = async (interviewId, notes) => {
    try {
      await interviewService.updateInterviewNotes(interviewId, notes);
    } catch (e) {
      console.warn('Backend updateInterviewNotes fallback:', e.message);
    }

    setInterviews((prev) =>
      prev.map((i) => (i.id === interviewId ? { ...i, notes } : i))
    );
    addToast("Interview notes saved successfully!");
  };

  const updateSettingsData = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast("Settings preferences saved successfully!");
  };

  const isInterviewToday = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const isoToday = `${y}-${m}-${d}`;
    const dateNum = now.getDate();
    const monthName = now.toLocaleString('en-US', { month: 'short' });
    const fullDateStr = `${dateNum} ${monthName} ${y}`;
    
    return dateStr.includes(isoToday) || dateStr.includes(fullDateStr) || (dateStr.includes(`${dateNum}`) && dateStr.includes(monthName));
  };

  // Aggregated Stats directly from state
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalCandidatesCount = candidates.length;
  const reviewedCandidatesCount = candidates.filter((c) => c.status !== 'Under Review' && c.status !== 'Applied').length;
  const scheduledInterviewsCount = interviews.filter((i) => i.status === 'Scheduled').length;
  const todayInterviewsCount = interviews.filter((i) => i.status === 'Scheduled' && isInterviewToday(i.date)).length;

  return (
    <RecruitmentContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        refreshData,
        login,
        register,
        logout,
        jobs,
        candidates,
        interviews,
        settings,
        toasts,
        activeJobsCount,
        totalCandidatesCount,
        reviewedCandidatesCount,
        scheduledInterviewsCount,
        todayInterviewsCount,
        addJob,
        updateJobStatus,
        updateCandidateStatus,
        addCandidate,
        attachCandidateToJob,
        scheduleInterview,
        updateInterviewStatus,
        updateInterviewNotes,
        updateSettings: updateSettingsData,
        addToast,
        removeToast,
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
}

export function useRecruitment() {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
}
