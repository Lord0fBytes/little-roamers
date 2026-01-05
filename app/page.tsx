'use client';

import React from 'react';
import { useActivities } from '@/contexts/ActivitiesContext';
import ActivityCard from '@/components/ActivityCard';
import Link from 'next/link';
import Button from '@/components/Button';

export default function Home() {
  const { activities, loading, error } = useActivities();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Activities</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure your Supabase database is set up correctly and environment variables are configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Little Roamers</h1>
          <p className="text-gray-600">Growing Up Outdoors</p>
        </div>

        {/* Add Activity Button */}
        <div className="mb-6">
          <Link href="/activities/new">
            <Button variant="primary" className="w-full md:w-auto">
              + Log Activity
            </Button>
          </Link>
        </div>

        {/* Activities Feed */}
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">No activities yet - start logging!</p>
            <Link href="/activities/new">
              <Button variant="primary">Log Your First Activity</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
