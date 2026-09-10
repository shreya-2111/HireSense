import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_JOBS } from '../data/mockJobs';
import { INITIAL_CANDIDATES } from '../data/mockCandidates';
import { INITIAL_INTERVIEWS } from '../data/mockInterviews';

const RecruitmentContext = createContext(null);

export function RecruitmentProvider({ children }) {
  // Authentication state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hiresense_user');
    return saved ? JSON.parse(saved) : {
      name: "Sarah Lin",
      email: "sarah.lin@hiresense.internal",
      role: "Senior Technical Recruiter",
      company: "Acme Cloud Technologies",
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Clear legacy localStorage auth flag if present so users start at the login page
    try {
      localStorage.removeItem('hiresense_auth');
    } catch (e) {
      // ignore
    }
    const saved = sessionStorage.getItem('hiresense_auth');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Load from localStorage or fallback to mock data
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('hiresense_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('hiresense_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [interviews, setInterviews] = useState(() => {
    const saved = localStorage.getItem('hiresense_interviews');
    return saved ? JSON.parse(saved) : INITIAL_INTERVIEWS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hiresense_settings');
    return saved ? JSON.parse(saved) : {
      recruiterName: "Sarah Lin",
      recruiterTitle: "Senior Technical Recruiter",
      recruiterEmail: "sarah.lin@hiresense.internal",
      companyName: "Acme Cloud Technologies",
      department: "Talent Acquisition",
      timezone: "America/New_York (EST)",
      emailNewApplicants: true,
      highMatchThreshold: 85,
      dailyInterviewDigest: true,
      skillMatchingSensitivity: "Balanced (Recommended)",
      exportFormat: "PDF",
    };
  });

  const [toasts, setToasts] = useState([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('hiresense_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem('hiresense_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('hiresense_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('hiresense_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('hiresense_interviews', JSON.stringify(interviews));
  }, [interviews]);

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
  const login = (email, password) => {
    const loggedUser = {
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      role: "Senior Technical Recruiter",
      company: settings.companyName || "Acme Cloud Technologies",
    };
    setUser(loggedUser);
    setIsAuthenticated(true);
    addToast(`Welcome back, ${loggedUser.name}!`);
    return true;
  };

  const register = (userData) => {
    const newUser = {
      name: userData.name,
      email: userData.email,
      role: userData.role || "Technical Recruiter",
      company: userData.company || "Enterprise Co",
    };
    setUser(newUser);
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
    setIsAuthenticated(false);
    addToast("You have been signed out.", "info");
  };

  // Job Actions
  const addJob = (newJobData) => {
    const newJob = {
      id: `job-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      candidatesCount: 0,
      shortlistedCount: 0,
      status: 'Active',
      ...newJobData,
    };
    setJobs((prev) => [newJob, ...prev]);
    addToast(`Job opening "${newJob.title}" created successfully!`);
    return newJob;
  };

  const updateJobStatus = (jobId, newStatus) => {
    let jobTitle = "Job";
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
  const updateCandidateStatus = (candidateId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
    
    const candidate = candidates.find((c) => c.id === candidateId);
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

  const addCandidate = (candidateData) => {
    const newCand = {
      id: `cand-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      avatar: candidateData.name
        ? candidateData.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
        : 'NC',
      ...candidateData,
    };

    setCandidates((prev) => [newCand, ...prev]);
    if (newCand.appliedJobId) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === newCand.appliedJobId
            ? { ...j, candidatesCount: (j.candidatesCount || 0) + 1 }
            : j
        )
      );
    }
    addToast(`Candidate ${newCand.name} added to pipeline!`);
    return newCand;
  };

  // Interview Actions
  const scheduleInterview = (interviewData) => {
    const newInt = {
      id: `int-${Date.now()}`,
      status: 'Scheduled',
      meetingLink: `https://meet.hiresense.internal/int-${Date.now()}`,
      ...interviewData,
    };
    setInterviews((prev) => [newInt, ...prev]);
    
    if (newInt.candidateId) {
      updateCandidateStatus(newInt.candidateId, "Interview Scheduled");
    }
    addToast(`Interview scheduled for ${newInt.candidateName}`);
    return newInt;
  };

  const updateInterviewStatus = (interviewId, newStatus) => {
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

  const attachCandidateToJob = (candidateId, targetJobId, targetJobTitle) => {
    let candidateName = "Candidate";
    let oldJobId = null;

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
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
        if (j.id === targetJobId) {
          return { ...j, candidatesCount: (j.candidatesCount || 0) + 1 };
        }
        if (oldJobId && j.id === oldJobId && j.id !== targetJobId) {
          return { ...j, candidatesCount: Math.max(0, (j.candidatesCount || 1) - 1) };
        }
        return j;
      })
    );

    addToast(`${candidateName} attached to ${targetJobTitle} pipeline!`);
  };

  const updateInterviewNotes = (interviewId, notes) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === interviewId ? { ...i, notes } : i))
    );
    addToast("Interview notes saved successfully!");
  };

  const updateSettingsData = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast("Settings preferences saved successfully!");
  };

  // Aggregated Stats
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalCandidatesCount = candidates.length;
  const reviewedCandidatesCount = candidates.filter((c) => c.status !== 'Under Review').length;
  const scheduledInterviewsCount = interviews.filter((i) => i.status === 'Scheduled').length;

  return (
    <RecruitmentContext.Provider
      value={{
        user,
        isAuthenticated,
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
