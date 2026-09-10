import { INITIAL_JOBS } from '../data/mockJobs';

// Service layer designed to seamlessly connect to FastAPI backend:
// Later: const API_BASE = '/api/v1/jobs';
export const jobsService = {
  async getJobs() {
    // Simulated async network call
    return new Promise((resolve) => {
      setTimeout(() => {
        const saved = localStorage.getItem('hiresense_jobs');
        resolve(saved ? JSON.parse(saved) : INITIAL_JOBS);
      }, 100);
    });
  },

  async getJobById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const saved = localStorage.getItem('hiresense_jobs');
        const jobs = saved ? JSON.parse(saved) : INITIAL_JOBS;
        const job = jobs.find((j) => j.id === id);
        if (job) resolve(job);
        else reject(new Error('Job not found'));
      }, 100);
    });
  },

  async createJob(jobData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newJob = {
          id: `job-${Date.now()}`,
          createdDate: new Date().toISOString().split('T')[0],
          candidatesCount: 0,
          shortlistedCount: 0,
          status: 'Active',
          ...jobData,
        };
        resolve(newJob);
      }, 150);
    });
  },

  async updateJobStatus(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, status });
      }, 100);
    });
  }
};
