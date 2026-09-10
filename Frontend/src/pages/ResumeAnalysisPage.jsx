import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  RotateCcw
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { ResumeUploader } from '../components/resumeAnalysis/ResumeUploader';
import { AnalysisResults } from '../components/resumeAnalysis/AnalysisResults';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useRecruitment } from '../context/RecruitmentContext';
import { MOCK_RESUME_SAMPLES } from '../data/mockResumeSamples';

export function ResumeAnalysisPage() {
  const { jobs } = useRecruitment();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || 'job-1');
  const [useCustomJob, setUseCustomJob] = useState(false);
  const [customJobText, setCustomJobText] = useState('');

  // Scanning simulation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);

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

  const handleStartAnalysis = () => {
    if (!selectedFile) {
      alert("Please upload a resume or choose a quick sample profile first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => {
      setAnalysisStep(2);
    }, 700);

    setTimeout(() => {
      setAnalysisStep(3);
    }, 1400);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStep(0);

      // Determine result based on sample data or generate smart mock result
      if (selectedFile.sampleData) {
        setAnalysisResult({
          ...selectedFile.sampleData,
          candidateName: selectedFile.candidateName || "Analyzed Candidate",
        });
      } else {
        // Mock fallback for uploaded custom file
        setAnalysisResult({
          matchScore: 89,
          tier: "Strong Match",
          candidateName: selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          summary: "Demonstrates balanced experience across modern component architecture, state synchronization, and enterprise code delivery. Candidate demonstrates high alignment with core requirements.",
          experienceYears: 4.0,
          education: "B.S. in Computer Science or Software Engineering",
          matchedSkills: activeJob.requiredSkills.slice(0, 4),
          missingSkills: activeJob.requiredSkills.slice(4),
          interviewQuestions: [
            `How do you handle technical debt and refactoring in active production environments for ${activeJob.title}?`,
            `What is your approach to automated testing and continuous integration?`,
            `Can you walk through your most challenging production bug and how you resolved it?`
          ]
        });
      }
    }, 2100);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <PageContainer
      title="Resume Analysis"
      subtitle="Screen candidate resumes against target job requisitions to compute job fit and generate interview questions."
      actions={
        analysisResult && (
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>
            New Analysis
          </Button>
        )
      }
    >
      {analysisResult ? (
        <AnalysisResults
          analysis={analysisResult}
          targetJob={activeJob}
          onReset={handleReset}
        />
      ) : (
        <div className="max-w-4xl space-y-6">
          {/* Step 1: Resume Upload Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <CardTitle>Upload Candidate Resume</CardTitle>
              </div>
              <span className="text-xs text-slate-400">PDF, DOCX, or TXT</span>
            </CardHeader>
            <CardContent>
              <ResumeUploader
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
                onSelectSample={handleSelectSample}
              />
            </CardContent>
          </Card>

          {/* Step 2: Job Description Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <CardTitle>Target Job Description</CardTitle>
              </div>
              <button
                type="button"
                onClick={() => setUseCustomJob(!useCustomJob)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {useCustomJob ? "Select an existing job instead" : "Or enter custom job description"}
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!useCustomJob ? (
                <div>
                  <Select
                    label="Select Active Job Opening *"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} — {job.department} ({job.experienceLevel})
                      </option>
                    ))}
                  </Select>

                  {/* Selected Job Preview Card */}
                  {activeJob && (
                    <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{activeJob.title}</span>
                        <span className="text-slate-500">{activeJob.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-slate-400 font-medium mr-1">Required:</span>
                        {activeJob.requiredSkills.map((s) => (
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
                    placeholder="Paste the required skills, years of experience, and role overview here..."
                    className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </CardContent>

            {/* Analysis Trigger Footer */}
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80">
              <div className="text-xs text-slate-500">
                {selectedFile ? (
                  <span>Selected: <strong className="text-slate-800">{selectedFile.name}</strong></span>
                ) : (
                  <span>Please upload or select a resume file above</span>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                disabled={!selectedFile || isAnalyzing}
                loading={isAnalyzing}
                onClick={handleStartAnalysis}
                className="w-full sm:w-auto shadow-sm"
              >
                {isAnalyzing ? "Analyzing Candidate..." : "Analyze Candidate"}
              </Button>
            </CardFooter>
          </Card>

          {/* Analysis Processing Status Banner */}
          {isAnalyzing && (
            <div className="p-5 bg-white border border-blue-200 rounded-xl shadow-subtle space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Screening resume against job profile...
                </span>
                <span className="text-slate-400">Step {analysisStep} of 3</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(analysisStep / 3) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {analysisStep === 1 && "Parsing resume text and extracting competencies..."}
                {analysisStep === 2 && "Cross-referencing candidate skills with job requirements..."}
                {analysisStep === 3 && "Synthesizing job fit score and tailored interview questions..."}
              </p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
