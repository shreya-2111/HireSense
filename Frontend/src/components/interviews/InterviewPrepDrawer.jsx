import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Video,
  Copy,
  Check,
  Calendar,
  Clock,
  Clock3,
  XCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';

export function InterviewPrepDrawer({ interview, isOpen, onClose }) {
  const { updateInterviewStatus, updateInterviewNotes, addToast } = useRecruitment();
  const [copiedId, setCopiedId] = useState(null);
  const [recruiterNotes, setRecruiterNotes] = useState(interview?.notes || '');

  React.useEffect(() => {
    if (interview) {
      setRecruiterNotes(interview.notes || '');
    }
  }, [interview]);

  if (!isOpen || !interview) return null;

  const prep = interview.prepData || {
    summary: "Standard interview briefing.",
    strengths: ["Strong technical foundations", "Good communication"],
    areasToExplore: ["Deeper architectural scenarios", "Culture alignment"],
    suggestedQuestions: ["Can you describe a challenge you overcame recently?"]
  };

  const handleCopyQuestion = (q, idx) => {
    navigator.clipboard.writeText(q);
    setCopiedId(idx);
    addToast("Interview question copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNotes = () => {
    if (interview?.id) {
      updateInterviewNotes(interview.id, recruiterNotes);
    }
  };

  const handleChangeStatus = (newStatus) => {
    updateInterviewStatus(interview.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Interview Preparation Dossier
            </span>
            <h3 className="text-lg font-bold text-slate-900">{interview.candidateName}</h3>
            <p className="text-xs text-slate-500">{interview.position} • {interview.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Interview Details & Status Controls Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Date</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {interview.date}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Time Window</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {interview.time}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Interviewer</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{interview.interviewer}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Status</span>
                <select
                  value={interview.status}
                  onChange={(e) => handleChangeStatus(e.target.value)}
                  className="mt-0.5 text-xs font-semibold px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Pending Feedback">Pending Feedback</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {interview.meetingLink && (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-[260px] font-mono">
                  {interview.meetingLink}
                </span>
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Call
                </a>
              </div>
            )}
          </div>

          {/* Section 1: Candidate Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Candidate Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              {prep.summary}
            </p>
          </div>

          {/* Section 2: Strengths */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Key Strengths to Validate
            </h4>
            <div className="space-y-1.5">
              {prep.strengths.map((str, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-lg text-xs text-slate-800 leading-normal flex items-start gap-2"
                >
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Areas to Explore */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Areas to Explore & Skill Gaps
            </h4>
            <div className="space-y-1.5">
              {prep.areasToExplore.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-lg text-xs text-slate-800 leading-normal flex items-start gap-2"
                >
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Suggested Interview Questions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              Suggested Technical & Situational Questions
            </h4>
            <div className="space-y-2">
              {prep.suggestedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs leading-relaxed"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 shrink-0">{idx + 1}.</span>
                    <span className="text-slate-800 font-medium">{q}</span>
                  </div>
                  <button
                    onClick={() => handleCopyQuestion(q, idx)}
                    className="text-slate-400 hover:text-blue-600 p-1 shrink-0"
                    title="Copy question"
                  >
                    {copiedId === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interviewer Notes Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Recruiter Evaluation Notes
            </label>
            <textarea
              rows={3}
              value={recruiterNotes}
              onChange={(e) => setRecruiterNotes(e.target.value)}
              placeholder="Record impressions, red flags, or follow-up topics..."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Quick Status Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {interview.status !== 'Completed' && (
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleChangeStatus('Completed')}
              >
                Mark Completed
              </Button>
            )}
            {interview.status !== 'Pending Feedback' && (
              <Button
                variant="secondary"
                size="sm"
                icon={Clock3}
                onClick={() => handleChangeStatus('Pending Feedback')}
              >
                Pending Feedback
              </Button>
            )}
            {interview.status !== 'Cancelled' && (
              <Button
                variant="dangerOutline"
                size="sm"
                icon={XCircle}
                onClick={() => handleChangeStatus('Cancelled')}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
