'use client';

import React, { useState, useCallback } from 'react';
import { useActivities } from '@/contexts/ActivitiesContext';
import ActivityCard from '@/components/ActivityCard';
import ActivityCardSkeleton from '@/components/ActivityCardSkeleton';
import Link from 'next/link';
import Button from '@/components/Button';

export default function Home() {
  const { activities, loading, error, refreshActivities } = useActivities();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshActivities();
    setIsRefreshing(false);
  }, [refreshActivities]);

  // Error State
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Activities</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Make sure your PostgreSQL database is set up correctly and environment variables are configured.
          </p>
          <Button onClick={handleRefresh} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Little Roamers</h1>
          <p className="text-gray-600 text-lg">Growing Up Outdoors</p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Link href="/activities/new" className="flex-shrink-0">
            <Button variant="primary" className="w-full sm:w-auto">
              + Log Activity
            </Button>
          </Link>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Loading State - Show Skeletons */}
        {loading && activities.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ActivityCardSkeleton key={i} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm p-12 md:p-16 text-center border border-gray-100">
            <div className="text-7xl mb-6">🌲</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Activities Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start logging your outdoor adventures and watch your memories grow. Every moment outside counts!
            </p>
            <Link href="/activities/new">
              <Button variant="primary" className="text-lg px-8 py-3">
                Log Your First Activity
              </Button>
            </Link>
          </div>
        ) : (
          /* Activities Feed - Responsive Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {activities.length > 0 && (
          <div className="mt-12 text-center text-sm text-gray-500">
            {activities.length} {activities.length === 1 ? 'activity' : 'activities'} logged
          </div>
        )}
      </div>
    </main>
  );
}
