import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, FileSearch, RefreshCw, X } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { CandidateTable } from '../components/candidates/CandidateTable';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecruitment } from '../context/RecruitmentContext';

export function CandidatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { candidates, jobs } = useRecruitment();

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedJob, setSelectedJob] = useState(searchParams.get('job') || 'all');
  const [selectedScoreTier, setSelectedScoreTier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');

  // Keep search query in sync if URL changes
  useEffect(() => {
    if (searchParams.get('job')) setSelectedJob(searchParams.get('job'));
    if (searchParams.get('q')) setSearchQuery(searchParams.get('q'));
  }, [searchParams]);

  // Filter logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        cand.appliedRole.toLowerCase().includes(q) ||
        (cand.matchedSkills && cand.matchedSkills.some((s) => s.toLowerCase().includes(q)));

      // Job opening filter
      const matchesJob = selectedJob === 'all' || String(cand.appliedJobId) === String(selectedJob);

      // Score filter
      let matchesScore = true;
      if (selectedScoreTier === 'strong') matchesScore = cand.matchScore >= 85;
      else if (selectedScoreTier === 'good') matchesScore = cand.matchScore >= 70 && cand.matchScore < 85;
      else if (selectedScoreTier === 'potential') matchesScore = cand.matchScore < 70;

      // Status filter
      const matchesStatus = selectedStatus === 'all' || cand.status === selectedStatus;

      // Experience filter
      let matchesExp = true;
      if (selectedExp === 'entry') matchesExp = cand.experienceYears <= 2;
      else if (selectedExp === 'mid') matchesExp = cand.experienceYears > 2 && cand.experienceYears <= 5;
      else if (selectedExp === 'senior') matchesExp = cand.experienceYears > 5;

      return matchesSearch && matchesJob && matchesScore && matchesStatus && matchesExp;
    });
  }, [candidates, searchQuery, selectedJob, selectedScoreTier, selectedStatus, selectedExp]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedJob !== 'all' ||
    selectedScoreTier !== 'all' ||
    selectedStatus !== 'all' ||
    selectedExp !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedJob('all');
    setSelectedScoreTier('all');
    setSelectedStatus('all');
    setSelectedExp('all');
    setSearchParams({});
  };

  return (
    <PageContainer
      title="Candidates"
      subtitle="Review, rank, and compare candidate match scores across open positions."
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={FileSearch}
          onClick={() => navigate('/resume-analyzer')}
        >
          Screen New Resume
        </Button>
      }
    >
      {/* Search and Advanced Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Candidate Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate name, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Job Requisition Filter */}
          <Select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="py-1.5 text-xs sm:text-sm"
          >
            <option value="all">All Jobs ({jobs.length})</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.candidatesCount})
              </option>
            ))}
          </Select>

          {/* Match Score Filter */}
          <Select
            value={selectedScoreTier}
            onChange={(e) => setSelectedScoreTier(e.target.value)}
            className="py-1.5 text-xs sm:text-sm"
          >
            <option value="all">All Match Scores</option>
            <option value="strong">Strong Match (≥ 85%)</option>
            <option value="good">Good Match (70% - 84%)</option>
            <option value="potential">Potential Match (&lt; 70%)</option>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 text-xs sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Maybe">Maybe</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </div>

        {/* Bottom Filter Row: Experience + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Experience:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'entry', label: '0-2 yrs' },
                { id: 'mid', label: '3-5 yrs' },
                { id: 'senior', label: '5+ yrs' },
              ].map((exp) => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => setSelectedExp(exp.id)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    selectedExp === exp.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Candidate Results Table */}
      {filteredCandidates.length === 0 ? (
        <EmptyState
          title="No candidates match your criteria"
          description="Try relaxing your score tier or clearing the search query to view candidates."
          actionText="Clear All Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-800 font-semibold">{filteredCandidates.length}</strong> candidates</span>
            <span>Sorted by Match Score & Recent Activity</span>
          </div>
          <CandidateTable candidates={filteredCandidates} />
        </div>
      )}
    </PageContainer>
  );
}
