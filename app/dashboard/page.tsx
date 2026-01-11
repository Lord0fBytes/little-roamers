'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
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
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost">← Back to Feed</Button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-warm-900 mb-2">Dashboard</h1>
          <p className="text-warm-600 text-lg">
            Growing up outdoors: <span className="font-bold text-sage-dark">{stats.hoursThisYear} hours</span> this year
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Weekly Activity Chart */}
        <div className="mb-8">
          <WeeklyActivityChart data={stats.weeklyActivity} />
        </div>

        {/* Weather Patterns */}
        {stats.weatherPatterns.length > 0 && (
          <div className="bg-white rounded-card shadow-card border border-warm-200 p-6">
            <h2 className="text-xl font-bold text-warm-900 mb-6">Weather Patterns</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

        {/* Empty State for Weather */}
        {stats.weatherPatterns.length === 0 && (
          <div className="bg-white rounded-card shadow-card border border-warm-200 p-8 text-center">
            <div className="text-5xl mb-4">🌤️</div>
            <p className="text-warm-600">
              No weather data yet. Add weather conditions to your activities to see patterns here!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
