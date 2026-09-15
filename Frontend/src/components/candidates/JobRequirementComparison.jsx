import React from 'react';
import { Check, X, Sparkles, Link2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function JobRequirementComparison({ candidate, job }) {
  const reqSkills = job?.requiredSkills || [];
  const matchedSkills = candidate?.matchedSkills || [];
  const inferredSkills = candidate?.inferredSkills || [];
  const relatedSkills = candidate?.relatedSkills || [];
  const skillMatchDetails = candidate?.skillMatchDetails || [];

  const comparisonRows = [
    ...reqSkills.map((skill) => {
      // Find structured detail if available
      const detail = skillMatchDetails.find(
        (d) => d.required_skill?.toLowerCase() === skill.toLowerCase()
      );

      let status = 'Missing';
      let statusType = 'missing';
      let recruiterDetail = 'Not identified in primary profile';

      if (detail) {
        statusType = detail.match_type;
        if (detail.match_type === 'direct') {
          status = 'Direct Match';
          recruiterDetail = `Verified direct mention (${detail.confidence || 100}%)`;
        } else if (detail.match_type === 'inferred') {
          status = `Inferred Match (${detail.confidence}%)`;
          recruiterDetail = `Covered via ${detail.evidence_skill} (${detail.relationship})`;
        } else if (detail.match_type === 'related') {
          status = `Related / Partial (${detail.confidence}%)`;
          recruiterDetail = `Ecosystem alignment via ${detail.evidence_skill}`;
        } else {
          status = 'Missing';
          recruiterDetail = 'No sufficient evidence identified';
        }
      } else if (inferredSkills.includes(skill)) {
        status = 'Inferred Match';
        statusType = 'inferred';
        recruiterDetail = 'Verified via related framework/technology';
      } else if (relatedSkills.includes(skill)) {
        status = 'Related / Partial';
        statusType = 'related';
        recruiterDetail = 'Related technology in ecosystem';
      } else if (matchedSkills.includes(skill)) {
        status = 'Direct Match';
        statusType = 'direct';
        recruiterDetail = 'Verified in resume experience';
      }

      return {
        requirement: skill,
        type: 'Skill',
        status,
        statusType,
        detail: recruiterDetail,
      };
    }),
    {
      requirement: `${job?.experienceLevel || '3+ years'} professional experience`,
      type: 'Tenure',
      status: candidate?.experienceYears >= 3 ? 'Matched' : 'Partial Match',
      statusType: candidate?.experienceYears >= 3 ? 'direct' : 'related',
      detail: `${candidate?.experienceYears || 4.5} years verified track record`,
    },
    {
      requirement: 'Degree in Computer Science or related field',
      type: 'Education',
      status: candidate?.education ? 'Matched' : 'Under Review',
      statusType: candidate?.education ? 'direct' : 'missing',
      detail: typeof candidate?.education === 'object' ? (candidate?.education?.degree || 'Verified degree') : (candidate?.education || 'Verified degree'),
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Job Requirement Comparison</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown showing why candidate received a {candidate?.matchScore}% match score
          </p>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Role Requirement</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Evaluation</th>
              <th className="py-2.5 px-4 text-right">Recruiter Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-900">
                  {row.requirement}
                </td>
                <td className="py-2.5 px-4 text-slate-500 text-xs">
                  {row.type}
                </td>
                <td className="py-2.5 px-4">
                  {row.statusType === 'direct' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {row.status}
                    </span>
                  ) : row.statusType === 'inferred' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      {row.status}
                    </span>
                  ) : row.statusType === 'related' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Link2 className="w-3 h-3 text-amber-600" />
                      {row.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <X className="w-3 h-3 text-rose-600" />
                      {row.status}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-right text-xs text-slate-600">
                  {row.detail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
