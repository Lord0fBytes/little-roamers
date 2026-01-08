'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';

interface PeopleTagInputProps {
  people: string[];
  onChange: (people: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
}

export default function PeopleTagInput({
  people,
  onChange,
  suggestions = [],
  placeholder = 'Add @person...',
  label = 'People',
}: PeopleTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Ensure @ prefix on names
  const normalizePersonTag = (name: string): string => {
    const trimmed = name.trim();
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  };

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase().replace('@', '')) &&
      !people.includes(suggestion)
  );

  const addPerson = (name: string) => {
    const normalized = normalizePersonTag(name);
    if (normalized !== '@' && !people.includes(normalized)) {
      onChange([...people, normalized]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removePerson = (personToRemove: string) => {
    onChange(people.filter((person) => person !== personToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addPerson(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && people.length > 0) {
      // Remove last person if input is empty and backspace is pressed
      removePerson(people[people.length - 1]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Auto-add @ if user starts typing without it
    if (value.length === 1 && value !== '@') {
      value = '@' + value;
    }

    setInputValue(value);
    setShowSuggestions(value.length > 1); // Show suggestions after @
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-warm-700 mb-1.5">{label}</label>}

      {/* People chips display */}
      {people.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {people.map((person) => (
            <span
              key={person}
              className="bg-sky/20 text-sky-dark border border-sky/30 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1"
            >
              {person}
              <button
                type="button"
                onClick={() => removePerson(person)}
                className="hover:text-sky font-bold"
                aria-label={`Remove ${person}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 1)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="bg-warm-50 border-2 border-warm-200 text-warm-900 rounded-xl focus:ring-2 focus:ring-sky focus:border-sky placeholder:text-warm-400 transition-all duration-200 w-full px-4 py-2.5 focus:outline-none"
        />

        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-sky/30 rounded-xl shadow-card max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addPerson(suggestion)}
                className="w-full px-4 py-2 text-left text-warm-800 hover:bg-sky/10 focus:bg-sky/15 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-warm-500">
        Type names like &quot;@sarah&quot; or &quot;@kids&quot;. Press Enter to add, click × to remove
      </p>
    </div>
  );
}
