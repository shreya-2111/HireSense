import { MOCK_RESUME_SAMPLES } from '../data/mockResumeSamples';

export const resumeService = {
  async getSampleResumes() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_RESUME_SAMPLES), 100);
    });
  },

  async analyzeResume(fileOrSample, targetJob) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (fileOrSample.sampleData) {
          resolve({
            ...fileOrSample.sampleData,
            candidateName: fileOrSample.candidateName || fileOrSample.title?.split('—')[0]?.trim() || "Analyzed Candidate",
            jobTitle: targetJob?.title || "Selected Position"
          });
        } else {
          // Custom file simulation
          resolve({
            matchScore: 89,
            tier: "Strong Match",
            candidateName: fileOrSample.name ? fileOrSample.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Candidate Profile",
            summary: `Experienced engineering specialist with demonstrated technical proficiency in core requirements. Shows strong hands-on capabilities for the ${targetJob?.title || 'requested'} position.`,
            experienceYears: 4.0,
            education: "B.S. in Computer Science / Engineering",
            matchedSkills: targetJob?.requiredSkills ? targetJob.requiredSkills.slice(0, 4) : ["React", "TypeScript", "JavaScript", "HTML/CSS"],
            missingSkills: targetJob?.requiredSkills ? targetJob.requiredSkills.slice(4) : ["Testing Frameworks"],
            interviewQuestions: [
              `How do you design and structure scalable components for ${targetJob?.title || 'modern web systems'}?`,
              `What methodologies do you employ for automated testing and code reviews?`,
              `Describe your approach to profiling memory bottlenecks in production.`
            ]
          });
        }
      }, 600);
    });
  }
};
