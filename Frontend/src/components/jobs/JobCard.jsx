import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Briefcase, IndianRupee, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { JobEditModal } from './JobEditModal';
import { JobDeleteConfirmModal } from './JobDeleteConfirmModal';
import { useRecruitment } from '../../context/RecruitmentContext';
import { formatIndianDate, formatSalary } from '../../utils/formatters';

export function JobCard({ job, onSelect }) {
  const navigate = useNavigate();
  const { updateJobStatus } = useRecruitment();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success" dot size="sm">Active</Badge>;
      case 'Draft':
        return <Badge variant="neutral" dot size="sm">Draft</Badge>;
      case 'Closed':
        return <Badge variant="danger" dot size="sm">Closed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="hover:border-blue-300/80 transition-all hover:shadow-md flex flex-col justify-between">
        <div className="p-5 space-y-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  {job.department}
                </span>
                <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                  {job.type || job.employment_type || 'Remote'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onSelect(job)}>
                {job.title}
              </h3>
            </div>
            {getStatusBadge(job.status)}
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {job.description}
          </p>

          <div className="space-y-1.5 pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.location}</span>
            </div>
            {job.salaryRange && (
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formatSalary(job.salaryRange)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-slate-800 font-semibold">{job.candidatesCount}</strong> candidates ({job.shortlistedCount} shortlisted)</span>
            </div>
          </div>

          {/* Required skills tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {(job.requiredSkills || []).slice(0, 4).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded">
                {skill}
              </span>
            ))}
            {(job.requiredSkills || []).length > 4 && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded">
                +{(job.requiredSkills || []).length - 4}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">Created {formatIndianDate(job.createdDate)}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button size="sm" variant="ghost" className="px-2 py-1 text-xs" onClick={() => onSelect(job)}>
              Details
            </Button>
            {job.status === 'Active' ? (
              <Button
                size="sm"
                variant="dangerOutline"
                className="px-2 py-1 text-xs"
                onClick={() => updateJobStatus(job.id, 'Closed')}
              >
                Close
              </Button>
            ) : (
              <Button
                size="sm"
                variant="successOutline"
                className="px-2 py-1 text-xs"
                onClick={() => updateJobStatus(job.id, 'Active')}
              >
                Reopen
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              icon={Edit3}
              className="px-2 py-1 text-xs text-slate-700 hover:text-blue-600"
              onClick={() => setIsEditing(true)}
              title="Edit Job"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="dangerOutline"
              icon={Trash2}
              className="px-2 py-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setIsDeleting(true)}
              title="Delete Job"
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <JobEditModal
        job={job}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />

      <JobDeleteConfirmModal
        job={job}
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
      />
    </>
  );
}

