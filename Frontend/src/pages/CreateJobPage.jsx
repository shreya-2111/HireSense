import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  ArrowLeft,
  Check,
  Sparkles,
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useRecruitment } from '../context/RecruitmentContext';
import { jobsService } from '../services/jobsService';

export function CreateJobPage() {
  const navigate = useNavigate();
  const { addJob } = useRecruitment();
  const jdFileInputRef = useRef(null);

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Bengaluru, Karnataka (Hybrid)');
  const [employmentType, setEmploymentType] = useState('Remote');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Senior (3-5 yrs)');
  const [salaryRange, setSalaryRange] = useState('₹12,00,000 - ₹18,00,000 / year');
  const [description, setDescription] = useState('');

  // Skills chips
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');

  const [niceToHaveSkills, setNiceToHaveSkills] = useState([]);
  const [newNiceSkill, setNewNiceSkill] = useState('');

  // JD Upload states
  const [uploadedJdFile, setUploadedJdFile] = useState(null);
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [jdParseSuccess, setJdParseSuccess] = useState(null);
  const [jdParseError, setJdParseError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle JD File parsing
  const handleJdFile = async (file) => {
    if (!file) return;
    try {
      setIsParsingJd(true);
      setJdParseError('');
      setJdParseSuccess(null);
      setUploadedJdFile(file);

      const parsed = await jobsService.parseJobDescriptionDoc(file);
      if (parsed) {
        if (parsed.title) setTitle(parsed.title);
        if (parsed.department) setDepartment(parsed.department);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.employment_type) setEmploymentType(parsed.employment_type);
        if (parsed.experience_level) setExperienceLevel(parsed.experience_level);
        if (parsed.salary_range) setSalaryRange(parsed.salary_range);
        if (parsed.description) setDescription(parsed.description);

        if (Array.isArray(parsed.required_skills) && parsed.required_skills.length > 0) {
          setRequiredSkills(parsed.required_skills);
        }
        if (Array.isArray(parsed.nice_to_have_skills) && parsed.nice_to_have_skills.length > 0) {
          setNiceToHaveSkills(parsed.nice_to_have_skills);
        }

        const totalSkills = (parsed.required_skills?.length || 0) + (parsed.nice_to_have_skills?.length || 0);
        setJdParseSuccess({
          fileName: file.name,
          title: parsed.title,
          skillsCount: totalSkills
        });
      }
    } catch (err) {
      console.error('JD parse failed:', err);
      setJdParseError(err.message || 'Could not parse JD file. Please check file format.');
    } finally {
      setIsParsingJd(false);
    }
  };

  const handleClearJd = () => {
    setUploadedJdFile(null);
    setJdParseSuccess(null);
    setJdParseError('');
    if (jdFileInputRef.current) {
      jdFileInputRef.current.value = '';
    }
  };

  // Handle adding required skill
  const handleAddRequiredSkill = (e) => {
    e.preventDefault();
    if (newRequiredSkill.trim() && !requiredSkills.includes(newRequiredSkill.trim())) {
      setRequiredSkills([...requiredSkills, newRequiredSkill.trim()]);
      setNewRequiredSkill('');
    }
  };

  const handleRemoveRequiredSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  // Handle adding nice-to-have skill
  const handleAddNiceSkill = (e) => {
    e.preventDefault();
    if (newNiceSkill.trim() && !niceToHaveSkills.includes(newNiceSkill.trim())) {
      setNiceToHaveSkills([...niceToHaveSkills, newNiceSkill.trim()]);
      setNewNiceSkill('');
    }
  };

  const handleRemoveNiceSkill = (skillToRemove) => {
    setNiceToHaveSkills(niceToHaveSkills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (status = 'Active') => {
    if (!title.trim()) {
      alert('Please enter a Job Title');
      return;
    }

    let expMin = 3;
    let expMax = 5;
    if (experienceLevel.includes('0-2')) {
      expMin = 0;
      expMax = 2;
    } else if (experienceLevel.includes('2-4')) {
      expMin = 2;
      expMax = 4;
    } else if (experienceLevel.includes('3-5')) {
      expMin = 3;
      expMax = 5;
    } else if (experienceLevel.includes('5+')) {
      expMin = 5;
      expMax = 8;
    } else if (experienceLevel.includes('7+')) {
      expMin = 7;
      expMax = 12;
    }

    addJob({
      title: title.trim(),
      department,
      location,
      type: employmentType,
      experienceLevel,
      experience_min: expMin,
      experience_max: expMax,
      experienceMin: expMin,
      experienceMax: expMax,
      salaryRange,
      description: description.trim() || `Exciting opportunity for a ${title} to contribute to our high-growth platform.`,
      requiredSkills,
      niceToHaveSkills,
      status,
      hiringManager: 'Engineering Hiring Lead',
    });

    navigate('/jobs');
  };

  return (
    <PageContainer
      breadcrumbs={
        <button
          onClick={() => navigate('/jobs')}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-500"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </button>
      }
      title="Create Job Opening"
      subtitle="Define position details, qualifications, and core skill requirements."
    >
      <div className="max-w-4xl space-y-6">
        {/* Hidden File Input for JD */}
        <input
          type="file"
          ref={jdFileInputRef}
          className="hidden"
          accept=".pdf,.docx,.doc,.txt,.md"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleJdFile(e.target.files[0]);
            }
          }}
        />

        {/* Section 0: Quick Auto-Fill with JD Upload */}
        <Card className="border-blue-200/70 bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-white shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Auto-Fill Requisition from Job Description (JD)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
                    Fast Setup
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Upload a JD file (PDF, DOCX, or TXT). HireSense will automatically extract the Job Title, Experience, Description, and required technical skills.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isParsingJd}
                  onClick={() => jdFileInputRef.current?.click()}
                  className="w-full md:w-auto flex items-center justify-center gap-2 shadow-sm"
                >
                  {isParsingJd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing JD Document...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload JD File</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Drag and drop interactive zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleJdFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => jdFileInputRef.current?.click()}
              className={`mt-4 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 bg-white/70 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-medium text-slate-700">
                  <span className="text-blue-600 hover:underline font-semibold">Click to upload</span> or drag and drop your JD document
                </div>
                <div className="text-[11px] text-slate-400">
                  Supported formats: PDF, DOCX, TXT, MD (Max 10MB)
                </div>
              </div>
            </div>

            {/* Error Message */}
            {jdParseError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{jdParseError}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {jdParseSuccess && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">{jdParseSuccess.fileName}</span> parsed successfully! Auto-filled{' '}
                    <span className="font-semibold text-emerald-900">{jdParseSuccess.skillsCount} skills</span> and job details.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearJd();
                  }}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-100/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 1: Job Information */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Basic requisition details and workplace parameters</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Job Title *"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <Select
                label="Department *"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Product Management">Product Management</option>
                <option value="People Operations">People Operations</option>
              </Select>

              <Select
                label="Location *"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
                <option value="Pune, Maharashtra">Pune, Maharashtra</option>
                <option value="Ahmedabad, Gujarat">Ahmedabad, Gujarat</option>
                <option value="Mumbai, Maharashtra">Mumbai, Maharashtra</option>
                <option value="Hyderabad, Telangana">Hyderabad, Telangana</option>
                <option value="Delhi NCR">Delhi NCR / Noida / Gurugram</option>
                <option value="Remote (India / Global)">Remote (India / Global)</option>
              </Select>

              <Select
                label="Job Type *"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="Remote">Remote</option>
                <option value="Work from Home">Work from Home</option>
                <option value="Work from Office">Work from Office</option>
                <option value="Hybrid">Hybrid</option>
              </Select>

              <Select
                label="Experience Level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Entry-Level (0-2 yrs)">Entry-Level (0-2 yrs)</option>
                <option value="Mid-Level (2-4 yrs)">Mid-Level (2-4 yrs)</option>
                <option value="Mid-Senior (3-5 yrs)">Mid-Senior (3-5 yrs)</option>
                <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                <option value="Staff / Lead (7+ yrs)">Staff / Lead (7+ yrs)</option>
              </Select>

              <div className="sm:col-span-2">
                <Input
                  label="Target Salary or Package (₹ / LPA)"
                  placeholder="e.g. ₹12,00,000 - ₹18,00,000 / year or ₹12 - ₹18 LPA"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Job Description */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Job Description</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Role scope, responsibilities, and team expectations</p>
            </div>
            <button
              type="button"
              onClick={() => jdFileInputRef.current?.click()}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-blue-50 transition-colors border border-blue-200 shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload JD File</span>
            </button>
          </CardHeader>
          <CardContent>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description & Requirements
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the role responsibilities, what the candidate will build, team dynamics, and day-to-day work..."
              className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400 leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Section 3: Required Skills & Nice to have */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Qualifications</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              HireSense uses these skills to automatically score candidate resumes and highlight matches
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Required Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Required Skills (Mandatory for High Match)
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-3 min-h-[38px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                {requiredSkills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic px-1">No required skills added yet (type below and click Add)</span>
                ) : (
                  requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequiredSkill(skill)}
                        className="hover:text-blue-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add skill input */}
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Type skill & press Enter or Add..."
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequiredSkill(e);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button size="sm" variant="secondary" onClick={handleAddRequiredSkill}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Nice to have skills */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Nice-to-Have Skills (Bonus Points)
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-3 min-h-[38px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                {niceToHaveSkills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic px-1">No nice-to-have skills added yet (optional)</span>
                ) : (
                  niceToHaveSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNiceSkill(skill)}
                        className="hover:text-slate-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add nice-to-have skill input */}
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. Next.js, Docker, Testing..."
                  value={newNiceSkill}
                  onChange={(e) => setNewNiceSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNiceSkill(e);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button size="sm" variant="secondary" onClick={handleAddNiceSkill}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>

          {/* Form Action Buttons */}
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/jobs')}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSave('Draft')}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Check}
                onClick={() => handleSave('Active')}
              >
                Create Job
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
