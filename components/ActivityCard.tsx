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
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
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
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">
              {formatDuration(activity.duration_minutes)}
            </span>
          </div>

          <div className="text-sm text-gray-500 mb-2">
            {formatDate(activity.activity_date)}
          </div>

          {activity.notes && (
            <p className="text-gray-700 text-sm line-clamp-2">{activity.notes}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
