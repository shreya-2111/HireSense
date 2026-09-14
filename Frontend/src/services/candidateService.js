import { apiClient } from './apiClient';
import { INITIAL_CANDIDATES } from '../data/mockCandidates';
import { formatIndianDate } from '../utils/formatters';

export const candidateService = {
  async getCandidates(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/candidates?${query}` : '/candidates';
      const backendCandidates = await apiClient.get(endpoint);
      if (Array.isArray(backendCandidates)) {
        return backendCandidates.map(normalizeBackendCandidate);
      }
    } catch (err) {
      console.warn('Could not fetch candidates from backend, loading local state:', err.message);
    }
    const saved = localStorage.getItem('hiresense_candidates');
    return saved ? JSON.parse(saved) : [];
  },


  async getCandidateById(id) {
    try {
      const backendCandidate = await apiClient.get(`/candidates/${id}`);
      if (backendCandidate) {
        return normalizeBackendCandidate(backendCandidate);
      }
    } catch (err) {
      console.warn(`Could not fetch candidate ${id} from backend:`, err.message);
    }
    const saved = localStorage.getItem('hiresense_candidates');
    const candidates = saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    const candidate = candidates.find((c) => String(c.id) === String(id));
    return candidate || null;
  },

  async createCandidate(candidateData) {
    try {
      const payload = {
        name: candidateData.name,
        email: candidateData.email || `${candidateData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: candidateData.phone || null,
        location: candidateData.location || 'Remote',
        experience_years: parseInt(candidateData.experienceYears ?? candidateData.experience ?? candidateData.experience_years ?? 0, 10),
        education: candidateData.education || 'Not specified',
        current_company: candidateData.currentCompany || candidateData.current_company || 'Independent',
        current_role: candidateData.role || candidateData.appliedRole || candidateData.current_role || 'Applicant',
        summary: candidateData.summary || '',
        skills: candidateData.skills || candidateData.matchedSkills || [],
        job_id: candidateData.appliedJobId ? parseInt(candidateData.appliedJobId, 10) : null,
        match_score: candidateData.matchScore || candidateData.match_score || 0,
      };
      const created = await apiClient.post('/candidates', payload);
      return normalizeBackendCandidate(created);
    } catch (err) {
      console.warn('Backend createCandidate failed, returning local fallback:', err.message);
      return {
        id: `cand-${Date.now()}`,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Under Review',
        avatar: candidateData.name
          ? candidateData.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
          : 'CD',
        ...candidateData,
      };
    }
  },

  async updateCandidateStatus(id, status, applicationId = null) {
    try {
      if (applicationId) {
        await apiClient.patch(`/applications/${applicationId}/status`, { status });
      } else {
        await apiClient.put(`/candidates/${id}`, { status });
      }
      return { id, status };
    } catch (err) {
      console.warn(`Backend updateCandidateStatus failed for ${id}:`, err.message);
      return { id, status };
    }
  },

  async attachCandidateToJob(candidateId, jobId) {
    try {
      const updated = await apiClient.post(`/jobs/${jobId}/candidates/${candidateId}`);
      return normalizeBackendCandidate(updated);
    } catch (err) {
      console.warn(`Backend attachCandidateToJob failed for cand ${candidateId} to job ${jobId}:`, err.message);
      return null;
    }
  },

  async generateQuestions({ candidate, job, type, difficulty, count }) {
    try {
      const payload = {
        candidate_id: candidate?.id && typeof candidate.id === 'number' ? candidate.id : null,
        job_id: job?.id && typeof job.id === 'number' ? job.id : null,
        category: type || 'Technical',
        difficulty: difficulty || 'Medium',
        quantity: count || 5,
        candidate_name: candidate?.name || 'Candidate',
        job_title: job?.title || 'Software Engineer',
        skills: candidate?.skills || candidate?.matchedSkills || job?.requiredSkills || [],
      };
      const backendQuestions = await apiClient.post('/interviews/questions/generate', payload);
      if (Array.isArray(backendQuestions) && backendQuestions.length > 0) {
        return backendQuestions.map((q, idx) => ({
          id: q.id || `q-${Date.now()}-${idx}`,
          type: q.category || type || 'Technical',
          difficulty: q.difficulty || difficulty || 'Medium',
          question: q.question,
          rationale: `Targeted for ${job?.title || 'role'} and candidate skill profile.`,
          targetSkill: candidate?.matchedSkills?.[0] || 'Technical Proficiency',
        }));
      }
    } catch (err) {
      console.warn('Backend generateQuestions failed, using smart fallback questions:', err.message);
    }

    // Fallback template questions
    const baseQuestions = [
      {
        id: `q-${Date.now()}-1`,
        type: type || 'Technical',
        difficulty: difficulty || 'Medium',
        question: `How would you architect and optimize a high-traffic ${job?.title || 'system'} handling real-time data updates?`,
        rationale: `Probes core architecture skills relevant to ${job?.title || 'the role'}.`,
        targetSkill: 'Architecture & Scalability'
      },
      {
        id: `q-${Date.now()}-2`,
        type: type || 'Technical',
        difficulty: difficulty || 'Medium',
        question: `Explain the trade-offs between client-side state caching versus server state synchronization in large applications.`,
        rationale: `Evaluates state management depth and memory lifecycle.`,
        targetSkill: candidate?.matchedSkills?.[0] || 'Core Technologies'
      },
      {
        id: `q-${Date.now()}-3`,
        type: type || 'Behavioral',
        difficulty: difficulty || 'Medium',
        question: `Describe a scenario where you had to bridge technical debt with urgent product delivery deadlines. How did you prioritize?`,
        rationale: `Assesses engineering diplomacy and pragmatic trade-off handling.`,
        targetSkill: 'Project Leadership'
      },
      {
        id: `q-${Date.now()}-4`,
        type: type || 'Experience',
        difficulty: difficulty || 'Medium',
        question: `Given that our stack uses modern frameworks and your recent experience focused on related areas, how do you rapidly ramp up?`,
        rationale: `Directly investigates identified skill ramp-up speed.`,
        targetSkill: 'Skill Adaptability'
      },
      {
        id: `q-${Date.now()}-5`,
        type: type || 'Situational',
        difficulty: difficulty || 'Medium',
        question: `Walk through your systematic debugging process when a production regression is reported with intermittent reproduction steps.`,
        rationale: `Tests troubleshooting and telemetry analysis maturity.`,
        targetSkill: 'Production Reliability'
      }
    ];
    return baseQuestions.slice(0, count || 5);
  }
};

function normalizeBackendCandidate(c) {
  const name = c.name || 'Candidate';
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  return {
    id: c.id,
    applicationId: c.application_id,
    name: name,
    avatar: initials || 'CD',
    role: c.current_role || 'Candidate',
    appliedRole: c.applied_job || c.current_role || 'General Application',
    appliedJobId: c.applied_job_id || null,
    currentCompany: c.current_company || 'Independent',
    experience: `${c.experience_years || 0} years`,
    experienceYears: c.experience_years || 0,
    education: c.education || 'Not specified',
    matchScore: Math.round(c.match_score || 0),
    status: c.status || 'Under Review',
    recommendation: c.recommendation || 'Review',
    skills: c.skills || [],
    matchedSkills: c.skills ? c.skills.slice(0, 4) : [],
    missingSkills: [],
    email: c.email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: c.phone || null,
    location: c.location || 'Remote',
    summary: c.summary || 'Candidate profile in pipeline.',
    appliedDate: c.created_at ? formatIndianDate(c.created_at) : formatIndianDate(new Date()),
    resumeFileName: c.resume_file_name || null,
    resumeId: c.resume_id || null,
  };
}
