import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useRecruitment } from '../context/RecruitmentContext';

export function CreateJobPage() {
  const navigate = useNavigate();
  const { addJob } = useRecruitment();

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote (US/Canada)');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Senior (3-5 yrs)');
  const [salaryRange, setSalaryRange] = useState('$120,000 - $145,000');
  const [description, setDescription] = useState('');

  // Skills chips
  const [requiredSkills, setRequiredSkills] = useState([
    'React',
    'JavaScript',
    'TypeScript',
    'HTML',
    'CSS',
  ]);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');

  const [niceToHaveSkills, setNiceToHaveSkills] = useState([
    'Next.js',
    'Testing',
    'Git',
  ]);
  const [newNiceSkill, setNewNiceSkill] = useState('');

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

    addJob({
      title: title.trim(),
      department,
      location,
      type: employmentType,
      experienceLevel,
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
                <option value="Remote (US/Canada)">Remote (US/Canada)</option>
                <option value="Remote (Global)">Remote (Global)</option>
                <option value="San Francisco, CA (Hybrid)">San Francisco, CA (Hybrid)</option>
                <option value="New York, NY (Hybrid)">New York, NY (Hybrid)</option>
                <option value="Austin, TX (On-site)">Austin, TX (On-site)</option>
              </Select>

              <Select
                label="Employment Type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
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
                  label="Target Salary or Hourly Range"
                  placeholder="e.g. $120,000 - $145,000 / year"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Job Description */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Role scope, responsibilities, and team expectations</p>
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
              <div className="flex flex-wrap gap-2 mb-3 min-h-[36px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                {requiredSkills.map((skill) => (
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
                ))}
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
              <div className="flex flex-wrap gap-2 mb-3 min-h-[36px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                {niceToHaveSkills.map((skill) => (
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
                ))}
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
