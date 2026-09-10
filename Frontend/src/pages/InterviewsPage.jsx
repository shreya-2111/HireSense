import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Clock, Search, Video, UserCheck, Filter } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { InterviewTable } from '../components/interviews/InterviewTable';
import { InterviewPrepDrawer } from '../components/interviews/InterviewPrepDrawer';
import { ScheduleModal } from '../components/interviews/ScheduleModal';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecruitment } from '../context/RecruitmentContext';

export function InterviewsPage() {
  const { interviews } = useRecruitment();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterviewForPrep, setSelectedInterviewForPrep] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Tab counts
  const allCount = interviews.length;
  const scheduledCount = interviews.filter((i) => i.status === 'Scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'Completed').length;
  const pendingCount = interviews.filter((i) => i.status === 'Pending Feedback').length;

  const tabs = [
    { id: 'all', label: 'All Interviews', count: allCount },
    { id: 'Scheduled', label: 'Upcoming', count: scheduledCount },
    { id: 'Pending Feedback', label: 'Pending Feedback', count: pendingCount },
    { id: 'Completed', label: 'Completed', count: completedCount },
  ];

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchesTab = activeTab === 'all' || item.status === activeTab;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.candidateName.toLowerCase().includes(q) ||
        item.position.toLowerCase().includes(q) ||
        item.interviewer.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [interviews, activeTab, searchQuery]);

  return (
    <PageContainer
      title="Interviews"
      subtitle="Coordinate upcoming interviews, synchronize hiring team schedules, and access candidate prep dossiers."
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsScheduleModalOpen(true)}
        >
          Schedule Interview
        </Button>
      }
    >
      {/* Search and Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="border-b-0"
        />

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate, role, or interviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Interviews Table */}
      {filteredInterviews.length === 0 ? (
        <EmptyState
          title="No interviews found"
          description="There are no interview sessions matching the active tab and search criteria."
          actionText="Schedule an Interview"
          onAction={() => setIsScheduleModalOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-800 font-semibold">{filteredInterviews.length}</strong> scheduled sessions</span>
            <span>Click any interview to open Candidate Prep Dossier</span>
          </div>
          <InterviewTable
            interviews={filteredInterviews}
            onSelectInterview={(item) => setSelectedInterviewForPrep(item)}
          />
        </div>
      )}

      {/* Candidate Preparation Drawer */}
      <InterviewPrepDrawer
        interview={selectedInterviewForPrep}
        isOpen={Boolean(selectedInterviewForPrep)}
        onClose={() => setSelectedInterviewForPrep(null)}
      />

      {/* Schedule Interview Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </PageContainer>
  );
}
