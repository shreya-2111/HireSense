import { INITIAL_INTERVIEWS } from '../data/mockInterviews';

export const interviewService = {
  async getInterviews() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const saved = localStorage.getItem('hiresense_interviews');
        resolve(saved ? JSON.parse(saved) : INITIAL_INTERVIEWS);
      }, 100);
    });
  },

  async scheduleInterview(interviewData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInt = {
          id: `int-${Date.now()}`,
          status: 'Scheduled',
          meetingLink: `https://meet.hiresense.internal/int-${Date.now()}`,
          ...interviewData,
        };
        resolve(newInt);
      }, 150);
    });
  },

  async updateInterviewStatus(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, status });
      }, 100);
    });
  }
};
