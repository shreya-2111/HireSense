import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, Filter } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { JobTable } from '../components/jobs/JobTable';
import { JobCard } from '../components/jobs/JobCard';
import { JobDetailModal } from '../components/jobs/JobDetailModal';
import { JobEditModal } from '../components/jobs/JobEditModal';
import { JobDeleteConfirmModal } from '../components/jobs/JobDeleteConfirmModal';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecruitment } from '../context/RecruitmentContext';

export function JobsPage() {
  const navigate = useNavigate();
  const { jobs } = useRecruitment();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [activeJobModal, setActiveJobModal] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);


  // Tab counts
  const allCount = jobs.length;
  const activeCount = jobs.filter((j) => j.status === 'Active').length;
  const draftCount = jobs.filter((j) => j.status === 'Draft').length;
  const closedCount = jobs.filter((j) => j.status === 'Closed').length;

  const statusTabs = [
    { id: 'all', label: 'All Jobs', count: allCount },
    { id: 'Active', label: 'Active', count: activeCount },
    { id: 'Draft', label: 'Draft', count: draftCount },
    { id: 'Closed', label: 'Closed', count: closedCount },
  ];

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.requiredSkills && job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus =
        selectedStatusTab === 'all' || job.status === selectedStatusTab;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, selectedStatusTab]);

  return (
    <PageContainer
      title="Jobs"
      subtitle="Create and manage your job openings."
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/jobs/create')}
        >
          Create Job
        </Button>
      }
    >
      {/* Top Controls: Search + Tabs + View Mode Toggle */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Tabs
            tabs={statusTabs}
            activeTab={selectedStatusTab}
            onChange={setSelectedStatusTab}
            className="border-b-0"
          />

          <div className="flex items-center gap-2.5">
            {/* Search Jobs Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs or skills..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Content List / Table */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs matching your filter"
          description="Try changing your search terms or switch to another status tab."
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedStatusTab('all');
          }}
        />
      ) : viewMode === 'table' ? (
        <JobTable jobs={filteredJobs} onSelectJob={(job) => setActiveJobModal(job)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={(selected) => setActiveJobModal(selected)}
            />
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      <JobDetailModal
        job={activeJobModal}
        isOpen={Boolean(activeJobModal)}
        onClose={() => setActiveJobModal(null)}
        onEdit={(job) => setEditingJob(job)}
        onDelete={(job) => setDeletingJob(job)}
      />

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
    </PageContainer>
  );
}
