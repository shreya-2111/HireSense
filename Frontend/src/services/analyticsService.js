import { apiClient } from './apiClient';
import { MOCK_ANALYTICS } from '../data/mockAnalytics';

export const analyticsService = {
  async getMetrics() {
    try {
      const data = await apiClient.get('/analytics/dashboard');
      if (data) {
        return {
          totalCandidates: data.total_candidates,
          candidatesReviewed: data.candidates_reviewed,
          activeJobs: data.active_jobs,
          interviewsScheduled: data.interviews_scheduled,
          shortlistedCandidates: data.shortlisted_candidates,
          avgMatchScore: data.avg_match_score,
          statusBreakdown: data.status_breakdown,
          departmentDistribution: data.department_distribution,
          topSkills: data.top_skills,
          hiringPipeline: data.hiring_pipeline,
        };
      }
    } catch (err) {
      console.warn('Could not fetch analytics from backend, falling back:', err.message);
    }
    return MOCK_ANALYTICS.metrics;
  },

  async getChartData() {
    try {
      const data = await apiClient.get('/analytics/dashboard');
      if (data) {
        return {
          ...MOCK_ANALYTICS,
          metrics: {
            ...MOCK_ANALYTICS.metrics,
            totalCandidates: data.total_candidates,
            candidatesReviewed: data.candidates_reviewed,
            activeJobs: data.active_jobs,
            interviewsScheduled: data.interviews_scheduled,
          }
        };
      }
    } catch (err) {
      console.warn('Could not fetch chart data from backend, falling back:', err.message);
    }
    return MOCK_ANALYTICS;
  },

  async exportCandidatesCSV() {
    try {
      const csvText = await apiClient.get('/analytics/candidates/export');
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `hiresense_candidates_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      console.error('CSV export failed:', err);
      throw err;
    }
  }
};
