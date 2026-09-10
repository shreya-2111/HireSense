import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';

export function JobCard({ job, onSelect }) {
  const navigate = useNavigate();
  const { updateJobStatus } = useRecruitment();

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
    <Card className="hover:border-blue-300/80 transition-all hover:shadow-md flex flex-col justify-between">
      <div className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              {job.department}
            </span>
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
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span><strong className="text-slate-800 font-semibold">{job.candidatesCount}</strong> candidates ({job.shortlistedCount} shortlisted)</span>
          </div>
        </div>

        {/* Required skills tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {job.requiredSkills.slice(0, 4).map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 4 && (
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded">
              +{job.requiredSkills.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">Created {job.createdDate}</span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => onSelect(job)}>
            Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => navigate(`/candidates?job=${job.id}`)}
          >
            Candidates
          </Button>
          {job.status === 'Active' ? (
            <Button
              size="sm"
              variant="dangerOutline"
              onClick={() => updateJobStatus(job.id, 'Closed')}
            >
              Close
            </Button>
          ) : (
            <Button
              size="sm"
              variant="successOutline"
              onClick={() => updateJobStatus(job.id, 'Active')}
            >
              Reopen
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
