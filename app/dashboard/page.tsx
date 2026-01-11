'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import NavigationBar from '@/components/NavigationBar';
import Button from '@/components/Button';
import { ActivityStats } from '@/app/api/activities/stats/route';

export default function DashboardPage() {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/activities/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-warm-600">Loading statistics...</p>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900 mb-4">Error Loading Statistics</h1>
          <p className="text-warm-600 mb-4">{error || 'Failed to load statistics'}</p>
          <Link href="/">
            <Button variant="primary">Back to Feed</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-50 page-enter">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-cream via-warm-50 to-sand py-12 mb-8 -mx-4 px-4">
          <h1 className="text-4xl font-bold text-warm-900 mb-2">Little Roamers</h1>
          <p className="text-warm-600 text-lg">Growing Up Outdoors</p>
          {stats.hoursThisYear !== null && stats.hoursThisYear > 0 && (
            <p className="text-sage-dark font-semibold text-lg mt-2">
              🌳 {stats.hoursThisYear} hours outside this year
            </p>
          )}
        </div>

        {/* Navigation Bar */}
        <NavigationBar />

        {/* Statistics Cards - 2x2 Grid on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            icon="📊"
            label="Total Activities"
            value={stats.totalActivities}
            subtitle="All time"
            colorClass="from-sage-light to-sage"
          />
          <StatCard
            icon="⏱️"
            label="Total Hours Outside"
            value={stats.totalHours}
            subtitle="All time"
            colorClass="from-sky-light to-sky-dark"
          />
          <StatCard
            icon="📏"
            label="Total Distance"
            value={`${stats.totalDistance} km`}
            subtitle="All time"
            colorClass="from-clay-light to-clay-dark"
          />

          {/* Weather Card */}
          {stats.weatherPatterns.length > 0 ? (
            <div className="bg-white rounded-card shadow-card border border-warm-200 p-4 md:p-6 hover:shadow-hover transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-sunshine to-sunshine text-warm-900 text-3xl mb-4">
                🌤️
              </div>
              <p className="text-warm-600 text-sm font-semibold mb-1">Weather Tracked</p>
              <p className="text-4xl font-bold text-warm-900 mb-1">
                {stats.weatherPatterns.reduce((sum, w) => sum + w.count, 0)}
              </p>
              <p className="text-warm-500 text-xs">
                {stats.weatherPatterns[0]?.condition} most common
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-card shadow-card border border-warm-200 p-4 md:p-6 hover:shadow-hover transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-sunshine to-sunshine text-warm-900 text-3xl mb-4">
                🌤️
              </div>
              <p className="text-warm-600 text-sm font-semibold mb-1">Weather Tracked</p>
              <p className="text-4xl font-bold text-warm-900 mb-1">0</p>
              <p className="text-warm-500 text-xs">No data yet</p>
            </div>
          )}
        </div>

        {/* Weekly Activity Chart */}
        <div className="mb-8">
          <WeeklyActivityChart data={stats.weeklyActivity} />
        </div>

        {/* Detailed Weather Patterns */}
        {stats.weatherPatterns.length > 0 && (
          <div className="bg-white rounded-card shadow-card border border-warm-200 p-6">
            <h2 className="text-xl font-bold text-warm-900 mb-6">Weather Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {stats.weatherPatterns.map((weather) => (
                <div
                  key={weather.condition}
                  className="bg-sunshine/20 border border-sunshine rounded-card p-4 text-center"
                >
                  <p className="text-warm-900 font-semibold text-lg mb-1">
                    {weather.condition}
                  </p>
                  <p className="text-warm-700 text-sm mb-1">
                    {weather.count} {weather.count === 1 ? 'activity' : 'activities'}
                  </p>
                  <p className="text-warm-600 text-xs">
                    {weather.percentage}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
