import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, IndianRupee, Calendar, UserCheck, Briefcase, XCircle, RotateCcw, Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';
import { formatSalary } from '../../utils/formatters';

export function JobDetailModal({ job, isOpen, onClose, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { updateJobStatus } = useRecruitment();


  if (!job) return null;

  const handleToggleStatus = () => {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    updateJobStatus(job.id, newStatus);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.title}
      subtitle={`${job.department} • ${job.location} • ${job.type || 'Remote'}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            {job.status === 'Active' ? (
              <Button
                variant="dangerOutline"
                size="sm"
                icon={XCircle}
                onClick={handleToggleStatus}
              >
                Close Requisition
              </Button>
            ) : (
              <Button
                variant="successOutline"
                size="sm"
                icon={RotateCcw}
                onClick={handleToggleStatus}
              >
                Reopen Requisition
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => {
                onClose();
                if (onEdit) onEdit(job);
              }}
            >
              Edit
            </Button>
            <Button
              variant="dangerOutline"
              size="sm"
              icon={Trash2}
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                onClose();
                if (onDelete) onDelete(job);
              }}
            >
              Delete
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Users}
              onClick={() => {
                onClose();
                navigate(`/candidates?job=${job.id}`);
              }}
            >
              View {job.candidatesCount} Candidates
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-slate-800">
        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status & Mode</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${job.status === 'Active' ? 'bg-emerald-500' : job.status === 'Closed' ? 'bg-red-500' : 'bg-slate-400'}`} />
              {job.status} ({job.type || 'Remote'})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Experience</span>
            <span className="font-semibold text-slate-800">
              {job.experienceLevel || job.experience || (job.experience_min !== undefined ? `${job.experience_min}-${job.experience_max || job.experience_min + 3} yrs` : '2-5 yrs')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Salary / Package</span>
            <span className="font-semibold text-slate-800 text-emerald-700">{formatSalary(job.salaryRange)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hiring Lead</span>
            <span className="font-semibold text-slate-800 truncate block">{job.hiringManager || 'Engineering Lead'}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Role Overview</h4>
          <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
            {job.description}
          </p>
        </div>

        {/* Required Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mandatory Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Nice to have skills */}
        {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nice-to-Have Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {job.niceToHaveSkills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
