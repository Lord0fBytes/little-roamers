'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Walk, CreateWalkInput, UpdateWalkInput } from '@/types/walk';

interface WalksContextType {
  walks: Walk[];
  loading: boolean;
  error: string | null;
  getWalk: (id: string) => Promise<Walk | null>;
  createWalk: (input: CreateWalkInput) => Promise<Walk | null>;
  updateWalk: (id: string, input: UpdateWalkInput) => Promise<Walk | null>;
  deleteWalk: (id: string) => Promise<boolean>;
  refreshWalks: () => Promise<void>;
}

const WalksContext = createContext<WalksContextType | undefined>(undefined);

export function WalksProvider({ children }: { children: ReactNode }) {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load walks on mount
  useEffect(() => {
    refreshWalks();
  }, []);

  const refreshWalks = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walks');
      if (!response.ok) {
        throw new Error(`Failed to fetch walks: ${response.statusText}`);
      }

      const data = await response.json();
      setWalks(data.walks || []);
    } catch (err) {
      console.error('Error fetching walks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch walks');
      setWalks([]);
    } finally {
      setLoading(false);
    }
  };

  const getWalk = async (id: string): Promise<Walk | null> => {
    // First try to find in cached walks
    const cachedWalk = walks.find(walk => walk.id === id);
    if (cachedWalk) {
      return cachedWalk;
    }

    // If not in cache, fetch from API
    try {
      const response = await fetch(`/api/walks/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch walk: ${response.statusText}`);
      }

      const data = await response.json();
      return data.walk;
    } catch (err) {
      console.error('Error fetching walk:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch walk');
      return null;
    }
  };

  const createWalk = async (input: CreateWalkInput): Promise<Walk | null> => {
    setError(null);

    try {
      const response = await fetch('/api/walks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create walk: ${response.statusText}`);
      }

      const data = await response.json();
      const newWalk = data.walk;

      // Add to local state (prepend to list)
      setWalks(prevWalks => [newWalk, ...prevWalks]);

      return newWalk;
    } catch (err) {
      console.error('Error creating walk:', err);
      setError(err instanceof Error ? err.message : 'Failed to create walk');
      return null;
    }
  };

  const updateWalk = async (id: string, input: UpdateWalkInput): Promise<Walk | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/walks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update walk: ${response.statusText}`);
      }

      const data = await response.json();
      const updatedWalk = data.walk;

      // Update local state
      setWalks(prevWalks =>
        prevWalks.map(walk => (walk.id === id ? updatedWalk : walk))
      );

      return updatedWalk;
    } catch (err) {
      console.error('Error updating walk:', err);
      setError(err instanceof Error ? err.message : 'Failed to update walk');
      return null;
    }
  };

  const deleteWalk = async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/walks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete walk: ${response.statusText}`);
      }

      // Remove from local state
      setWalks(prevWalks => prevWalks.filter(walk => walk.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting walk:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete walk');
      return false;
    }
  };

  return (
    <WalksContext.Provider
      value={{
        walks,
        loading,
        error,
        getWalk,
        createWalk,
        updateWalk,
        deleteWalk,
        refreshWalks,
      }}
    >
      {children}
    </WalksContext.Provider>
  );
}

export function useWalks() {
  const context = useContext(WalksContext);
  if (context === undefined) {
    throw new Error('useWalks must be used within a WalksProvider');
  }
  return context;
}
