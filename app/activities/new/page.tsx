'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useActivities } from '@/contexts/ActivitiesContext';
import ActivityForm from '@/components/ActivityForm';
import { CreateActivityInput } from '@/types/activity';

export default function NewActivityPage() {
  const router = useRouter();
  const { createActivity, peopleSuggestions, tagSuggestions, refreshAutocomplete } = useActivities();

  const handleSubmit = async (data: CreateActivityInput) => {
    const result = await createActivity(data);
    if (result) {
      // Refresh autocomplete data when a new activity is created
      await refreshAutocomplete();
      router.push('/');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Log an Activity</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ActivityForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Activity"
            peopleSuggestions={peopleSuggestions}
            tagSuggestions={tagSuggestions}
          />
        </div>
      </div>
    </main>
  );
}
