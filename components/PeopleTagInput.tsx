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
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}

      {/* People chips display */}
      {people.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {people.map((person) => (
            <span
              key={person}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-900/30 text-blue-300"
            >
              {person}
              <button
                type="button"
                onClick={() => removePerson(person)}
                className="hover:text-blue-200 font-bold"
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
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
        />

        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addPerson(suggestion)}
                className="w-full px-4 py-2 text-left text-gray-100 hover:bg-gray-600 focus:bg-gray-600 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400">
        Type names like &quot;@sarah&quot; or &quot;@kids&quot;. Press Enter to add, click × to remove
      </p>
    </div>
  );
}
