import { MOCK_ANALYTICS } from '../data/mockAnalytics';

export const analyticsService = {
  async getMetrics() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ANALYTICS.metrics), 100);
    });
  },

  async getChartData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ANALYTICS), 100);
    });
  }
};
