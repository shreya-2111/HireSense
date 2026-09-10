import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';

export function ScheduleModal({ isOpen, onClose, preselectedCandidate }) {
  const { candidates, jobs, scheduleInterview } = useRecruitment();

  const [candidateId, setCandidateId] = useState(preselectedCandidate?.id || candidates[0]?.id || '');
  const [position, setPosition] = useState(preselectedCandidate?.appliedRole || jobs[0]?.title || '');
  const [date, setDate] = useState('2025-03-02');
  const [time, setTime] = useState('2:00 PM - 3:00 PM EST');
  const [type, setType] = useState('Technical Deep-Dive');
  const [interviewer, setInterviewer] = useState('David Larson (VP Eng)');

  const handleSubmit = (e) => {
    e.preventDefault();
    const candidate = candidates.find((c) => c.id === candidateId);
    scheduleInterview({
      candidateId,
      candidateName: candidate ? candidate.name : "Candidate",
      candidateAvatar: candidate ? candidate.avatar : "CD",
      position,
      date,
      time,
      type,
      interviewer,
      interviewerRole: interviewer.includes('VP') ? 'VP of Engineering' : 'Senior Engineering Lead',
      prepData: {
        summary: `Interview scheduled with ${candidate?.name} for the ${position} role.`,
        strengths: candidate?.matchedSkills || ["Strong candidate portfolio"],
        areasToExplore: candidate?.missingSkills || ["General culture alignment"],
        suggestedQuestions: candidate?.interviewQuestions?.map(q => q.question) || [
          "Describe your background and most impactful project.",
          "How do you handle ambiguous technical requirements?"
        ]
      }
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Candidate Interview"
      subtitle="Coordinate technical or screening sessions with hiring team"
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Confirm & Schedule
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Candidate Selector */}
        <Select
          label="Candidate"
          value={candidateId}
          onChange={(e) => {
            setCandidateId(e.target.value);
            const cand = candidates.find((c) => c.id === e.target.value);
            if (cand) setPosition(cand.appliedRole);
          }}
        >
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.appliedRole} ({c.matchScore}% Match)
            </option>
          ))}
        </Select>

        {/* Position */}
        <Input
          label="Job Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Time Window"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 2:00 PM - 3:00 PM EST"
            required
          />
        </div>

        {/* Interview Type */}
        <Select
          label="Interview Stage / Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Recruiter Initial Screen">Recruiter Initial Screen</option>
          <option value="Technical Deep-Dive">Technical Deep-Dive</option>
          <option value="System Architecture">System Architecture</option>
          <option value="Product & Portfolio Review">Product & Portfolio Review</option>
          <option value="Cultural & Executive Final">Cultural & Executive Final</option>
        </Select>

        {/* Interviewer */}
        <Select
          label="Lead Interviewer"
          value={interviewer}
          onChange={(e) => setInterviewer(e.target.value)}
        >
          <option value="David Larson (VP Eng)">David Larson (VP of Engineering)</option>
          <option value="Rachel Torres (Lead Architect)">Rachel Torres (Lead Architect)</option>
          <option value="Siddharth Rao (Head of Design)">Siddharth Rao (Head of Design)</option>
          <option value="Dr. Elena Zhao (Director Data)">Dr. Elena Zhao (Director of Data)</option>
          <option value="Sarah Lin (Lead Recruiter)">Sarah Lin (Lead Recruiter)</option>
        </Select>
      </form>
    </Modal>
  );
}
