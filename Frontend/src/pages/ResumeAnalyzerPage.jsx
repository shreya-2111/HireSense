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
import { jobsService } from '../services/jobsService';

export function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const { jobs, addCandidate } = useRecruitment();
  const customJdInputRef = React.useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '1');
  const [useCustomJob, setUseCustomJob] = useState(false);
  const [customJobText, setCustomJobText] = useState('');
  const [isParsingCustomJd, setIsParsingCustomJd] = useState(false);
  const [customJdFilename, setCustomJdFilename] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [isQuestionStudioOpen, setIsQuestionStudioOpen] = useState(false);

  const openJobs = jobs.filter((j) => j.status === 'Active');

  // Sync selectedJobId if jobs array loaded asynchronously
  React.useEffect(() => {
    if (openJobs.length > 0 && (!selectedJobId || !openJobs.some(j => String(j.id) === String(selectedJobId)))) {
      setSelectedJobId(openJobs[0].id);
    }
  }, [openJobs, selectedJobId]);

  const activeJob = openJobs.find((j) => String(j.id) === String(selectedJobId)) || openJobs[0];

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setError("Please upload a resume file first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError('');
      const targetJob = useCustomJob && customJobText.trim()
        ? { id: activeJob?.id || 1, title: 'Custom Requisition', requiredSkills: customJobText.split(',').map(s => s.trim()) }
        : activeJob;
      const result = await resumeService.analyzeResume(selectedFile, targetJob);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message || "Failed to analyze resume. Please verify the backend service is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setError('');
    setIsAnalyzing(false);
  };

  return (
    <PageContainer
      title="Resume Analyzer"
      subtitle="Screen candidate resumes against real job requirements to compute match scores, extract verified skills, and generate tailored interview probes."
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
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

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
              id: analysisResult.candidateId,
              name: analysisResult.candidateName,
              appliedRole: activeJob?.title || analysisResult.jobTitle || 'Candidate',
              matchScore: analysisResult.matchScore,
              matchedSkills: analysisResult.matchedSkills,
              missingSkills: analysisResult.missingSkills,
              interviewQuestions: analysisResult.interviewQuestions?.map((q, i) => ({
                id: `q-${i}`,
                question: typeof q === 'string' ? q : q.question,
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
                <CardTitle>Select Target Job Opening</CardTitle>
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
                  {openJobs.length > 0 ? (
                    <Select
                      label="Select Active Requisition *"
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                    >
                      {openJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} — {job.department} ({job.experienceLevel || job.experience || `${job.experience_min || 0}-${job.experience_max || 5} yrs`})
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
                      <span>No active jobs created yet. Please create an active job opening first or use custom requirements.</span>
                      <Button size="sm" variant="primary" onClick={() => navigate('/jobs/create')}>
                        Create Job
                      </Button>
                    </div>
                  )}

                  {activeJob && (
                    <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{activeJob.title}</span>
                        <span className="text-slate-500">{activeJob.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-slate-400 font-medium mr-1">Required skills:</span>
                        {(activeJob.requiredSkills || activeJob.skills || []).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={customJdInputRef}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        try {
                          setIsParsingCustomJd(true);
                          setCustomJdFilename(file.name);
                          const parsed = await jobsService.parseJobDescriptionDoc(file);
                          if (parsed) {
                            const skills = [
                              ...(parsed.required_skills || []),
                              ...(parsed.nice_to_have_skills || [])
                            ];
                            const textSummary = skills.length > 0
                              ? skills.join(', ')
                              : parsed.description || '';
                            setCustomJobText(textSummary);
                          }
                        } catch (err) {
                          console.error('Failed to parse custom JD:', err);
                        } finally {
                          setIsParsingCustomJd(false);
                        }
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Custom Job Description & Skill Requirements
                    </label>
                    <button
                      type="button"
                      disabled={isParsingCustomJd}
                      onClick={() => customJdInputRef.current?.click()}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isParsingCustomJd ? 'Extracting JD skills...' : 'Upload JD File (PDF/DOCX/TXT)'}</span>
                    </button>
                  </div>
                  {customJdFilename && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center justify-between">
                      <span>✓ Extracted skills from <strong>{customJdFilename}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomJdFilename('');
                          setCustomJobText('');
                          if (customJdInputRef.current) customJdInputRef.current.value = '';
                        }}
                        className="text-slate-400 hover:text-slate-600 font-bold ml-2"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <textarea
                    rows={4}
                    value={customJobText}
                    onChange={(e) => setCustomJobText(e.target.value)}
                    placeholder="Enter required skills (comma separated, e.g. React, Python, FastAPI, MySQL) or upload a JD document..."
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
              <span className="text-xs text-slate-400">Supported formats: PDF / DOCX / TXT</span>
            </CardHeader>
            <CardContent>
              <ResumeUploader
                selectedFile={selectedFile}
                onSelectFile={(file) => {
                  setError('');
                  setAnalysisResult(null);
                  setSelectedFile(file);
                }}
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
                    <span>Parsing resume text and calculating match score against {activeJob?.title || 'selected position'}...</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">
                    Extracting candidate background, verifying required stack, and generating questions.
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
