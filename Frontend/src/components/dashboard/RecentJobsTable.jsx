import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';
import { formatIndianDate } from '../../utils/formatters';

export function RecentJobsTable({ jobs = [] }) {
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="py-2.5 px-4 whitespace-nowrap">Job Title</th>
            <th className="py-2.5 px-4 whitespace-nowrap">Department</th>
            <th className="py-2.5 px-4 whitespace-nowrap">Candidates</th>
            <th className="py-2.5 px-4 whitespace-nowrap">Status</th>
            <th className="py-2.5 px-4 whitespace-nowrap">Created</th>
            <th className="py-2.5 px-4 text-right whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {jobs.slice(0, 5).map((job) => (
            <tr
              key={job.id}
              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              onClick={() => navigate(`/candidates?job=${job.id}`)}
            >
              <td className="py-2.5 px-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                {job.title}
              </td>
              <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                {job.department}
              </td>
              <td className="py-2.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                <span className="font-semibold">{job.candidatesCount}</span>{' '}
                <span className="text-slate-500 text-xs">applicants</span>
              </td>
              <td className="py-2.5 px-4 whitespace-nowrap">
                {getStatusBadge(job.status)}
              </td>
              <td className="py-2.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                {formatIndianDate(job.createdDate)}
              </td>
              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {job.status === 'Active' ? (
                    <button
                      type="button"
                      onClick={() => updateJobStatus(job.id, 'Closed')}
                      className="text-xs text-slate-400 hover:text-red-600 font-medium transition-colors"
                      title="Close this job requisition"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateJobStatus(job.id, 'Active')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      title="Reopen this job requisition"
                    >
                      Reopen
                    </button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs px-2.5 py-1"
                    onClick={() => navigate(`/candidates?job=${job.id}`)}
                  >
                    Review
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
