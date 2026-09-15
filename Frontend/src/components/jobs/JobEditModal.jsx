import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Briefcase, MapPin, Building, IndianRupee } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Data & AI',
  'Infrastructure',
  'Marketing',
  'Sales',
  'Operations',
  'Human Resources'
];

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Remote',
  'Hybrid',
  'Internship'
];

const EXPERIENCE_LEVELS = [
  { value: 'Entry-Level (0-2 yrs)', min: 0, max: 2 },
  { value: 'Mid-Level (2-4 yrs)', min: 2, max: 4 },
  { value: 'Mid-Senior (3-5 yrs)', min: 3, max: 5 },
  { value: 'Senior (5+ yrs)', min: 5, max: 8 },
  { value: 'Staff / Lead (7+ yrs)', min: 7, max: 12 },
];

export function JobEditModal({ job, isOpen, onClose, onUpdated }) {
  const { updateJob } = useRecruitment();

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    experienceLevel: 'Mid-Senior (3-5 yrs)',
    salaryRange: '₹12,00,000 - ₹18,00,000 / year',
    status: 'Active',
    description: '',
    requiredSkills: [],
    niceToHaveSkills: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newNiceSkill, setNewNiceSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job && isOpen) {
      setFormData({
        title: job.title || '',
        department: job.department || 'Engineering',
        location: job.location || 'Remote',
        type: job.type || job.employment_type || 'Full-time',
        experienceLevel: job.experienceLevel || job.experience || 'Mid-Senior (3-5 yrs)',
        salaryRange: job.salaryRange || '₹12,00,000 - ₹18,00,000 / year',
        status: job.status || 'Active',
        description: job.description || '',
        requiredSkills: job.requiredSkills || job.skills || [],
        niceToHaveSkills: job.niceToHaveSkills || [],
      });
      setError('');
    }
  }, [job, isOpen]);

  if (!isOpen || !job) return null;

  const handleAddRequiredSkill = (e) => {
    e?.preventDefault();
    const clean = newSkill.trim();
    if (clean && !formData.requiredSkills.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, clean],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveRequiredSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddNiceSkill = (e) => {
    e?.preventDefault();
    const clean = newNiceSkill.trim();
    if (clean && !formData.niceToHaveSkills.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        niceToHaveSkills: [...prev.niceToHaveSkills, clean],
      }));
      setNewNiceSkill('');
    }
  };

  const handleRemoveNiceSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      niceToHaveSkills: prev.niceToHaveSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Job Title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const expConfig = EXPERIENCE_LEVELS.find((lvl) => lvl.value === formData.experienceLevel);

      const payload = {
        title: formData.title.trim(),
        department: formData.department,
        location: formData.location.trim(),
        employment_type: formData.type,
        type: formData.type,
        experienceLevel: formData.experienceLevel,
        experience: formData.experienceLevel,
        experience_min: expConfig ? expConfig.min : 2,
        experience_max: expConfig ? expConfig.max : 5,
        salaryRange: formData.salaryRange.trim(),
        status: formData.status,
        description: formData.description.trim(),
        requiredSkills: formData.requiredSkills,
        niceToHaveSkills: formData.niceToHaveSkills,
        skills: formData.requiredSkills,
      };

      const updated = await updateJob(job.id, payload);
      if (onUpdated) onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update job opening.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Job Requisition"
      subtitle={`Editing opening: ${job.title}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="shadow-sm"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Job Title */}
        <Input
          label="Job Title *"
          placeholder="e.g. Senior Full Stack Engineer"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        {/* Department & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>

          <Input
            label="Location"
            placeholder="e.g. Remote (India / Global), Bengaluru"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        {/* Employment Type, Experience Level, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Select
            label="Job Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <Select
            label="Experience Level"
            value={formData.experienceLevel}
            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
          >
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.value}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </Select>
        </div>

        {/* Target Salary Range */}
        <Input
          label="Compensation / Salary Range"
          placeholder="e.g. ₹18,00,000 - ₹28,00,000 / year"
          value={formData.salaryRange}
          onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
        />

        {/* Mandatory Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mandatory Required Skills
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Add skill (e.g. React.js, Python, PostgreSQL) and press Enter"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRequiredSkill();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddRequiredSkill}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
            {formData.requiredSkills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills added yet</span>
            ) : (
              formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveRequiredSkill(skill)}
                    className="hover:text-red-600 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Nice-to-Have Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nice-to-Have Skills
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Add nice-to-have skill (e.g. Docker, Redis, AWS)"
              value={newNiceSkill}
              onChange={(e) => setNewNiceSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNiceSkill();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddNiceSkill}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
            {formData.niceToHaveSkills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No secondary skills specified</span>
            ) : (
              formData.niceToHaveSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveNiceSkill(skill)}
                    className="hover:text-red-600 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Job Description & Responsibilities
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Outline core responsibilities, qualifications, and expectations..."
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </form>
    </Modal>
  );
}
