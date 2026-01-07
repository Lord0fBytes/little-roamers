'use client';

import React from 'react';
import { Activity } from '@/types/activity';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/garage';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Link href={`/activities/${activity.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-gray-100">
        {/* Activity Image (v0.4.0) */}
        {activity.image_key && (
          <div className="relative w-full aspect-video bg-gray-100">
            <Image
              src={getImageUrl(activity.image_key) || ''}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-4">
          {/* Header: Title and Duration */}
          <div className="mb-3">
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">{activity.title}</h3>
              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                ⏱️ {formatDuration(activity.duration_minutes)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(activity.activity_date)}
            </div>
          </div>

          {/* Metrics Badges */}
          {(activity.distance_km || activity.elevation_gain_m || activity.weather_conditions) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {activity.distance_km && (
                <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                  📏 {activity.distance_km} km
                </span>
              )}
              {activity.elevation_gain_m && (
                <span className="inline-flex items-center bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium">
                  ⛰️ {activity.elevation_gain_m} m
                </span>
              )}
              {activity.weather_conditions && (
                <span className="inline-flex items-center bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
                  {activity.weather_conditions}
                </span>
              )}
            </div>
          )}

          {/* People Tags */}
          {activity.people && activity.people.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {activity.people.slice(0, 3).map((person) => (
                <span
                  key={person}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {person}
                </span>
              ))}
              {activity.people.length > 3 && (
                <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  +{activity.people.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {activity.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {activity.tags.length > 3 && (
                <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  +{activity.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          {activity.notes && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{activity.notes}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
