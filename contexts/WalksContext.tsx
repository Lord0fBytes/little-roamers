'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Walk, CreateWalkInput, UpdateWalkInput } from '@/types/walk';

interface WalksContextType {
  walks: Walk[];
  loading: boolean;
  getWalk: (id: string) => Walk | undefined;
  createWalk: (input: CreateWalkInput) => Walk;
  updateWalk: (id: string, input: UpdateWalkInput) => Walk | null;
  deleteWalk: (id: string) => boolean;
}

const WalksContext = createContext<WalksContextType | undefined>(undefined);

export function WalksProvider({ children }: { children: ReactNode }) {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading] = useState(false);

  const getWalk = (id: string): Walk | undefined => {
    return walks.find(walk => walk.id === id);
  };

  const createWalk = (input: CreateWalkInput): Walk => {
    const now = new Date().toISOString();
    const newWalk: Walk = {
      id: crypto.randomUUID(),
      ...input,
      created_at: now,
      updated_at: now,
    };

    setWalks(prevWalks => [newWalk, ...prevWalks]);
    return newWalk;
  };

  const updateWalk = (id: string, input: UpdateWalkInput): Walk | null => {
    let updatedWalk: Walk | null = null;

    setWalks(prevWalks =>
      prevWalks.map(walk => {
        if (walk.id === id) {
          updatedWalk = {
            ...walk,
            ...input,
            updated_at: new Date().toISOString(),
          };
          return updatedWalk;
        }
        return walk;
      })
    );

    return updatedWalk;
  };

  const deleteWalk = (id: string): boolean => {
    let deleted = false;
    setWalks(prevWalks => {
      const filtered = prevWalks.filter(walk => walk.id !== id);
      deleted = filtered.length !== prevWalks.length;
      return filtered;
    });
    return deleted;
  };

  return (
    <WalksContext.Provider
      value={{
        walks,
        loading,
        getWalk,
        createWalk,
        updateWalk,
        deleteWalk,
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
