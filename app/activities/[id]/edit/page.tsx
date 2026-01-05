'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActivities } from '@/contexts/ActivitiesContext';
import ActivityForm from '@/components/ActivityForm';
import { CreateActivityInput, Activity } from '@/types/activity';
import Button from '@/components/Button';
import Link from 'next/link';

export default function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getActivity, updateActivity } = useActivities();
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

  const handleSubmit = async (data: CreateActivityInput) => {
    const result = await updateActivity(id, data);
    if (result) {
      router.push(`/activities/${id}`);
    }
  };

  const handleCancel = () => {
    router.push(`/activities/${id}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Activity Not Found</h1>
          <Link href="/">
            <Button variant="primary">Back to Feed</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Activity</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ActivityForm
            initialData={activity}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Update Activity"
          />
        </div>
      </div>
    </main>
  );
}
