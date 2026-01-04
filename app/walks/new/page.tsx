'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWalks } from '@/contexts/WalksContext';
import WalkForm from '@/components/WalkForm';
import { CreateWalkInput } from '@/types/walk';

export default function NewWalkPage() {
  const router = useRouter();
  const { createWalk } = useWalks();

  const handleSubmit = async (data: CreateWalkInput) => {
    const result = await createWalk(data);
    if (result) {
      router.push('/');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Log a Walk</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <WalkForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Walk"
          />
        </div>
      </div>
    </main>
  );
}
