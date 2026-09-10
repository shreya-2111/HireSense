import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockAnalytics';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 text-xs space-y-1">
        <p className="font-semibold text-slate-800">{label} 2025</p>
        <p className="text-blue-600 flex items-center justify-between gap-4">
          <span>Applications:</span>
          <span className="font-bold">{payload[0].value}</span>
        </p>
        <p className="text-emerald-600 flex items-center justify-between gap-4">
          <span>Reviewed:</span>
          <span className="font-bold">{payload[1].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

export function RecruitmentChart() {
  const data = MOCK_ANALYTICS.monthlyTrend;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorReviewed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Area
            type="monotone"
            dataKey="applications"
            name="Applications Received"
            stroke="#2563eb"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorApplications)"
          />
          <Area
            type="monotone"
            dataKey="reviewed"
            name="Candidates Screened"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReviewed)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
