import { INITIAL_CANDIDATES } from '../data/mockCandidates';

export const candidateService = {
  async getCandidates() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const saved = localStorage.getItem('hiresense_candidates');
        resolve(saved ? JSON.parse(saved) : INITIAL_CANDIDATES);
      }, 100);
    });
  },

  async getCandidateById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const saved = localStorage.getItem('hiresense_candidates');
        const candidates = saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
        const candidate = candidates.find((c) => c.id === id);
        if (candidate) resolve(candidate);
        else resolve(candidates[0]); // fallback
      }, 100);
    });
  },

  async updateCandidateStatus(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, status });
      }, 100);
    });
  },

  async generateQuestions({ candidate, job, type, difficulty, count }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseQuestions = [
          {
            id: `q-${Date.now()}-1`,
            type: type || 'Technical',
            difficulty: difficulty || 'Medium',
            question: `How would you architect and optimize a high-traffic ${job?.title || 'frontend'} system handling real-time data updates?`,
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
            question: `Given that our stack uses ${candidate?.missingSkills?.[0] || 'modern testing frameworks'} and your recent experience focused on other areas, how do you rapidly ramp up and enforce quality?`,
            rationale: `Directly investigates identified skill gap: ${candidate?.missingSkills?.[0] || 'Testing'}.`,
            targetSkill: candidate?.missingSkills?.[0] || 'Skill Gap Area'
          },
          {
            id: `q-${Date.now()}-5`,
            type: type || 'Situational',
            difficulty: difficulty || 'Medium',
            question: `Walk through your systematic debugging process when a production regression is reported with intermittent reproduction steps.`,
            rationale: `Tests troubleshooting and telemetry analysis maturity.`,
            targetSkill: 'Production Reliability'
          },
          {
            id: `q-${Date.now()}-6`,
            type: type || 'Technical',
            difficulty: difficulty || 'Hard',
            question: `How do you enforce accessibility (WCAG 2.1 AA) and cross-device performance budgets across a multi-developer team?`,
            rationale: `Explores quality governance across engineering teams.`,
            targetSkill: 'Engineering Standards'
          },
          {
            id: `q-${Date.now()}-7`,
            type: type || 'Behavioral',
            difficulty: difficulty || 'Medium',
            question: `Can you share an experience where an initial product requirement was ambiguous or flawed, and how you partnered with designers/managers to refine it?`,
            rationale: `Checks cross-functional collaboration capabilities.`,
            targetSkill: 'Cross-functional Collaboration'
          }
        ];

        resolve(baseQuestions.slice(0, count || 5));
      }, 350);
    });
  }
};
