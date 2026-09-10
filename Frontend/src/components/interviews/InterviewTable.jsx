import React from 'react';
import { Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';

export function InterviewTable({ interviews = [], onSelectInterview }) {
  const { updateInterviewStatus } = useRecruitment();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-400';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200 focus:ring-red-400';
      case 'Pending Feedback':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Candidate</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Interview Type</TableHead>
            <TableHead>Interviewer</TableHead>
            <TableHead>Status (Click to Change)</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {interviews.map((item) => (
            <TableRow
              key={item.id}
              isClickable
              onClick={() => onSelectInterview(item)}
            >
              {/* Candidate */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar initials={item.candidateAvatar} size="sm" />
                  <div>
                    <span className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                      {item.candidateName}
                    </span>
                    <span className="text-xs text-slate-400 block">ID: {item.candidateId}</span>
                  </div>
                </div>
              </TableCell>

              {/* Position */}
              <TableCell>
                <span className="text-xs font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                  {item.position}
                </span>
              </TableCell>

              {/* Date & Time */}
              <TableCell>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </TableCell>

              {/* Type */}
              <TableCell>
                <span className="text-xs font-medium text-slate-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-md">
                  {item.type}
                </span>
              </TableCell>

              {/* Interviewer */}
              <TableCell>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {item.interviewer.split('(')[0]}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.interviewerRole || 'Hiring Team'}
                  </span>
                </div>
              </TableCell>

              {/* Interactive Status Selector */}
              <TableCell>
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={item.status}
                    onChange={(e) => updateInterviewStatus(item.id, e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer appearance-none transition-colors shadow-2xs focus:outline-none focus:ring-1 pr-6 relative bg-no-repeat bg-[right_6px_center] ${getStatusColor(item.status)}`}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Pending Feedback">Pending Feedback</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  icon={FileText}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectInterview(item);
                  }}
                  className="text-xs"
                >
                  Prep Notes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
