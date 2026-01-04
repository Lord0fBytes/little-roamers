'use client';

import React, { useState } from 'react';
import { CreateWalkInput, Walk } from '@/types/walk';
import Button from './Button';

interface WalkFormProps {
  initialData?: Walk;
  onSubmit: (data: CreateWalkInput) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function WalkForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Walk',
}: WalkFormProps) {
  const [formData, setFormData] = useState<CreateWalkInput>({
    title: initialData?.title || '',
    notes: initialData?.notes || '',
    duration_minutes: initialData?.duration_minutes || 0,
    walk_date: initialData?.walk_date
      ? new Date(initialData.walk_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Morning walk in the park"
        />
      </div>

      <div>
        <label htmlFor="walk_date" className="block text-sm font-medium text-gray-700 mb-1">
          Date *
        </label>
        <input
          type="date"
          id="walk_date"
          name="walk_date"
          value={formData.walk_date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (minutes) *
        </label>
        <input
          type="number"
          id="duration_minutes"
          name="duration_minutes"
          value={formData.duration_minutes || ''}
          onChange={handleChange}
          required
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="30"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Add notes about your walk..."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
