import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  UserPlus,
  Briefcase,
  GraduationCap,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CircularScore } from '../ui/Progress';
import { SkillBadge } from '../candidates/SkillBadge';
import { useRecruitment } from '../../context/RecruitmentContext';

export function AnalysisResults({ analysis, targetJob, onReset }) {
  const navigate = useNavigate();
  const { addCandidate, addToast } = useRecruitment();
  const [copiedId, setCopiedId] = React.useState(null);

  if (!analysis) return null;

  const handleAddToPipeline = () => {
    const candidateName = analysis.candidateName || analysis.title?.split('—')[0]?.trim() || "Analyzed Candidate";
    const newCand = addCandidate({
      name: candidateName,
      email: `${candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: "+1 (555) 345-6789",
      location: "San Francisco, CA (Remote)",
      appliedJobId: targetJob?.id || "job-1",
      appliedRole: targetJob?.title || "Frontend Developer",
      experienceYears: analysis.experienceYears || 4.0,
      matchScore: analysis.matchScore || 90,
      matchTier: analysis.matchScore >= 85 ? "Strong Match" : "Good Match",
      summary: analysis.summary,
      matchedSkills: analysis.matchedSkills || [],
      missingSkills: analysis.missingSkills || [],
      education: {
        degree: analysis.education || "B.S. in Computer Science",
        institution: "Accredited University",
        year: "2020",
        gpa: "3.7 / 4.0"
      },
      interviewQuestions: (analysis.interviewQuestions || []).map((q, idx) => ({
        id: `q${idx + 1}`,
        question: q,
        rationale: "Automated probe targeting skill profile."
      }))
    });

    navigate(`/candidates/${newCand.id}`);
  };

  const copyQuestion = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("Interview question copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Fit Score and Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <CircularScore score={analysis.matchScore} size={110} strokeWidth={9} />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Screening Results
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {analysis.candidateName || analysis.title || "Resume Candidate"}
            </h2>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <span>Target Opening:</span>
              <strong className="text-slate-800 font-semibold">{targetJob?.title || 'Selected Role'}</strong>
              <span>({targetJob?.department || 'Engineering'})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={onReset}>
            Analyze Another
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={handleAddToPipeline}
          >
            Add to Candidate Pool
          </Button>
        </div>
      </div>

      {/* Grid: Resume Summary & Skill Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resume Screening Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {analysis.summary}
            </p>

            {/* Experience & Education Quick Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-400">Relevant Experience</span>
                  <p className="text-sm font-semibold text-slate-800">{analysis.experienceYears || '4+'} Years</p>
                  <p className="text-xs text-slate-500">Verified production tenure</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
                <div className="p-2 rounded-md bg-purple-50 text-purple-600 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-400">Education Background</span>
                  <p className="text-sm font-semibold text-slate-800 truncate">{analysis.education || 'B.S. in Computer Science'}</p>
                  <p className="text-xs text-slate-500">Accredited institution</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Match Matrix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Matched Skills ({analysis.matchedSkills?.length || 0})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedSkills?.map((skill) => (
                  <SkillBadge key={skill} name={skill} type="matched" size="sm" />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Missing / Unverified Skills ({analysis.missingSkills?.length || 0})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                  analysis.missingSkills.map((skill) => (
                    <SkillBadge key={skill} name={skill} type="missing" size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No missing skills identified</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Interview Questions */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Suggested Interview Questions</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Generated based on the candidate's matched skills and specific resume gaps
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.interviewQuestions?.map((question, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {question}
                  </p>
                </div>
                <button
                  onClick={() => copyQuestion(question, idx)}
                  className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-colors shrink-0"
                  title="Copy question"
                >
                  {copiedId === idx ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
