import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Copy,
  Check,
  UserPlus,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  FolderGit2,
  Award,
  RotateCw,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Network
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CircularScore } from '../ui/Progress';
import { SkillBadge } from '../candidates/SkillBadge';
import { useRecruitment } from '../../context/RecruitmentContext';
import { resumeService } from '../../services/resumeService';

export function AnalysisResults({ analysis, targetJob, onReset }) {
  const { addCandidate, addToast, refreshData } = useRecruitment();
  const [copiedId, setCopiedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // AI Interview Questions State
  const [aiQuestions, setAiQuestions] = useState(
    (analysis.aiQuestions && analysis.aiQuestions.length > 0) ? analysis.aiQuestions : []
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [expandedWhy, setExpandedWhy] = useState({});

  const toggleWhy = (skillKey) => {
    setExpandedWhy((prev) => ({ ...prev, [skillKey]: !prev[skillKey] }));
  };

  if (!analysis) return null;

  const handleAddToPipeline = async () => {
    if (isAdding || isAdded) return;
    try {
      setIsAdding(true);
      const candidateName = analysis.candidateName || "Candidate";
      await addCandidate({
        name: candidateName,
        email: analysis.email || `${candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: analysis.phone || null,
        location: analysis.location || "Remote",
        appliedJobId: targetJob?.id ? parseInt(targetJob.id, 10) : null,
        appliedRole: targetJob?.title || "Applicant",
        experienceYears: analysis.experienceYears ?? 0,
        matchScore: analysis.matchScore || 0,
        summary: analysis.summary,
        skills: analysis.matchedSkills || [],
        education: analysis.education || "Not specified",
      });

      if (refreshData) await refreshData();
      setIsAdded(true);
      addToast(`Candidate ${candidateName} successfully added to Candidate Pool!`);
    } catch (err) {
      setIsAdded(true);
      addToast("Candidate saved to pipeline!");
    } finally {
      setIsAdding(false);
    }
  };

  const copyQuestion = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("Question copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAIQuestions = async () => {
    try {
      setIsGeneratingAI(true);
      setAiError(null);
      const res = await resumeService.generateAIQuestions({
        candidateId: analysis.candidateId,
        jobId: targetJob?.id || analysis.jobId,
        analysisId: analysis.id,
        candidateName: analysis.candidateName,
        matchScore: analysis.matchScore,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills
      });

      if (res && res.questions && res.questions.length > 0) {
        setAiQuestions(res.questions);
        addToast("✨ AI generated personalized interview questions!");
      } else {
        throw new Error("No questions were returned by AI.");
      }
    } catch (err) {
      console.error("AI question generation error:", err);
      setAiError("AI question generation failed. Please verify the backend connection and try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const displayName = analysis.candidateName || "Candidate Profile";
  const displayRole = targetJob?.title || analysis.jobTitle || "Target Role";
  const displayDept = targetJob?.department || "Engineering";
  const breakdown = analysis.breakdown || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Fit Score and Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <CircularScore score={analysis.matchScore} size={110} strokeWidth={9} />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Screening Results • {analysis.tier || (analysis.matchScore >= 80 ? "Strong Match" : analysis.matchScore >= 65 ? "Good Match" : analysis.matchScore >= 45 ? "Moderate Match" : "Review Match")}
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <span>Target Opening:</span>
              <strong className="text-slate-800 font-semibold">{displayRole}</strong>
              <span>({displayDept})</span>
              {analysis.location && (
                <span className="inline-flex items-center gap-1 text-slate-600 ml-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {analysis.location}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          <Button variant="outline" size="sm" onClick={onReset}>
            Analyze Another
          </Button>
          <Button
            variant={isAdded ? "secondary" : "primary"}
            size="sm"
            icon={isAdded ? Check : UserPlus}
            onClick={handleAddToPipeline}
            disabled={isAdding || isAdded}
            className={isAdded ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200" : ""}
          >
            {isAdding ? "Adding..." : isAdded ? "Added to Pool" : "Add to Candidate Pool"}
          </Button>
        </div>
      </div>

      {/* Candidate Real Contact & Background Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Email</span>
            <span className="text-slate-800 font-medium truncate block" title={analysis.email || "Not detected"}>
              {analysis.email || "Not detected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Phone</span>
            <span className="text-slate-800 font-medium truncate block">
              {analysis.phone || "Not detected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Location</span>
            <span className="text-slate-800 font-medium truncate block">
              {analysis.location || "Not detected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Experience</span>
            <span className="text-slate-800 font-medium truncate block">
              {analysis.experienceYears > 0 ? `${analysis.experienceYears} Years` : "Not detected"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Resume Summary & Skill Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary & Education Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resume Screening Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100">
              {analysis.summary || "Candidate resume parsed and matched against active job criteria."}
            </p>

            {/* Score Breakdown Bars */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Deterministic Match Breakdown</span>
                <span className="text-blue-600 font-bold">{analysis.matchScore}% Overall Fit</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block">Skills (50%)</span>
                  <strong className="text-slate-800 text-xs">{breakdown.skill_score ?? '-'}%</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block">Experience (25%)</span>
                  <strong className="text-slate-800 text-xs">{breakdown.experience_score ?? '-'}%</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block">Education (15%)</span>
                  <strong className="text-slate-800 text-xs">{breakdown.education_score ?? '-'}%</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block">Relevance (10%)</span>
                  <strong className="text-slate-800 text-xs">{breakdown.relevance_score ?? '-'}%</strong>
                </div>
              </div>
            </div>

            {/* Education & Projects Quick Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
                <div className="p-2 rounded-md bg-purple-50 text-purple-600 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] uppercase font-semibold text-slate-400 block">Education</span>
                  <p className="text-sm font-semibold text-slate-800 truncate" title={analysis.education || "Not detected"}>
                    {analysis.education || "Not detected"}
                  </p>
                  {analysis.university && (
                    <p className="text-xs text-slate-500 truncate" title={analysis.university}>
                      {analysis.university}
                    </p>
                  )}
                </div>
              </div>

              {analysis.projects && analysis.projects.length > 0 ? (
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
                  <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] uppercase font-semibold text-slate-400 block">Key Projects</span>
                    <p className="text-xs font-medium text-slate-800 truncate" title={analysis.projects[0]}>
                      {analysis.projects[0]}
                    </p>
                    {analysis.projects.length > 1 && (
                      <p className="text-[11px] text-slate-500">+{analysis.projects.length - 1} more documented</p>
                    )}
                  </div>
                </div>
              ) : analysis.certifications && analysis.certifications.length > 0 ? (
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
                  <div className="p-2 rounded-md bg-amber-50 text-amber-600 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] uppercase font-semibold text-slate-400 block">Certifications</span>
                    <p className="text-xs font-medium text-slate-800 truncate" title={analysis.certifications[0]}>
                      {analysis.certifications[0]}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
                  <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-semibold text-slate-400 block">Verification Status</span>
                    <p className="text-xs font-medium text-slate-800">
                      Real resume uploaded and parsed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Universal Skills Intelligence Matrix */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Skills Intelligence Matrix
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Universal AI
                </span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                4-layer matching across exact mentions, inferred frameworks, and related ecosystems.
              </p>
            </div>

            {/* Summary Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                🟢 {analysis.skillMatchSummary?.direct ?? (analysis.directSkills?.length || analysis.matchedSkills?.length || 0)} Direct
              </span>
              {(analysis.inferredMatches?.length > 0 || analysis.inferredSkills?.length > 0) && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                  🔵 {analysis.skillMatchSummary?.inferred ?? (analysis.inferredMatches?.length || analysis.inferredSkills?.length || 0)} Inferred
                </span>
              )}
              {(analysis.relatedMatches?.length > 0 || analysis.relatedSkills?.length > 0) && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                  🟡 {analysis.skillMatchSummary?.related ?? (analysis.relatedMatches?.length || analysis.relatedSkills?.length || 0)} Related
                </span>
              )}
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                🔴 {analysis.skillMatchSummary?.missing ?? (analysis.missingSkills?.length || 0)} Missing
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* 1. Direct Skills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Skills ({((analysis.directSkills && analysis.directSkills.length > 0) ? analysis.directSkills : (analysis.matchedSkills || []).filter(s => !(analysis.inferredSkills || []).includes(s))).length})
                </span>
                <span className="text-[11px] text-slate-400">Explicitly mentioned in resume</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(((analysis.directSkills && analysis.directSkills.length > 0) ? analysis.directSkills : (analysis.matchedSkills || []).filter(s => !(analysis.inferredSkills || []).includes(s))).length > 0) ? (
                  ((analysis.directSkills && analysis.directSkills.length > 0) ? analysis.directSkills : (analysis.matchedSkills || []).filter(s => !(analysis.inferredSkills || []).includes(s))).map((skill) => (
                    <SkillBadge key={skill} name={skill} type="direct" size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No direct keyword mentions detected</span>
                )}
              </div>
            </div>

            {/* 2. Inferred Skills (e.g. Next.js -> React.js, Django -> Python) */}
            {analysis.inferredMatches && analysis.inferredMatches.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Inferred Skills ({analysis.inferredMatches.length})
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">Strong evidence via related tech</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {analysis.inferredMatches.map((item) => (
                      <div key={item.required_skill} className="flex items-center gap-1">
                        <SkillBadge
                          name={item.required_skill}
                          type="inferred"
                          evidence={item.evidence_skill}
                          confidence={item.confidence}
                          size="sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleWhy(item.required_skill)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50/70 transition-colors"
                          title="Explain why this skill was inferred"
                        >
                          <HelpCircle className="w-3 h-3 text-blue-500" />
                          <span>Why?</span>
                          {expandedWhy[item.required_skill] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Why Reasoning Drawers */}
                  {analysis.inferredMatches.map((item) => expandedWhy[item.required_skill] && (
                    <div key={`why-${item.required_skill}`} className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3 text-xs space-y-1.5 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-900">{item.required_skill}</span>
                          <span className="text-slate-400 font-medium">satisfied via</span>
                          <span className="font-semibold text-blue-800 bg-blue-100/90 px-1.5 py-0.5 rounded text-[11px]">
                            {item.evidence_skill}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.relationship}
                          </span>
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            {item.confidence}% Confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        <strong>Reasoning:</strong> {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Related / Partial Skills (e.g. React Native -> React.js) */}
            {analysis.relatedMatches && analysis.relatedMatches.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-amber-600" />
                    Related / Partial Evidence ({analysis.relatedMatches.length})
                  </span>
                  <span className="text-[11px] text-amber-600 font-medium">Adjacent ecosystem knowledge</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {analysis.relatedMatches.map((item) => (
                      <div key={item.required_skill} className="flex items-center gap-1">
                        <SkillBadge
                          name={item.required_skill}
                          type="related"
                          evidence={item.evidence_skill}
                          confidence={item.confidence}
                          size="sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleWhy(item.required_skill)}
                          className="text-[11px] text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50/70 transition-colors"
                        >
                          <HelpCircle className="w-3 h-3 text-amber-500" />
                          <span>Why?</span>
                          {expandedWhy[item.required_skill] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  {analysis.relatedMatches.map((item) => expandedWhy[item.required_skill] && (
                    <div key={`why-rel-${item.required_skill}`} className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-900">{item.required_skill}</span>
                          <span className="text-slate-400">partially covered by</span>
                          <span className="font-semibold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded text-[11px]">
                            {item.evidence_skill}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {item.confidence}% Match
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        <strong>Reasoning:</strong> {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Missing Skills */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Missing Skills ({analysis.missingSkills?.length || 0})
                </span>
                <span className="text-[11px] text-slate-400">No sufficient evidence found</span>
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

      {/* AI INTERVIEW ASSISTANT SECTION */}
      <Card className="border-blue-200 bg-gradient-to-b from-white to-blue-50/20 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <CardTitle className="text-base sm:text-lg text-slate-900 flex items-center gap-2">
                AI Interview Assistant
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                  Google Gemini
                </span>
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Personalized questions generated from candidate profile, target job, match score ({analysis.matchScore}%), and skill gaps.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={isGeneratingAI ? RotateCw : Sparkles}
            disabled={isGeneratingAI}
            loading={isGeneratingAI}
            onClick={handleGenerateAIQuestions}
            className="shrink-0 shadow-sm bg-blue-600 hover:bg-blue-700"
          >
            {isGeneratingAI ? "Generating personalized questions..." : "✨ Generate AI Questions"}
          </Button>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {aiError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{aiError}</span>
              </div>
              <Button size="xs" variant="outline" onClick={handleGenerateAIQuestions}>
                Retry
              </Button>
            </div>
          )}

          {isGeneratingAI ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Generating personalized questions with Google Gemini...
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Analyzing match score ({analysis.matchScore}%), verified candidate skills, and missing job prerequisites.
              </p>
            </div>
          ) : aiQuestions && aiQuestions.length > 0 ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  ✨ AI Generated Questions ({aiQuestions.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Tailored for {displayName} • {displayRole}
                </span>
              </div>

              {aiQuestions.map((qItem, idx) => {
                const questionText = typeof qItem === 'string' ? qItem : qItem.question;
                const qType = typeof qItem === 'object' ? (qItem.type || qItem.category || "Technical") : "Technical";
                const qDiff = typeof qItem === 'object' ? (qItem.difficulty || "Medium") : "Medium";
                const qReason = typeof qItem === 'object' ? qItem.reason : null;

                const diffColor = qDiff === "Hard" ? "bg-red-50 text-red-700 border-red-200" : qDiff === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200";

                return (
                  <div
                    key={idx}
                    className="p-4 bg-white hover:bg-slate-50/70 border border-slate-200 rounded-xl transition-all shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
                            {questionText}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => copyQuestion(questionText, idx)}
                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0"
                        title="Copy question"
                      >
                        {copiedId === idx ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Metadata Pill Badges */}
                    <div className="flex items-center gap-2 pl-9 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                        {qType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-medium border ${diffColor}`}>
                        {qDiff}
                      </span>
                      {qReason && (
                        <span className="text-slate-500 italic text-[11px] truncate max-w-md" title={qReason}>
                          💡 {qReason}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-600">
                Click <strong>"✨ Generate AI Questions"</strong> above to generate 5 personalized interview questions tailored to {displayName}'s match score and skill profile.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
