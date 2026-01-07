'use client';

import React from 'react';
import { Activity } from '@/types/activity';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/garage';
import { formatActivityDate } from '@/lib/dateUtils';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
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
      <div className="bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-300 border border-warm-200 hover-lift activity-card overflow-hidden cursor-pointer">
        {/* Activity Image (v0.4.0) */}
        {activity.image_key && (
          <div className="relative w-full aspect-video bg-warm-100">
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
              <h3 className="text-lg font-semibold text-warm-900 flex-1">{activity.title}</h3>
              <span className="bg-gradient-to-br from-sage-light to-sage text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-soft whitespace-nowrap">
                ⏱️ {formatDuration(activity.duration_minutes)}
              </span>
            </div>
            <div className="text-sm text-warm-600">
              {formatActivityDate(activity.activity_date)}
            </div>
          </div>

          {/* Metrics Badges */}
          {(activity.distance_km || activity.elevation_gain_m || activity.weather_conditions) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {activity.distance_km && (
                <span className="inline-flex items-center bg-sky/20 text-sky-dark border border-sky/30 px-2.5 py-1 rounded-full text-sm font-medium">
                  📏 {activity.distance_km} km
                </span>
              )}
              {activity.elevation_gain_m && (
                <span className="inline-flex items-center bg-clay/20 text-clay-dark border border-clay/30 px-2.5 py-1 rounded-full text-xs font-medium">
                  ⛰️ {activity.elevation_gain_m} m
                </span>
              )}
              {activity.weather_conditions && (
                <span className="inline-flex items-center bg-sunshine/30 text-warm-800 border border-sunshine/50 px-2.5 py-1 rounded-full text-xs font-medium">
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
                  className="inline-flex items-center bg-sky/20 text-sky-dark px-2.5 py-1 rounded-full text-xs font-medium border border-sky/30"
                >
                  {person}
                </span>
              ))}
              {activity.people.length > 3 && (
                <span className="inline-flex items-center bg-warm-200 text-warm-700 px-2.5 py-1 rounded-full text-xs font-medium">
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
                  className="inline-flex items-center bg-sage/20 text-sage-dark px-2.5 py-1 rounded-full text-xs font-medium border border-sage/30"
                >
                  {tag}
                </span>
              ))}
              {activity.tags.length > 3 && (
                <span className="inline-flex items-center bg-warm-200 text-warm-700 px-2.5 py-1 rounded-full text-xs font-medium">
                  +{activity.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          {activity.notes && (
            <p className="text-warm-400 text-sm line-clamp-2 leading-relaxed">{activity.notes}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
