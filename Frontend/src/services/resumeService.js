import { apiClient } from './apiClient';

export const resumeService = {
  async uploadResume(file, candidateId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (candidateId) {
      formData.append('candidate_id', candidateId);
    }
    return await apiClient.post('/resumes/upload', formData);
  },

  async analyzeResume(fileOrSample, targetJob) {
    if (fileOrSample instanceof File || fileOrSample?.rawFile instanceof File) {
      const file = fileOrSample instanceof File ? fileOrSample : fileOrSample.rawFile;
      const uploadRes = await this.uploadResume(file);
      
      const jobId = targetJob?.id ? parseInt(targetJob.id, 10) : 1;
      const targetSkills = targetJob?.requiredSkills || targetJob?.skills || [];
      const extractedTargetSkills = Array.isArray(targetSkills) 
        ? targetSkills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
        : [];
      if (Array.isArray(targetJob?.niceToHaveSkills)) {
        targetJob.niceToHaveSkills.forEach(s => {
          const name = typeof s === 'string' ? s : s.name;
          if (name && !extractedTargetSkills.includes(name)) extractedTargetSkills.push(name);
        });
      }

      const analysisRes = await apiClient.post('/analyze-resume', {
        resume_id: uploadRes.resume_id,
        candidate_id: uploadRes.candidate_id,
        job_id: jobId,
        required_skills: extractedTargetSkills.length > 0 ? extractedTargetSkills : undefined,
      });

      return {
        id: analysisRes.id,
        resumeId: uploadRes.resume_id,
        candidateId: uploadRes.candidate_id,
        candidateName: uploadRes.candidate_name || analysisRes.candidate_name || file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        email: uploadRes.email || analysisRes.candidate_email,
        phone: uploadRes.phone || analysisRes.phone,
        location: uploadRes.location || analysisRes.location || null,
        linkedin: uploadRes.linkedin || analysisRes.linkedin || null,
        github: uploadRes.github || analysisRes.github || null,
        jobTitle: targetJob?.title || analysisRes.job_title || "Target Position",
        jobId: jobId,
        matchScore: Math.round(analysisRes.match_score),
        overallScore: analysisRes.match_score,
        tier: analysisRes.recommendation === 'Shortlist' ? 'Strong Match' : analysisRes.recommendation === 'Interview' ? 'Good Match' : analysisRes.recommendation === 'Maybe' ? 'Moderate Match' : 'Review Match',
        summary: analysisRes.summary || uploadRes.summary,
        experienceYears: uploadRes.experience_years ?? analysisRes.experience_years ?? 0,
        education: uploadRes.education || analysisRes.education || "Not detected",
        degree: uploadRes.degree || analysisRes.degree || null,
        university: uploadRes.university || analysisRes.university || null,
        companies: uploadRes.companies || analysisRes.companies || [],
        jobTitles: uploadRes.job_titles || analysisRes.job_titles || [],
        projects: uploadRes.projects || analysisRes.projects || [],
        certifications: uploadRes.certifications || analysisRes.certifications || [],
        matchedSkills: analysisRes.matched_skills || uploadRes.skills || [],
        directSkills: analysisRes.direct_skills || [],
        inferredSkills: analysisRes.inferred_skills || [],
        inferredMatches: analysisRes.inferred_matches || [],
        relatedSkills: analysisRes.related_skills || [],
        relatedMatches: analysisRes.related_matches || [],
        skillMatchSummary: analysisRes.skill_match_summary || null,
        skillMatchDetails: analysisRes.skill_match_details || [],
        missingSkills: analysisRes.missing_skills || [],
        experienceMatch: analysisRes.experience_match,
        educationMatch: analysisRes.education_match,
        recommendation: analysisRes.recommendation || "Review",
        interviewQuestions: analysisRes.interview_questions || analysisRes.interview_focus || [],
        aiQuestions: analysisRes.ai_questions || [],
        strengths: analysisRes.strengths || [],
        breakdown: analysisRes.breakdown,
        fileName: uploadRes.file_name || file.name,
      };
    }

    throw new Error("No valid resume file was provided for analysis.");
  },

  async generateAIQuestions({ candidateId, jobId, analysisId, candidateName, matchScore, matchedSkills, missingSkills }) {
    return await apiClient.post('/ai/interview-questions', {
      candidate_id: candidateId ? parseInt(candidateId, 10) : null,
      job_id: jobId ? parseInt(jobId, 10) : null,
      analysis_id: analysisId ? parseInt(analysisId, 10) : null,
      candidate_name: candidateName,
      match_score: matchScore,
      matched_skills: matchedSkills,
      missing_skills: missingSkills
    });
  }
};
