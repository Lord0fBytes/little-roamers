'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActivities } from '@/contexts/ActivitiesContext';
import { Activity } from '@/types/activity';
import Button from '@/components/Button';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/garage';

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getActivity, deleteActivity } = useActivities();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const fetchedActivity = await getActivity(id);
      setActivity(fetchedActivity);
      setLoading(false);
    };
    fetchActivity();
  }, [id, getActivity]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this activity?')) {
      const success = await deleteActivity(id);
      if (success) {
        router.push('/');
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Activity Not Found</h1>
          <Link href="/">
            <Button variant="primary">Back to Feed</Button>
          </Link>
        </div>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost">← Back to Feed</Button>
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">{activity.title}</h1>
            <p className="text-gray-400">{formatDate(activity.activity_date)}</p>
          </div>

          {/* Activity Image (v0.4.0) */}
          {activity.image_key && (
            <div className="mb-6 relative w-full aspect-video bg-gray-700 rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(activity.image_key) || ''}
                alt={activity.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* Activity Metrics */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="inline-block bg-emerald-900/50 text-emerald-300 px-4 py-2 rounded-lg font-medium">
              ⏱️ {formatDuration(activity.duration_minutes)}
            </div>
            {activity.distance_km && (
              <div className="inline-block bg-blue-900/50 text-blue-300 px-4 py-2 rounded-lg font-medium">
                📏 {activity.distance_km} km
              </div>
            )}
            {activity.elevation_gain_m && (
              <div className="inline-block bg-purple-900/50 text-purple-300 px-4 py-2 rounded-lg font-medium">
                ⛰️ {activity.elevation_gain_m} m elevation
              </div>
            )}
          </div>

          {/* Weather Info */}
          {(activity.weather_conditions || activity.temperature_c) && (
            <div className="mb-6 flex flex-wrap gap-3">
              {activity.weather_conditions && (
                <div className="inline-block bg-yellow-900/50 text-yellow-300 px-4 py-2 rounded-lg font-medium">
                  {activity.weather_conditions}
                </div>
              )}
              {activity.temperature_c !== null && activity.temperature_c !== undefined && (
                <div className="inline-block bg-orange-900/50 text-orange-300 px-4 py-2 rounded-lg font-medium">
                  🌡️ {activity.temperature_c}°C
                </div>
              )}
            </div>
          )}

          {/* People Tags */}
          {activity.people && activity.people.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-2">People</h2>
              <div className="flex flex-wrap gap-2">
                {activity.people.map((person) => (
                  <span
                    key={person}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/30 text-blue-300"
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* General Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-900/30 text-emerald-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {activity.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-2">Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{activity.notes}</p>
            </div>
          )}

          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex gap-2">
              <Link href={`/activities/${activity.id}/edit`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  Edit Activity
                </Button>
              </Link>
              <Button variant="danger" onClick={handleDelete} className="flex-1">
                Delete Activity
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Created: {new Date(activity.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(activity.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
