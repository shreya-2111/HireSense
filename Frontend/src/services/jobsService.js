import { apiClient } from './apiClient';
import { INITIAL_JOBS } from '../data/mockJobs';
import { formatIndianDate } from '../utils/formatters';

export const jobsService = {
  async getJobs(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/jobs?${query}` : '/jobs';
      const backendJobs = await apiClient.get(endpoint);
      if (Array.isArray(backendJobs)) {
        return backendJobs.map(normalizeBackendJob);
      }
    } catch (err) {
      console.warn('Could not fetch jobs from backend, loading local state:', err.message);
    }
    const saved = localStorage.getItem('hiresense_jobs');
    return saved ? JSON.parse(saved) : [];
  },


  async getJobById(id) {
    try {
      // Check if numeric backend ID
      const backendJob = await apiClient.get(`/jobs/${id}`);
      if (backendJob) {
        return normalizeBackendJob(backendJob);
      }
    } catch (err) {
      console.warn(`Could not fetch job ${id} from backend:`, err.message);
    }
    const saved = localStorage.getItem('hiresense_jobs');
    const jobs = saved ? JSON.parse(saved) : INITIAL_JOBS;
    const job = jobs.find((j) => String(j.id) === String(id));
    return job || null;
  },

  async createJob(jobData) {
    try {
      let expMin = 2;
      let expMax = 5;
      const expLvl = jobData.experienceLevel || '';
      if (expLvl.includes('0-2')) {
        expMin = 0; expMax = 2;
      } else if (expLvl.includes('2-4')) {
        expMin = 2; expMax = 4;
      } else if (expLvl.includes('3-5')) {
        expMin = 3; expMax = 5;
      } else if (expLvl.includes('5+')) {
        expMin = 5; expMax = 8;
      } else if (expLvl.includes('7+')) {
        expMin = 7; expMax = 12;
      } else {
        const match = expLvl.match(/(\d+)(?:-(\d+)|\+)?/);
        if (match) {
          expMin = parseInt(match[1], 10);
          expMax = match[2] ? parseInt(match[2], 10) : expMin + 3;
        }
      }

      const allSkills = Array.from(new Set([
        ...(jobData.requiredSkills || []),
        ...(jobData.niceToHaveSkills || []),
        ...(jobData.skills || [])
      ])).filter(Boolean);

      const payload = {
        title: jobData.title,
        department: jobData.department || 'Engineering',
        location: jobData.location || 'Remote (India / Global)',
        employment_type: jobData.type || jobData.employment_type || 'Remote',
        description: jobData.description || '',
        experience_min: expMin,
        experience_max: expMax,
        status: jobData.status || 'Active',
        skills: allSkills.length > 0 ? allSkills : (jobData.requiredSkills || []),
      };
      const created = await apiClient.post('/jobs', payload);
      const normalized = normalizeBackendJob(created);
      return {
        ...normalized,
        experience: jobData.experienceLevel || normalized.experience,
        experienceLevel: jobData.experienceLevel || normalized.experienceLevel,
        salaryRange: jobData.salaryRange || '₹12,00,000 - ₹18,00,000 / year',
        hiringManager: jobData.hiringManager || 'Engineering Lead',
      };
    } catch (err) {
      console.warn('Backend createJob failed, creating local fallback job:', err.message);
      return {
        id: `job-${Date.now()}`,
        createdDate: formatIndianDate(new Date()),
        candidatesCount: 0,
        shortlistedCount: 0,
        status: 'Active',
        experience: jobData.experienceLevel || 'Mid-Senior (3-5 yrs)',
        experienceLevel: jobData.experienceLevel || 'Mid-Senior (3-5 yrs)',
        ...jobData,
      };
    }
  },

  async updateJobStatus(id, status) {
    try {
      const updated = await apiClient.put(`/jobs/${id}`, { status });
      return normalizeBackendJob(updated);
    } catch (err) {
      console.warn(`Backend updateJobStatus failed for ${id}:`, err.message);
      return { id, status };
    }
  },

  async addSkills(jobId, skills) {
    try {
      const updated = await apiClient.post(`/jobs/${jobId}/skills`, { skills });
      return normalizeBackendJob(updated);
    } catch (err) {
      console.warn(`Backend addSkills failed for ${jobId}:`, err.message);
      return null;
    }
  },

  async parseJobDescriptionDoc(file, text = null) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (text) {
      formData.append('text', text);
    }
    return await apiClient.post('/jobs/parse-jd', formData);
  },

  async getJobCandidates(jobId) {
    try {
      return await apiClient.get(`/jobs/${jobId}/candidates`);
    } catch (err) {
      console.warn(`Backend getJobCandidates failed for ${jobId}:`, err.message);
      return [];
    }
  }
};

function normalizeBackendJob(job) {
  const expMin = job.experience_min ?? 2;
  const expMax = job.experience_max ?? 5;
  
  let formattedExp = job.experienceLevel || job.experience_level;
  if (!formattedExp) {
    if (expMin === 0 && expMax <= 2) formattedExp = 'Entry-Level (0-2 yrs)';
    else if (expMin === 2 && expMax <= 4) formattedExp = 'Mid-Level (2-4 yrs)';
    else if (expMin === 3 && expMax <= 5) formattedExp = 'Mid-Senior (3-5 yrs)';
    else if (expMin === 5 && expMax <= 8) formattedExp = 'Senior (5+ yrs)';
    else if (expMin >= 7) formattedExp = 'Staff / Lead (7+ yrs)';
    else formattedExp = `${expMin}-${expMax} yrs`;
  }

  return {
    id: job.id,
    title: job.title,
    department: job.department,
    location: job.location,
    type: job.employment_type || 'Remote',
    employment_type: job.employment_type || 'Remote',
    experience: formattedExp,
    experienceLevel: formattedExp,
    experience_min: expMin,
    experience_max: expMax,
    status: job.status || 'Active',
    salaryRange: job.salary_range || job.salaryRange || '₹12,00,000 - ₹18,00,000 / year',
    hiringManager: job.hiring_manager || job.hiringManager || 'Engineering Lead',
    requiredSkills: job.skills || [],
    skills: job.skills || [],
    candidatesCount: job.applicants_count || 0,
    shortlistedCount: job.shortlisted_count || 0,
    interviewsCount: job.interviews_count || 0,
    pipeline: job.pipeline || {
      applied: 0,
      screening: 0,
      shortlisted: 0,
      interview: 0,
      maybe: 0,
      rejected: 0,
      hired: 0
    },
    createdDate: job.created_at ? formatIndianDate(job.created_at) : formatIndianDate(new Date()),
    description: job.description || '',
  };
}
