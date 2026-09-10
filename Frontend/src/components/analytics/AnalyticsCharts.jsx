import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockAnalytics';

export function CandidatesByJobChart({ data = MOCK_ANALYTICS.candidatesByJob }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#334155', fontSize: 12 }}
            width={120}
          />
          <Tooltip
            formatter={(value, name) => [value, name === 'applicants' ? 'Total Applicants' : name]}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
          />
          <Bar dataKey="applicants" fill="#2563eb" radius={[0, 4, 4, 0]} name="Applicants" barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreDistributionChart({ data = MOCK_ANALYTICS.scoreDistribution }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            formatter={(val, name, props) => [`${val} Candidates`, props.payload.label || 'Candidates']}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || '#2563eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PipelineFunnelChart({ data = MOCK_ANALYTICS.pipelineFunnel }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="stage" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            formatter={(val, name, props) => [`${val} Candidates (${props.payload.percentage || 0}%)`, 'Stage Volume']}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
          />
          <Bar dataKey="candidates" radius={[4, 4, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`funnel-cell-${index}`} fill={entry.fill || '#2563eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
