import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Edit3, Trash2, XCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { JobEditModal } from './JobEditModal';
import { JobDeleteConfirmModal } from './JobDeleteConfirmModal';
import { useRecruitment } from '../../context/RecruitmentContext';
import { formatIndianDate } from '../../utils/formatters';

export function JobTable({ jobs = [], onSelectJob }) {
  const navigate = useNavigate();
  const { updateJobStatus } = useRecruitment();
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);

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
            <TableHead className="text-center">Action</TableHead>
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
                    <span>{job.type || job.employment_type || 'Remote'}</span>
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

              {/* Status Badge Only (Removed close option from status line) */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                </div>
              </TableCell>

              {/* Created */}
              <TableCell>
                <span className="text-xs text-slate-500">
                  {formatIndianDate(job.createdDate)}
                </span>
              </TableCell>

              {/* Action Column with Close, Edit, Delete Options */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs px-2.5 py-1"
                    onClick={() => onSelectJob ? onSelectJob(job) : null}
                  >
                    Details
                  </Button>

                  {/* Close / Reopen Action Option */}
                  {job.status === 'Active' ? (
                    <Button
                      size="sm"
                      variant="dangerOutline"
                      className="text-xs px-2.5 py-1"
                      onClick={() => updateJobStatus(job.id, 'Closed')}
                      title="Close Job"
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="successOutline"
                      className="text-xs px-2.5 py-1"
                      onClick={() => updateJobStatus(job.id, 'Active')}
                      title="Reopen Job"
                    >
                      Reopen
                    </Button>
                  )}

                  {/* Edit Option */}
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Edit3}
                    className="text-xs px-2 py-1 text-slate-700 hover:text-blue-600 hover:border-blue-300"
                    onClick={() => setEditingJob(job)}
                    title="Edit & Update Job"
                  >
                    Edit
                  </Button>

                  {/* Delete Option */}
                  <Button
                    size="sm"
                    variant="dangerOutline"
                    icon={Trash2}
                    className="text-xs px-2 py-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => setDeletingJob(job)}
                    title="Delete Job"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Job Modal */}
      <JobEditModal
        job={editingJob}
        isOpen={Boolean(editingJob)}
        onClose={() => setEditingJob(null)}
      />

      {/* Delete Confirmation Modal */}
      <JobDeleteConfirmModal
        job={deletingJob}
        isOpen={Boolean(deletingJob)}
        onClose={() => setDeletingJob(null)}
      />
    </div>
  );
}

