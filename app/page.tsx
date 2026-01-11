'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActivities } from '@/contexts/ActivitiesContext';
import ActivityCard from '@/components/ActivityCard';
import ActivityCardSkeleton from '@/components/ActivityCardSkeleton';
import SearchBar from '@/components/FilterBar';
import Link from 'next/link';
import Button from '@/components/Button';

function HomeContent() {
  const {
    activities,
    filteredActivities,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    clearSearch,
    refreshActivities,
  } = useActivities();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoursThisYear, setHoursThisYear] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // v0.7.0 Fetch hours this year for header display
  useEffect(() => {
    const fetchHoursThisYear = async () => {
      try {
        const response = await fetch('/api/activities/stats');
        if (response.ok) {
          const data = await response.json();
          setHoursThisYear(data.stats.hoursThisYear);
        }
      } catch (err) {
        console.error('Error fetching hours this year:', err);
      }
    };

    fetchHoursThisYear();
  }, [activities]); // Re-fetch when activities change

  // v0.6.0 Read search from URL on mount and when URL changes
  useEffect(() => {
    const searchParam = searchParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [searchParams, setSearchQuery]); // Re-run when URL search params change

  // v0.6.0 Update URL when search changes
  useEffect(() => {
    const newUrl = searchQuery ? `/?search=${encodeURIComponent(searchQuery)}` : '/';

    // Only update URL if it's different (avoid unnecessary navigation)
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, router]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshActivities();
    setIsRefreshing(false);
  }, [refreshActivities]);

  // Error State
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Activities</h1>
          <p className="text-warm-600 mb-4">{error}</p>
          <p className="text-sm text-warm-500 mb-6">
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
    <main className="min-h-screen bg-warm-50 page-enter">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-cream via-warm-50 to-sand py-12 mb-8 -mx-4 px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-warm-900 mb-2">Little Roamers</h1>
              <p className="text-warm-600 text-lg">Growing Up Outdoors</p>
              {hoursThisYear !== null && hoursThisYear > 0 && (
                <p className="text-sage-dark font-semibold text-lg mt-2">
                  🌳 {hoursThisYear} hours outside this year
                </p>
              )}
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" className="flex items-center gap-2">
                📊 Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* SearchBar with Add Button - v0.6.0 */}
        {activities.length > 0 && (
          <div className="flex gap-3 mb-6 items-stretch">
            <div className="flex-1">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={clearSearch}
              />
            </div>
            <Link href="/activities/new" className="flex-shrink-0 flex">
              <button className="bg-clay hover:bg-clay-dark text-white rounded-card shadow-card border border-warm-200 px-6 font-bold text-2xl transition-colors flex items-center justify-center aspect-square">
                +
              </button>
            </Link>
          </div>
        )}

        {/* Loading State - Show Skeletons */}
        {loading && activities.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ActivityCardSkeleton key={i} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          /* Empty State - No Activities */
          <div className="bg-white rounded-card shadow-card p-12 md:p-16 text-center border border-warm-200">
            <div className="text-7xl mb-6">🌲</div>
            <h2 className="text-2xl font-bold text-warm-900 mb-3">No Activities Yet</h2>
            <p className="text-warm-600 mb-8 max-w-md mx-auto">
              Start logging your outdoor adventures and watch your memories grow. Every moment outside counts!
            </p>
            <Link href="/activities/new">
              <Button variant="primary" className="text-lg px-8 py-3">
                Log Your First Activity
              </Button>
            </Link>
          </div>
        ) : filteredActivities.length === 0 ? (
          /* Empty State - No Matches for Search */
          <div className="bg-white rounded-card shadow-card p-12 md:p-16 text-center border border-warm-200">
            <div className="text-7xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-warm-900 mb-3">No Activities Found</h2>
            <p className="text-warm-600 mb-8 max-w-md mx-auto">
              No activities match your search for &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try a different search term or clear the search to see all activities.
            </p>
            <Button onClick={clearSearch} variant="secondary" className="text-lg px-8 py-3">
              Clear Search
            </Button>
          </div>
        ) : (
          /* Activities Feed - Responsive Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {activities.length > 0 && (
          <div className="mt-12 text-center text-sm text-warm-500">
            Showing {filteredActivities.length} of {activities.length}{' '}
            {activities.length === 1 ? 'activity' : 'activities'}
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <p className="text-warm-600">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
