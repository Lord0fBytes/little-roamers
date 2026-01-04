'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useWalks } from '@/contexts/WalksContext';
import WalkForm from '@/components/WalkForm';
import { CreateWalkInput } from '@/types/walk';
import Button from '@/components/Button';
import Link from 'next/link';

export default function EditWalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getWalk, updateWalk } = useWalks();

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

  const handleSubmit = (data: CreateWalkInput) => {
    updateWalk(id, data);
    router.push(`/walks/${id}`);
  };

  const handleCancel = () => {
    router.push(`/walks/${id}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Walk</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <WalkForm
            initialData={walk}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Update Walk"
          />
        </div>
      </div>
    </main>
  );
}
