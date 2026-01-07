'use client';

import React, { useState } from 'react';
import { CreateActivityInput, Activity } from '@/types/activity';
import Button from './Button';
import TagInput from './TagInput';
import PeopleTagInput from './PeopleTagInput';
import ImageUpload from './ImageUpload';
import { getImageUrl } from '@/lib/garage';

interface ActivityFormProps {
  initialData?: Activity;
  onSubmit: (data: CreateActivityInput) => void;
  onCancel: () => void;
  submitLabel?: string;
  peopleSuggestions?: string[];
  tagSuggestions?: string[];
}

export default function ActivityForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Activity',
  peopleSuggestions = [],
  tagSuggestions = [],
}: ActivityFormProps) {
  const [showFullEntry, setShowFullEntry] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<CreateActivityInput>({
    title: initialData?.title || '',
    notes: initialData?.notes || '',
    duration_minutes: initialData?.duration_minutes || 0,
    activity_date: initialData?.activity_date
      ? new Date(initialData.activity_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    // v0.3.0 optional fields
    distance_km: initialData?.distance_km || undefined,
    elevation_gain_m: initialData?.elevation_gain_m || undefined,
    people: initialData?.people || [],
    tags: initialData?.tags || [],
    weather_conditions: initialData?.weather_conditions || '',
    temperature_c: initialData?.temperature_c || undefined,
    // v0.4.0 optional fields
    image_key: initialData?.image_key || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalData = { ...formData };

      // Upload image if a new file was selected
      if (imageFile) {
        const formDataToUpload = new FormData();
        formDataToUpload.append('image', imageFile);

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formDataToUpload,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const result = await response.json();
        finalData.image_key = result.imageKey;
      }

      // Submit the activity with the image_key
      onSubmit(finalData);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newValue =
        name === 'duration_minutes' || name === 'elevation_gain_m' || name === 'temperature_c'
          ? parseInt(value) || undefined
          : name === 'distance_km'
          ? parseFloat(value) || undefined
          : value;

      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quick Entry / Full Entry Toggle */}
      <div className="flex justify-between items-center pb-2 border-b border-warm-200">
        <h3 className="text-lg font-medium text-warm-900">
          {showFullEntry ? 'Full Entry Mode' : 'Quick Entry Mode'}
        </h3>
        <button
          type="button"
          onClick={() => setShowFullEntry(!showFullEntry)}
          className="text-sm text-sage-dark hover:text-sage font-medium transition-colors"
        >
          {showFullEntry ? '← Switch to Quick Entry' : 'Add More Details →'}
        </button>
      </div>

      {/* QUICK ENTRY FIELDS (always visible) */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-warm-700 mb-1.5">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
          placeholder="Morning hike in the woods"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="activity_date" className="block text-sm font-semibold text-warm-700 mb-1.5">
            Date *
          </label>
          <input
            type="date"
            id="activity_date"
            name="activity_date"
            value={formData.activity_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="duration_minutes" className="block text-sm font-semibold text-warm-700 mb-1.5">
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
            className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-warm-700 mb-1.5">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
          placeholder="Add notes about your activity..."
        />
      </div>

      {/* Image Upload (v0.4.0) */}
      <ImageUpload
        onImageSelect={setImageFile}
        currentImageUrl={initialData?.image_key ? getImageUrl(initialData.image_key) : null}
        disabled={isUploading}
      />

      {/* FULL ENTRY FIELDS (shown when expanded) */}
      {showFullEntry && (
        <div className="space-y-4 pt-4 border-t border-warm-200">
          <h4 className="font-medium text-warm-900">Additional Details</h4>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="distance_km" className="block text-sm font-semibold text-warm-700 mb-1.5">
                Distance (km)
              </label>
              <input
                type="number"
                id="distance_km"
                name="distance_km"
                value={formData.distance_km || ''}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
                placeholder="5.2"
              />
            </div>

            <div>
              <label htmlFor="elevation_gain_m" className="block text-sm font-semibold text-warm-700 mb-1.5">
                Elevation Gain (m)
              </label>
              <input
                type="number"
                id="elevation_gain_m"
                name="elevation_gain_m"
                value={formData.elevation_gain_m || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
                placeholder="250"
              />
            </div>
          </div>

          {/* People Tags */}
          <PeopleTagInput
            people={formData.people || []}
            onChange={(people) => setFormData((prev) => ({ ...prev, people }))}
            suggestions={peopleSuggestions}
          />

          {/* General Tags */}
          <TagInput
            tags={formData.tags || []}
            onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
            suggestions={tagSuggestions}
          />

          {/* Weather */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="weather_conditions" className="block text-sm font-semibold text-warm-700 mb-1.5">
                Weather
              </label>
              <select
                id="weather_conditions"
                name="weather_conditions"
                value={formData.weather_conditions}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
              >
                <option value="">Select...</option>
                <option value="Sunny">Sunny</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
                <option value="Snowy">Snowy</option>
                <option value="Windy">Windy</option>
                <option value="Foggy">Foggy</option>
              </select>
            </div>

            <div>
              <label htmlFor="temperature_c" className="block text-sm font-semibold text-warm-700 mb-1.5">
                Temperature (°C)
              </label>
              <input
                type="number"
                id="temperature_c"
                name="temperature_c"
                value={formData.temperature_c || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-200"
                placeholder="18"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary" className="flex-1" disabled={isUploading}>
          {isUploading ? 'Uploading...' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
