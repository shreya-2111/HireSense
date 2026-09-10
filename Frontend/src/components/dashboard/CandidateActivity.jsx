import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { MatchScoreBadge } from '../candidates/MatchScoreBadge';

export function CandidateActivity({ candidates = [] }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return <Badge variant="success" dot size="sm">Shortlisted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="default" dot size="sm">Interview</Badge>;
      case 'Maybe':
        return <Badge variant="warning" dot size="sm">Maybe</Badge>;
      case 'Rejected':
        return <Badge variant="danger" dot size="sm">Rejected</Badge>;
      default:
        return <Badge variant="neutral" dot size="sm">Under Review</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="py-2.5 px-3 sm:px-3.5 whitespace-nowrap">Candidate</th>
            <th className="py-2.5 px-3 sm:px-3.5 whitespace-nowrap">Applied For</th>
            <th className="py-2.5 px-3 sm:px-3.5 whitespace-nowrap">Match Score</th>
            <th className="py-2.5 px-3 sm:px-3.5 whitespace-nowrap">Status</th>
            <th className="py-2.5 px-3 sm:px-3.5 text-right whitespace-nowrap">Last Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {candidates.slice(0, 5).map((cand) => (
            <tr
              key={cand.id}
              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              onClick={() => navigate(`/candidates/${cand.id}`)}
            >
              <td className="py-2.5 px-3 sm:px-3.5 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={cand.avatar} size="xs" />
                  <div>
                    <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cand.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block sm:hidden">{cand.appliedRole}</span>
                  </div>
                </div>
              </td>
              <td className="py-2.5 px-3 sm:px-3.5 hidden sm:table-cell text-slate-700 whitespace-nowrap">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">
                  {cand.appliedRole}
                </span>
              </td>
              <td className="py-2.5 px-3 sm:px-3.5 whitespace-nowrap">
                <MatchScoreBadge score={cand.matchScore} size="sm" />
              </td>
              <td className="py-2.5 px-3 sm:px-3.5 whitespace-nowrap">
                {getStatusBadge(cand.status)}
              </td>
              <td className="py-2.5 px-3 sm:px-3.5 text-right text-xs text-slate-400 whitespace-nowrap">
                {cand.appliedDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
