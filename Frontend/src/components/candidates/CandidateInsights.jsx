import React from 'react';
import { CheckCircle2, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function CandidateInsights({ candidate }) {
  const strengths = [
    `Strong ${candidate?.matchedSkills?.[0] || 'core skill'} background with ${candidate?.experienceYears || 4}+ years practical tenure`,
    `Demonstrated performance tuning and scalable modular UI development`,
    `Clear educational foundation in computer science and software design`
  ];

  const areasToExplore = [
    candidate?.missingSkills?.length > 0
      ? `Limited verified production experience with ${candidate.missingSkills.join(' and ')}`
      : 'Verify automated unit testing and end-to-end framework familiarity',
    'Assess experience managing distributed asynchronous state synchronization under peak concurrency'
  ];

  const interviewFocus = [
    `${candidate?.matchedSkills?.[0] || 'Core'} architecture and state management lifecycle`,
    'Performance profiling & bottleneck mitigation strategies',
    `Approach to mastering new toolchains (e.g. ${candidate?.missingSkills?.[0] || 'Next.js / Jest'})`
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Candidate Insights</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Key evaluation signals and recommended focus points for hiring manager interviews
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Key Strengths
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Explore */}
        <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Areas to Explore & Potential Gaps
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {areasToExplore.map((area, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Focus */}
        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/80 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            Recommended Interview Focus
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {interviewFocus.map((focus, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{focus}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
