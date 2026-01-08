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

  const getWeatherEmoji = (weatherConditions?: string): string => {
    if (!weatherConditions) return '🌤️';

    const weather = weatherConditions.toLowerCase();

    if (weather.includes('sunny') || weather.includes('clear')) return '☀️';
    if (weather.includes('cloudy') || weather.includes('overcast')) return '☁️';
    if (weather.includes('partly')) return '⛅';
    if (weather.includes('rain')) return '🌧️';
    if (weather.includes('snow')) return '❄️';
    if (weather.includes('storm') || weather.includes('thunder')) return '⛈️';
    if (weather.includes('wind')) return '💨';
    if (weather.includes('fog')) return '🌫️';

    return '🌤️';
  };

  return (
    <Link href={`/activities/${activity.id}`}>
      <div className="bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-300 border border-warm-200 hover-lift activity-card overflow-hidden cursor-pointer">
        {/* Activity Image - unchanged */}
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
          {/* Header: Title and Badges */}
          <div className="flex justify-between items-start gap-3 mb-3">
            <h3 className="text-lg font-semibold text-warm-900 flex-1">{activity.title}</h3>
            <div className="flex gap-2 flex-shrink-0">
              <span className="bg-gradient-to-br from-sage-light to-sage text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-soft whitespace-nowrap">
                {formatDuration(activity.duration_minutes)}
              </span>
              {activity.distance_km && (
                <span className="bg-sky-dark text-white border border-sky-dark px-3 py-1.5 rounded-full text-sm font-semibold shadow-soft whitespace-nowrap">
                  {activity.distance_km} km
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {activity.notes && (
            <p className="text-warm-400 text-sm line-clamp-4 leading-relaxed mb-3">{activity.notes}</p>
          )}

          {/* Weather and Temperature */}
          {(activity.weather_conditions || activity.temperature_c !== null && activity.temperature_c !== undefined) && (
            <div className="text-sm text-warm-600 mb-4">
              {activity.weather_conditions && getWeatherEmoji(activity.weather_conditions)}
              {activity.weather_conditions && (activity.temperature_c !== null && activity.temperature_c !== undefined) && ' '}
              {activity.temperature_c !== null && activity.temperature_c !== undefined && `${activity.temperature_c}°C`}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-warm-900 my-4"></div>

          {/* Footer: Tags and Date */}
          <div className="flex justify-between items-center gap-3">
            {/* Tags */}
            {activity.tags && activity.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
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
            ) : (
              <div></div>
            )}

            {/* Date */}
            <div className="text-base text-warm-500 font-bold whitespace-nowrap">
              {formatActivityDate(activity.activity_date)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
