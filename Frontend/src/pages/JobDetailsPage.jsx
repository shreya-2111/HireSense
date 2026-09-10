import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  XCircle,
  RotateCcw,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MatchScoreBadge } from '../components/candidates/MatchScoreBadge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { useRecruitment } from '../context/RecruitmentContext';

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, candidates, updateJobStatus, attachCandidateToJob, addToast } = useRecruitment();

  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedCandToAttach, setSelectedCandToAttach] = useState('');

  const job = jobs.find((j) => j.id === id) || jobs[0];

  if (!job) {
    return (
      <PageContainer title="Job Requisition Not Found">
        <Button variant="outline" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </PageContainer>
    );
  }

  // Filter candidates attached to this job
  const jobCandidates = candidates.filter(
    (c) => c.appliedJobId === job.id || c.appliedRole === job.title
  );

  const handleToggleJobStatus = () => {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    updateJobStatus(job.id, newStatus);
  };

  const handleAttachCandidate = () => {
    if (!selectedCandToAttach) {
      addToast("Please select a candidate to attach.", "warning");
      return;
    }
    attachCandidateToJob(selectedCandToAttach, job.id, job.title);
    setSelectedCandToAttach('');
    setIsAttachModalOpen(false);
  };

  return (
    <PageContainer
      breadcrumbs={
        <button
          onClick={() => navigate('/jobs')}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-500"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </button>
      }
      title={job.title}
      subtitle={`${job.department} • ${job.location} • Created ${job.createdDate}`}
      actions={
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {job.status === 'Active' ? (
            <Button
              variant="dangerOutline"
              size="sm"
              icon={XCircle}
              onClick={handleToggleJobStatus}
            >
              Close Requisition
            </Button>
          ) : (
            <Button
              variant="successOutline"
              size="sm"
              icon={RotateCcw}
              onClick={handleToggleJobStatus}
            >
              Reopen Requisition
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setIsAttachModalOpen(true)}
          >
            Attach Candidate
          </Button>
        </div>
      }
    >
      {/* Requisition Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requisition Status</span>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${job.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {job.status}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidates Pool</span>
          <p className="text-sm font-bold text-slate-900">{jobCandidates.length} Active Applicants</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience Required</span>
          <p className="text-sm font-bold text-slate-900">{job.experienceLevel}</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Compensation</span>
          <p className="text-sm font-bold text-slate-900">{job.salaryRange || 'Competitive'}</p>
        </div>
      </div>

      {/* Description & Skill Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Role Description & Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {job.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Matrix Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Mandatory Skills ({job.requiredSkills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills?.map((s) => (
                  <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Nice-to-Have Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.niceToHaveSkills.map((s) => (
                    <span key={s} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attached Candidates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Candidate Pipeline for this Opening ({jobCandidates.length})</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Applicants screened and ranked against this role specification</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={UserPlus}
              onClick={() => setIsAttachModalOpen(true)}
            >
              Attach Candidate
            </Button>
          </div>
        </CardHeader>
        {jobCandidates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No candidates attached to this requisition yet. Use "Attach Candidate" or screen a resume in Resume Analyzer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Candidate</th>
                  <th className="py-2.5 px-4">Experience</th>
                  <th className="py-2.5 px-4">Match Score</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {jobCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/candidates/${cand.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={cand.avatar} size="sm" />
                        <div>
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {cand.name}
                          </span>
                          <span className="text-xs text-slate-400 block">{cand.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {cand.experienceYears} yrs
                    </td>
                    <td className="py-3 px-4">
                      <MatchScoreBadge score={cand.matchScore} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={cand.status === 'Shortlisted' ? 'success' : cand.status === 'Maybe' ? 'warning' : 'neutral'} dot>
                        {cand.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/candidates/${cand.id}`);
                        }}
                      >
                        Profile
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Attach Candidate Modal */}
      <Modal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        title={`Attach Candidate to ${job.title}`}
        subtitle="Link an existing candidate from the talent pool to this requisition"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAttachModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAttachCandidate}>
              Attach Candidate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Candidate from Talent Pool"
            value={selectedCandToAttach}
            onChange={(e) => setSelectedCandToAttach(e.target.value)}
          >
            <option value="">-- Choose Candidate --</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.appliedRole}) — {c.matchScore}% Match
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </PageContainer>
  );
}
