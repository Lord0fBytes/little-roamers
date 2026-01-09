'use client';

import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
}: SearchBarProps) {
  return (
    <div className="bg-white rounded-card shadow-card border border-warm-200 p-4">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search activities, people, tags, or notes..."
          className="flex-1 px-4 py-3 bg-white border border-warm-300 rounded-xl text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage transition-colors"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="px-4 py-3 text-sm text-warm-600 hover:text-warm-800 font-medium transition-colors whitespace-nowrap"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search hint */}
      {searchQuery && (
        <p className="mt-3 text-xs text-warm-500">
          Searching across titles, notes, people, and tags
        </p>
      )}
    </div>
  );
}
