'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useWalks } from '@/contexts/WalksContext';
import Button from '@/components/Button';
import Link from 'next/link';

export default function WalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getWalk, deleteWalk } = useWalks();

  const walk = getWalk(id);

  if (!walk) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Walk Not Found</h1>
          <Link href="/">
            <Button variant="primary">Back to Feed</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this walk?')) {
      deleteWalk(id);
      router.push('/');
    }
  };

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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost">← Back to Feed</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{walk.title}</h1>
            <p className="text-gray-600">{formatDate(walk.walk_date)}</p>
          </div>

          <div className="mb-6">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium">
              Duration: {formatDuration(walk.duration_minutes)}
            </div>
          </div>

          {walk.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{walk.notes}</p>
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <div className="flex gap-2">
              <Link href={`/walks/${walk.id}/edit`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  Edit Walk
                </Button>
              </Link>
              <Button variant="danger" onClick={handleDelete} className="flex-1">
                Delete Walk
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Created: {new Date(walk.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(walk.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
