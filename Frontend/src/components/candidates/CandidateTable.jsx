import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScoreBadge } from './MatchScoreBadge';
import { SkillBadge } from './SkillBadge';

export function CandidateTable({ candidates = [] }) {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState('matchScore');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection(columnKey === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (sortColumn === 'matchScore') {
        valA = a.matchScore || 0;
        valB = b.matchScore || 0;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      if (sortColumn === 'experienceYears') {
        valA = a.experienceYears || 0;
        valB = b.experienceYears || 0;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      if (sortColumn === 'appliedDate') {
        valA = new Date(a.appliedDate || 0).getTime();
        valB = new Date(b.appliedDate || 0).getTime();
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [candidates, sortColumn, sortDirection]);

  const renderSortIndicator = (columnKey) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 ml-1" />
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return <Badge variant="success" dot>Shortlisted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="default" dot>Interview Scheduled</Badge>;
      case 'Maybe':
        return <Badge variant="warning" dot>Maybe</Badge>;
      case 'Rejected':
        return <Badge variant="danger" dot>Rejected</Badge>;
      default:
        return <Badge variant="neutral" dot>Under Review</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('name')}
                className="flex items-center gap-0.5 hover:text-blue-600 font-semibold transition-colors group text-left cursor-pointer"
              >
                Candidate {renderSortIndicator('name')}
              </button>
            </TableHead>
            <TableHead>Applied For</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('experienceYears')}
                className="flex items-center gap-0.5 hover:text-blue-600 font-semibold transition-colors group text-left cursor-pointer"
              >
                Experience {renderSortIndicator('experienceYears')}
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('matchScore')}
                className="flex items-center gap-0.5 hover:text-blue-600 font-semibold transition-colors group text-left cursor-pointer"
              >
                Match Score {renderSortIndicator('matchScore')}
              </button>
            </TableHead>
            <TableHead>Verified Skills</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map((cand) => (
            <TableRow
              key={cand.id}
              isClickable
              onClick={() => navigate(`/candidates/${cand.id}`)}
            >
              {/* Candidate Info */}
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar initials={cand.avatar} size="xs" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate">
                      {cand.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{cand.email}</p>
                  </div>
                </div>
              </TableCell>

              {/* Applied For */}
              <TableCell>
                <span className="text-xs font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md truncate block max-w-[180px]">
                  {cand.appliedRole}
                </span>
              </TableCell>

              {/* Experience */}
              <TableCell>
                <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                  {cand.experienceYears || 0} yrs
                </span>
              </TableCell>

              {/* Match Score */}
              <TableCell>
                <MatchScoreBadge score={cand.matchScore} size="sm" />
              </TableCell>

              {/* Verified Skills */}
              <TableCell>
                <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                  {cand.matchedSkills && cand.matchedSkills.length > 0 ? (
                    <>
                      {cand.matchedSkills.slice(0, 2).map((skill) => (
                        <SkillBadge key={skill} name={skill} type="matched" size="sm" />
                      ))}
                      {cand.matchedSkills.length > 2 && (
                        <span className="text-[10px] text-slate-500 font-semibold px-1.5 py-0.2 bg-slate-100 rounded">
                          +{cand.matchedSkills.length - 2}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills listed</span>
                  )}
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                {getStatusBadge(cand.status)}
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs px-2 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/candidates/${cand.id}`);
                  }}
                >
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
