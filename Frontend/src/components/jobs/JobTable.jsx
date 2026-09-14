import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, XCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';
import { formatIndianDate } from '../../utils/formatters';

export function JobTable({ jobs = [], onSelectJob }) {
  const navigate = useNavigate();
  const { updateJobStatus } = useRecruitment();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success" dot>Active</Badge>;
      case 'Draft':
        return <Badge variant="neutral" dot>Draft</Badge>;
      case 'Closed':
        return <Badge variant="danger" dot>Closed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Job Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              isClickable
              onClick={() => onSelectJob ? onSelectJob(job) : navigate(`/candidates?job=${job.id}`)}
            >
              {/* Job Title */}
              <TableCell>
                <div>
                  <span className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                    {job.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.experienceLevel || job.experience}</span>
                  </div>
                </div>
              </TableCell>

              {/* Department */}
              <TableCell>
                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                  {job.department}
                </span>
              </TableCell>

              {/* Location */}
              <TableCell>
                <span className="text-xs text-slate-600">
                  {job.location}
                </span>
              </TableCell>

              {/* Candidates count */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {job.candidatesCount}
                  </span>
                  {job.shortlistedCount > 0 && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      {job.shortlistedCount} shortlisted
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Status & Quick Toggle */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  {job.status === 'Active' ? (
                    <button
                      type="button"
                      title="Close this job opening"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateJobStatus(job.id, 'Closed');
                      }}
                      className="text-[11px] text-slate-400 hover:text-red-600 font-medium transition-colors"
                    >
                      Close
                    </button>
                  ) : job.status === 'Closed' ? (
                    <button
                      type="button"
                      title="Reopen this job opening"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateJobStatus(job.id, 'Active');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Publish as active job"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateJobStatus(job.id, 'Active');
                      }}
                      className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </TableCell>

              {/* Created */}
              <TableCell>
                <span className="text-xs text-slate-500">
                  {formatIndianDate(job.createdDate)}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectJob ? onSelectJob(job) : null}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => navigate(`/candidates?job=${job.id}`)}
                  >
                    Candidates
                  </Button>

                  {/* Close / Reopen Action Button */}
                  {job.status === 'Active' ? (
                    <Button
                      size="sm"
                      variant="dangerOutline"
                      className="text-xs px-2.5 py-1"
                      onClick={() => updateJobStatus(job.id, 'Closed')}
                    >
                      Close Job
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="successOutline"
                      className="text-xs px-2.5 py-1"
                      onClick={() => updateJobStatus(job.id, 'Active')}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
