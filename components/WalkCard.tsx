'use client';

import React from 'react';
import { Walk } from '@/types/walk';
import Link from 'next/link';

interface WalkCardProps {
  walk: Walk;
}

export default function WalkCard({ walk }: WalkCardProps) {
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
    <Link href={`/walks/${walk.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{walk.title}</h3>
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">
            {formatDuration(walk.duration_minutes)}
          </span>
        </div>

        <div className="text-sm text-gray-500 mb-2">
          {formatDate(walk.walk_date)}
        </div>

        {walk.notes && (
          <p className="text-gray-700 text-sm line-clamp-2">{walk.notes}</p>
        )}
      </div>
    </Link>
  );
}
