'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white rounded-card shadow-card border border-warm-200 p-2 mb-6">
      <div className="flex gap-2">
        <Link href="/" className="flex-1">
          <button
            className={`w-full px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              isActive('/')
                ? 'bg-sage text-white shadow-soft'
                : 'bg-transparent text-warm-700 hover:bg-warm-100'
            }`}
          >
            🏠 Feed
          </button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <button
            className={`w-full px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-sage text-white shadow-soft'
                : 'bg-transparent text-warm-700 hover:bg-warm-100'
            }`}
          >
            📊 Dashboard
          </button>
        </Link>
      </div>
    </nav>
  );
}
