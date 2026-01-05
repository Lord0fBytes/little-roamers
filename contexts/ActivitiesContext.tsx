'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Activity, CreateActivityInput, UpdateActivityInput, AutocompleteData } from '@/types/activity';

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  // v0.3.0 autocomplete data
  peopleSuggestions: string[];
  tagSuggestions: string[];
  // Methods
  getActivity: (id: string) => Promise<Activity | null>;
  createActivity: (input: CreateActivityInput) => Promise<Activity | null>;
  updateActivity: (id: string, input: UpdateActivityInput) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
  refreshActivities: () => Promise<void>;
  refreshAutocomplete: () => Promise<void>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [peopleSuggestions, setPeopleSuggestions] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  // Load activities and autocomplete data on mount
  useEffect(() => {
    refreshActivities();
    refreshAutocomplete();
  }, []);

  const refreshActivities = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/activities');
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAutocomplete = async (): Promise<void> => {
    try {
      const response = await fetch('/api/activities/autocomplete');
      if (!response.ok) {
        console.warn('Failed to fetch autocomplete data');
        return;
      }

      const data: AutocompleteData = await response.json();
      setPeopleSuggestions(data.people || []);
      setTagSuggestions(data.tags || []);
    } catch (err) {
      console.error('Error fetching autocomplete data:', err);
      // Don't set error state for autocomplete failures (non-critical)
    }
  };

  const getActivity = async (id: string): Promise<Activity | null> => {
    // First try to find in cached activities
    const cachedActivity = activities.find(activity => activity.id === id);
    if (cachedActivity) {
      return cachedActivity;
    }

    // If not in cache, fetch from API
    try {
      const response = await fetch(`/api/activities/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch activity: ${response.statusText}`);
      }

      const data = await response.json();
      return data.activity;
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
      return null;
    }
  };

  const createActivity = async (input: CreateActivityInput): Promise<Activity | null> => {
    setError(null);

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create activity: ${response.statusText}`);
      }

      const data = await response.json();
      const newActivity = data.activity;

      // Add to local state (prepend to list)
      setActivities(prevActivities => [newActivity, ...prevActivities]);

      return newActivity;
    } catch (err) {
      console.error('Error creating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      return null;
    }
  };

  const updateActivity = async (id: string, input: UpdateActivityInput): Promise<Activity | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update activity: ${response.statusText}`);
      }

      const data = await response.json();
      const updatedActivity = data.activity;

      // Update local state
      setActivities(prevActivities =>
        prevActivities.map(activity => (activity.id === id ? updatedActivity : activity))
      );

      return updatedActivity;
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      return null;
    }
  };

  const deleteActivity = async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete activity: ${response.statusText}`);
      }

      // Remove from local state
      setActivities(prevActivities => prevActivities.filter(activity => activity.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      return false;
    }
  };

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        loading,
        error,
        peopleSuggestions,
        tagSuggestions,
        getActivity,
        createActivity,
        updateActivity,
        deleteActivity,
        refreshActivities,
        refreshAutocomplete,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
}
