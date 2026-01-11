'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyData {
  week: string;
  count: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyData[];
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  return (
    <div className="bg-white rounded-card shadow-card border border-warm-200 p-6">
      <h2 className="text-xl font-bold text-warm-900 mb-6">Weekly Activity</h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
            <XAxis
              dataKey="week"
              tick={{ fill: '#8B7D6B', fontSize: 12 }}
              axisLine={{ stroke: '#C8BEB0' }}
            />
            <YAxis
              tick={{ fill: '#8B7D6B', fontSize: 12 }}
              axisLine={{ stroke: '#C8BEB0' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '12px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#4A4238', fontWeight: 600 }}
              itemStyle={{ color: '#6B8365' }}
            />
            <Bar
              dataKey="count"
              fill="url(#sageGradient)"
              radius={[8, 8, 0, 0]}
              name="Activities"
            />
            <defs>
              <linearGradient id="sageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B5C9AF" />
                <stop offset="100%" stopColor="#8FA885" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
