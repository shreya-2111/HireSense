import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function JobRequirementComparison({ candidate, job }) {
  const reqSkills = job?.requiredSkills || ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'];
  const matchedSkills = candidate?.matchedSkills || [];
  const missingSkills = candidate?.missingSkills || [];

  const comparisonRows = [
    ...reqSkills.map((skill) => {
      const isMatched = matchedSkills.includes(skill);
      return {
        requirement: skill,
        type: 'Skill',
        status: isMatched ? 'Matched' : 'Missing',
        isMatched: isMatched,
        detail: isMatched ? 'Verified in resume experience' : 'Not identified in primary profile',
      };
    }),
    {
      requirement: `${job?.experienceLevel || '3+ years'} professional experience`,
      type: 'Tenure',
      status: candidate?.experienceYears >= 3 ? 'Matched' : 'Partial Match',
      isMatched: candidate?.experienceYears >= 3,
      detail: `${candidate?.experienceYears || 4.5} years verified track record`,
    },
    {
      requirement: 'Degree in Computer Science or related field',
      type: 'Education',
      status: candidate?.education ? 'Matched' : 'Under Review',
      isMatched: Boolean(candidate?.education),
      detail: candidate?.education?.degree || 'Verified degree',
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Job Requirement Comparison</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown showing why the candidate received a {candidate?.matchScore}% match score
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
                  {row.isMatched ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Matched
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <X className="w-3 h-3 text-amber-600" />
                      Missing
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-right text-xs text-slate-500">
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
