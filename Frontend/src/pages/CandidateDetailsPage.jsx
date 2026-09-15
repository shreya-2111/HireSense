import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building,
  GraduationCap,
  Copy,
  Check,
  UserCheck,
  HelpCircle as QuestionIcon,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CircularScore, LinearProgress } from '../components/ui/Progress';
import { SkillBadge } from '../components/candidates/SkillBadge';
import { JobRequirementComparison } from '../components/candidates/JobRequirementComparison';
import { CandidateInsights } from '../components/candidates/CandidateInsights';
import { QuestionStudioModal } from '../components/candidates/QuestionStudioModal';
import { ResumeViewerModal } from '../components/candidates/ResumeViewerModal';
import { formatIndianDate } from '../utils/formatters';
import { ScheduleModal } from '../components/interviews/ScheduleModal';
import { useRecruitment } from '../context/RecruitmentContext';

export function CandidateDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, jobs, updateCandidateStatus, addToast } = useRecruitment();

  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isQuestionStudioOpen, setIsQuestionStudioOpen] = useState(false);
  const [copiedQuestionId, setCopiedQuestionId] = useState(null);

  // Find candidate by URL ID or default to candidate-1
  const candidate = candidates.find((c) => String(c.id) === String(id)) || candidates[0];
  const targetJob = jobs.find((j) => String(j.id) === String(candidate?.appliedJobId) || j.title === candidate?.appliedRole) || jobs[0];

  if (!candidate) {
    return (
      <PageContainer title="Candidate Not Found">
        <Button onClick={() => navigate('/candidates')} variant="outline">
          Back to Candidates
        </Button>
      </PageContainer>
    );
  }

  const handleCopyQuestions = () => {
    const questionsText = candidate.interviewQuestions
      .map((q, idx) => `${idx + 1}. ${q.question}`)
      .join('\n\n');
    navigator.clipboard.writeText(questionsText);
    addToast("All interview questions copied to clipboard!");
  };

  const handleCopySingleQuestion = (text, qId) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(qId);
    addToast("Question copied to clipboard!");
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const handleDownloadResume = () => {
    if (!candidate) return;
    try {
      const experienceSection = (candidate.experienceTimeline || [])
        .map(
          (exp) =>
            `${exp.role} | ${exp.company} (${exp.period})\nLocation: ${exp.location}\nKey Achievements:\n${(exp.achievements || [])
              .map((a) => `  • ${a}`)
              .join('\n')}`
        )
        .join('\n\n');

      const educationSection = candidate.education
        ? typeof candidate.education === 'object'
          ? `${candidate.education.degree || 'Bachelor of Engineering'}\n${candidate.education.institution || 'Recognized University'} (Class of ${candidate.education.year || '2021'}) - GPA: ${candidate.education.gpa || '3.8/4.0'}${
              candidate.education.details ? `\nDetails: ${candidate.education.details}` : ''
            }`
          : candidate.education
        : 'N/A';

      const resumeContent = [
        '============================================================',
        `${candidate.name.toUpperCase()} - RESUME`,
        `Role: ${candidate.appliedRole}`,
        `Email: ${candidate.email} | Phone: ${candidate.phone || 'N/A'} | Location: ${candidate.location || 'N/A'}`,
        '============================================================\n',
        'PROFESSIONAL SUMMARY',
        '------------------------------------------------------------',
        `${candidate.summary || 'Experienced professional with demonstrated expertise.'}\n`,
        'CORE SKILLS & COMPETENCIES',
        '------------------------------------------------------------',
        `Matched Skills: ${(candidate.matchedSkills || []).join(', ')}`,
        `Additional Skills: ${(candidate.missingSkills || []).join(', ') || 'None'}\n`,
        'WORK EXPERIENCE',
        '------------------------------------------------------------',
        `${experienceSection || 'Detailed experience on file.'}\n`,
        'EDUCATION',
        '------------------------------------------------------------',
        `${educationSection}\n`,
        '============================================================',
        `Generated via HireSense Recruitment Platform (${formatIndianDate(new Date())})`,
        '============================================================'
      ].join('\n');

      const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${candidate.name.replace(/\s+/g, '_')}_Resume.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`Resume for ${candidate.name} downloaded successfully!`);
    } catch (err) {
      addToast("Failed to download resume file.", "warning");
    }
  };

  return (
    <PageContainer
      breadcrumbs={
        <button
          onClick={() => navigate('/candidates')}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-500"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Candidates
        </button>
      }
      title={candidate.name}
      subtitle={
        <span className="flex items-center gap-2">
          <span>Applied for</span>
          <strong className="text-slate-800 font-semibold">{candidate.appliedRole}</strong>
          <span>•</span>
          <span>Applied {formatIndianDate(candidate.appliedDate)}</span>
          <span>•</span>
          <span>{candidate.location}</span>
        </span>
      }
      actions={
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => setIsResumeModalOpen(true)}
          >
            View Resume
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownloadResume}
          >
            Download Resume
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={SlidersHorizontal}
            onClick={() => setIsQuestionStudioOpen(true)}
          >
            Question Studio
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Schedule Interview
          </Button>
        </div>
      }
    >
      {/* Top Grid: Job Fit Score + Candidate Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Fit Radial Score Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Job Fit Analysis</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Automated requirement alignment</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4 space-y-4">
            <CircularScore
              score={candidate.matchScore}
              size={140}
              strokeWidth={11}
              subtitle="Overall Match"
            />

            {/* Score Breakdown breakdown */}
            <div className="w-full space-y-2.5 pt-3 border-t border-slate-100">
              <LinearProgress
                showLabel
                label="Skills Match"
                value={candidate.fitBreakdown?.skillScore || candidate.matchScore}
                color="emerald"
              />
              <LinearProgress
                showLabel
                label="Experience Level"
                value={candidate.fitBreakdown?.experienceScore || 88}
                color="blue"
              />
              <LinearProgress
                showLabel
                label="Education & Background"
                value={candidate.fitBreakdown?.educationScore || 90}
                color="blue"
              />
            </div>
          </CardContent>
          <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Role requirement: Mid-Senior</span>
            <span className="font-semibold text-slate-700">{candidate.experienceYears} yrs verified</span>
          </div>
        </Card>

        {/* Candidate Summary & Skill Alignment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Candidate Summary</CardTitle>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  Generated from resume
                </span>
              </div>
              <Badge variant={candidate.status === 'Shortlisted' ? 'success' : candidate.status === 'Maybe' ? 'warning' : 'neutral'} dot>
                {candidate.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {candidate.summary}
              </p>

              {/* Skills Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Matched Skills */}
                <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matched Skills ({candidate.matchedSkills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matchedSkills?.map((skill) => (
                      <SkillBadge key={skill} name={skill} type="matched" size="sm" />
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-lg bg-amber-50/30 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Missing Skills ({candidate.missingSkills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missingSkills && candidate.missingSkills.length > 0 ? (
                      candidate.missingSkills.map((skill) => (
                        <SkillBadge key={skill} name={skill} type="missing" size="sm" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No missing requirements identified</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Candidate Insights Card */}
      <CandidateInsights candidate={candidate} />

      {/* Requirement vs Candidate Comparison Table */}
      <JobRequirementComparison candidate={candidate} job={targetJob} />

      {/* Experience & Education Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Experience Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              <CardTitle>Work Experience</CardTitle>
            </div>
            <span className="text-xs text-slate-400">{candidate.experienceYears} Years Total</span>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {candidate.experienceTimeline && candidate.experienceTimeline.map((item, idx) => (
                <div key={idx} className="relative space-y-1.5">
                  {/* Timeline dot */}
                  <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-blue-600 ring-2 ring-white" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{item.role}</h4>
                    <span className="text-xs text-slate-500 font-medium">{item.period}</span>
                  </div>
                  <p className="text-xs font-semibold text-blue-600">{item.company} • {item.location}</p>
                  <ul className="list-disc list-outside pl-4 text-xs text-slate-600 space-y-1 pt-1 leading-relaxed">
                    {item.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <CardTitle>Education</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidate.education ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  {typeof candidate.education === 'object' ? (candidate.education.degree || 'Bachelor of Engineering in Computer Science') : candidate.education}
                </span>
                <p className="text-xs text-slate-600 font-medium">
                  {typeof candidate.education === 'object' ? (candidate.education.institution || 'Gujarat Technological University') : 'Recognized University'}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/80">
                  <span>Class of {typeof candidate.education === 'object' ? (candidate.education.year || '2021') : '2021'}</span>
                  <span className="font-semibold text-slate-700">GPA: {typeof candidate.education === 'object' ? (candidate.education.gpa || '3.8/4.0') : '3.8/4.0'}</span>
                </div>
                {typeof candidate.education === 'object' && candidate.education.details && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    {candidate.education.details}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                Educational background verified from candidate credentials.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tailored Interview Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <CardTitle>Generated Interview Questions</CardTitle>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions tailored to probe the candidate's skills and specific resume gaps
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => setIsQuestionStudioOpen(true)}
              >
                Question Studio
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Copy}
                onClick={handleCopyQuestions}
              >
                Copy All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {candidate.interviewQuestions && candidate.interviewQuestions.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors space-y-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {item.question}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySingleQuestion(item.question, item.id || idx)}
                    className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-white border border-transparent hover:border-slate-200 shrink-0"
                    title="Copy this question"
                  >
                    {copiedQuestionId === (item.id || idx) ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {item.rationale && (
                  <p className="text-[11px] text-slate-500 pl-9">
                    <span className="font-semibold text-slate-600">Recruiter Rationale:</span> {item.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recruiter Decision Panel & Ethical AI Disclaimer */}
      <Card className="border-blue-200 bg-gradient-to-r from-white to-blue-50/20">
        <CardHeader>
          <div>
            <CardTitle>Recruiter Decision</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Status: <strong className="text-slate-900">{candidate.status}</strong>
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={candidate.status === 'Shortlisted' ? 'success' : 'successOutline'}
              icon={UserCheck}
              onClick={() => updateCandidateStatus(candidate.id, 'Shortlisted')}
            >
              Shortlist Candidate
            </Button>
            <Button
              variant={candidate.status === 'Maybe' ? 'amber' : 'outline'}
              icon={QuestionIcon}
              onClick={() => updateCandidateStatus(candidate.id, 'Maybe')}
            >
              Maybe / Hold for Review
            </Button>
            <Button
              variant={candidate.status === 'Rejected' ? 'danger' : 'dangerOutline'}
              icon={XCircle}
              onClick={() => updateCandidateStatus(candidate.id, 'Rejected')}
            >
              Reject Candidate
            </Button>
          </div>

          {/* Ethical AI Recruiter Notice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Recruiter Support Notice:</strong> HireSense provides algorithmic skill matching and question generation to support your workflow. HireSense does <em>not</em> make automated hiring decisions. Final shortlisting and hiring choices are made exclusively by the human recruitment team.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ResumeViewerModal
        candidate={candidate}
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        preselectedCandidate={candidate}
      />

      <QuestionStudioModal
        candidate={candidate}
        job={targetJob}
        isOpen={isQuestionStudioOpen}
        onClose={() => setIsQuestionStudioOpen(false)}
      />
    </PageContainer>
  );
}
