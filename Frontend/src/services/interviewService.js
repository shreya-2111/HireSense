import { apiClient } from './apiClient';
import { INITIAL_INTERVIEWS } from '../data/mockInterviews';
import { formatIndianDate, formatIndianTime12Hr } from '../utils/formatters';

export const interviewService = {
  async getInterviews(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/interviews?${query}` : '/interviews';
      const backendInterviews = await apiClient.get(endpoint);
      if (Array.isArray(backendInterviews)) {
        return backendInterviews.map(normalizeBackendInterview);
      }
    } catch (err) {
      console.warn('Could not fetch interviews from backend, loading local state:', err.message);
    }
    const saved = localStorage.getItem('hiresense_interviews');
    return saved ? JSON.parse(saved) : [];
  },


  async scheduleInterview(interviewData) {
    try {
      let scheduledAtISO = new Date().toISOString();
      if (interviewData.date) {
        let timePart = "14:00:00";
        if (interviewData.time) {
          const timeMatch = interviewData.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2];
            const ampm = timeMatch[3]?.toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            timePart = `${String(hours).padStart(2, '0')}:${minutes}:00`;
          }
        }
        scheduledAtISO = `${interviewData.date}T${timePart}`;
      }

      const payload = {
        candidate_id: parseInt(interviewData.candidateId || 1, 10),
        job_id: parseInt(interviewData.jobId || 1, 10),
        scheduled_at: scheduledAtISO,
        duration: parseInt(interviewData.duration || 45, 10),
        interview_type: interviewData.type || 'Technical Round',
        interviewer: interviewData.interviewer || 'Shreya Raval',
        notes: interviewData.notes || '',
        status: 'Scheduled',
      };
      const created = await apiClient.post('/interviews', payload);
      return normalizeBackendInterview(created);
    } catch (err) {
      console.warn('Backend scheduleInterview failed, saving locally:', err.message);
      return {
        id: `int-${Date.now()}`,
        status: 'Scheduled',
        meetingLink: `https://meet.hiresense.internal/int-${Date.now()}`,
        ...interviewData,
      };
    }
  },

  async updateInterviewStatus(id, status) {
    try {
      const updated = await apiClient.put(`/interviews/${id}`, { status });
      return normalizeBackendInterview(updated);
    } catch (err) {
      console.warn(`Backend updateInterviewStatus failed for ${id}:`, err.message);
      return { id, status };
    }
  },

  async updateInterviewNotes(id, notes) {
    try {
      const updated = await apiClient.patch(`/interviews/${id}/notes`, { notes });
      return normalizeBackendInterview(updated);
    } catch (err) {
      console.warn(`Backend updateInterviewNotes failed for ${id}:`, err.message);
      return { id, notes };
    }
  }
};

function normalizeBackendInterview(i) {
  const dateObj = i.scheduled_at ? new Date(i.scheduled_at) : new Date();
  const dateStr = formatIndianDate(dateObj);
  const timeStr = `${formatIndianTime12Hr(dateObj)} IST`;
  return {
    id: i.id,
    candidateId: i.candidate_id,
    candidateName: i.candidate_name || 'Candidate',
    candidateRole: i.candidate_role || 'Applicant',
    candidateAvatar: (i.candidate_name || 'CD').split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
    jobId: i.job_id,
    jobTitle: i.job_title || 'Software Position',
    position: i.job_title || 'Software Position',
    date: dateStr,
    time: timeStr,
    duration: `${i.duration || 45} min`,
    type: i.interview_type || 'Technical Round',
    interviewer: i.interviewer || 'Shreya Raval',
    status: i.status || 'Scheduled',
    notes: i.notes || '',
    meetingLink: `https://meet.hiresense.internal/int-${i.id}`,
    questions: i.questions || [],
  };
}
