'use client';

import React, { useState } from 'react';
import { Activity } from '@/types/activity';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/garage';
import { formatActivityDate } from '@/lib/dateUtils';
import ImageModal from './ImageModal';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter();
  const [showImageModal, setShowImageModal] = useState(false);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Handle tag click - navigate to search
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/?search=${encodeURIComponent(tag)}`);
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
    <>
      <Link href={`/activities/${activity.id}`}>
        <div className="bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-300 border border-warm-200 hover-lift activity-card overflow-hidden cursor-pointer">
          {/* Activity Image - v0.7.3 clickable for full-size view */}
          {activity.image_key && (
            <div
              className="relative w-full aspect-video bg-warm-100 group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowImageModal(true);
              }}
            >
              <Image
                src={getImageUrl(activity.image_key) || ''}
                alt={activity.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  🔍
                </span>
              </div>
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
                  <button
                    key={tag}
                    onClick={(e) => handleTagClick(e, tag)}
                    className="inline-flex items-center bg-sage/20 text-sage-dark px-2.5 py-1 rounded-full text-xs font-medium border border-sage/30 cursor-pointer hover:bg-sage/30 transition-colors"
                  >
                    {tag}
                  </button>
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

      {/* Image Modal - v0.7.3 */}
      {showImageModal && activity.image_key && (
        <ImageModal
          imageUrl={getImageUrl(activity.image_key) || ''}
          alt={activity.title}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}
