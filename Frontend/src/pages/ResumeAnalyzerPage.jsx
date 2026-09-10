import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  RotateCcw,
  UserPlus,
  HelpCircle,
  UploadCloud
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { ResumeUploader } from '../components/resumeAnalysis/ResumeUploader';
import { AnalysisResults } from '../components/resumeAnalysis/AnalysisResults';
import { QuestionStudioModal } from '../components/candidates/QuestionStudioModal';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useRecruitment } from '../context/RecruitmentContext';
import { resumeService } from '../services/resumeService';

export function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const { jobs, addCandidate } = useRecruitment();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || 'job-1');
  const [useCustomJob, setUseCustomJob] = useState(false);
  const [customJobText, setCustomJobText] = useState('');

  // Simple, clean loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isQuestionStudioOpen, setIsQuestionStudioOpen] = useState(false);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleSelectSample = (sample) => {
    setSelectedFile({
      name: sample.fileName,
      size: sample.fileSize,
      rawText: sample.rawText,
      candidateName: sample.title.split('—')[0].trim(),
      sampleData: sample.matchResult,
    });
    if (sample.suggestedJobId) {
      setSelectedJobId(sample.suggestedJobId);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      alert("Please upload a resume or choose a quick sample profile first.");
      return;
    }

    setIsAnalyzing(true);
    const result = await resumeService.analyzeResume(selectedFile, activeJob);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <PageContainer
      title="Resume Analyzer"
      subtitle="Analyze a candidate's resume against a job requirement to compute match scores, extract skills, and generate interview questions."
      actions={
        analysisResult && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={HelpCircle}
              onClick={() => setIsQuestionStudioOpen(true)}
            >
              Generate Questions
            </Button>
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>
              New Analysis
            </Button>
          </div>
        )
      }
    >
      {analysisResult ? (
        <>
          <AnalysisResults
            analysis={analysisResult}
            targetJob={activeJob}
            onReset={handleReset}
          />
          <QuestionStudioModal
            isOpen={isQuestionStudioOpen}
            onClose={() => setIsQuestionStudioOpen(false)}
            candidate={{
              name: analysisResult.candidateName,
              appliedRole: activeJob?.title || 'Candidate',
              matchScore: analysisResult.matchScore,
              matchedSkills: analysisResult.matchedSkills,
              missingSkills: analysisResult.missingSkills,
              interviewQuestions: analysisResult.interviewQuestions?.map((q, i) => ({
                id: `q-${i}`,
                question: q,
                rationale: 'Generated from resume analysis'
              }))
            }}
            job={activeJob}
          />
        </>
      ) : (
        <div className="max-w-4xl space-y-6">
          {/* STEP 1: Select Job */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <CardTitle>Select Job Opening</CardTitle>
              </div>
              <button
                type="button"
                onClick={() => setUseCustomJob(!useCustomJob)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {useCustomJob ? "Select an existing opening" : "Or enter custom requirements"}
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!useCustomJob ? (
                <div>
                  <Select
                    label="Select Active Requisition *"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} — {job.department} ({job.experienceLevel})
                      </option>
                    ))}
                  </Select>

                  {activeJob && (
                    <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{activeJob.title}</span>
                        <span className="text-slate-500">{activeJob.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-slate-400 font-medium mr-1">Mandatory skills:</span>
                        {activeJob.requiredSkills?.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Custom Job Description & Skill Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={customJobText}
                    onChange={(e) => setCustomJobText(e.target.value)}
                    placeholder="Paste role requirements, required skills, and experience details..."
                    className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: Upload Resume */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <CardTitle>Upload Candidate Resume</CardTitle>
              </div>
              <span className="text-xs text-slate-400">Supported formats: PDF / DOCX</span>
            </CardHeader>
            <CardContent>
              <ResumeUploader
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
                onSelectSample={handleSelectSample}
              />
            </CardContent>
          </Card>

          {/* STEP 3: Analyze */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  {selectedFile ? (
                    <span>Ready to screen: <strong className="text-slate-900">{selectedFile.name}</strong></span>
                  ) : (
                    <span className="text-slate-400">Please choose a resume file above</span>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedFile || isAnalyzing}
                  loading={isAnalyzing}
                  onClick={handleStartAnalysis}
                  className="w-full sm:w-auto shadow-sm"
                >
                  {isAnalyzing ? "Analyzing resume..." : "Analyze Resume"}
                </Button>
              </div>

              {isAnalyzing && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing resume against {activeJob?.title || 'target position'} requirements...</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">
                    Extracting skills, cross-referencing experience, and calculating fit scores.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
