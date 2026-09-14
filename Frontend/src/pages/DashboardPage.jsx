import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentJobsTable } from '../components/dashboard/RecentJobsTable';
import { CandidateActivity } from '../components/dashboard/CandidateActivity';
import { RecruitmentChart } from '../components/dashboard/RecruitmentChart';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useRecruitment } from '../context/RecruitmentContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    jobs,
    candidates,
    activeJobsCount,
    totalCandidatesCount,
    reviewedCandidatesCount,
    scheduledInterviewsCount
  } = useRecruitment();

  const reviewedRate = totalCandidatesCount > 0
    ? ((reviewedCandidatesCount / totalCandidatesCount) * 100).toFixed(0)
    : '0';

  const dateRangeText = useMemo(() => {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startStr = past.toLocaleString('default', { month: 'short', year: 'numeric' });
    const endStr = now.toLocaleString('default', { month: 'short', year: 'numeric' });
    return `${startStr} — ${endStr}`;
  }, []);

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Overview of your recruitment activity"
    >
      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Jobs"
          value={activeJobsCount}
          subtitle="Positions currently accepting applicants"
          icon={Briefcase}
          iconBg="bg-blue-50 text-blue-600"
          trend={`${activeJobsCount} active`}
        />
        <StatCard
          title="Total Candidates"
          value={totalCandidatesCount}
          subtitle="Applicants across all active pipelines"
          icon={Users}
          iconBg="bg-indigo-50 text-indigo-600"
          trend={`${totalCandidatesCount} in pool`}
        />
        <StatCard
          title="Candidates Reviewed"
          value={reviewedCandidatesCount}
          subtitle={`${reviewedRate}% screening rate`}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600"
          trend="Ahead of schedule"
        />
        <StatCard
          title="Interviews Scheduled"
          value={scheduledInterviewsCount}
          subtitle="Upcoming sessions with hiring leads"
          icon={Calendar}
          iconBg="bg-purple-50 text-purple-600"
          trend={`${scheduledInterviewsCount} scheduled`}
        />
      </div>

      {/* Recruitment Overview Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
            <div>
              <CardTitle>Recruitment Overview</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly application volume versus candidates screened over the past 6 months
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              {dateRangeText}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <RecruitmentChart />
        </CardContent>
      </Card>

      {/* Distinct Full-Width Row 1: Recent Jobs */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Open requisitions with active candidates</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700"
              onClick={() => navigate('/jobs')}
            >
              View all jobs
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <div className="p-0">
          <RecentJobsTable jobs={jobs} />
        </div>
        <CardFooter className="py-2.5 px-4 text-xs text-slate-500 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <span>{jobs.length} total openings in pipeline</span>
          <button
            onClick={() => navigate('/jobs')}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Manage all jobs &rarr;
          </button>
        </CardFooter>
      </Card>

      {/* Distinct Full-Width Row 2: Candidate Activity */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Candidate Activity</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Latest applicant screening results and updates</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700"
              onClick={() => navigate('/candidates')}
            >
              View all candidates
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <div className="p-0">
          <CandidateActivity candidates={candidates} />
        </div>
        <CardFooter className="py-2.5 px-4 text-xs text-slate-500 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <span>{candidates.length} active candidates evaluated</span>
          <button
            onClick={() => navigate('/candidates')}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            View candidate pool &rarr;
          </button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
