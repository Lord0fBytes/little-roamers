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
    <nav className="bg-white rounded-card shadow-card border border-warm-200 p-1.5 mb-6">
      <div className="flex gap-1.5">
        <Link href="/" className="flex-1">
          <button
            className={`w-full px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isActive('/')
                ? 'bg-sage text-white shadow-[0_4px_10px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-warm-700 opacity-70 hover:opacity-100 hover:bg-warm-50'
            }`}
          >
            🏠 Feed
          </button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <button
            className={`w-full px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-sage text-white shadow-[0_4px_10px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-warm-700 opacity-70 hover:opacity-100 hover:bg-warm-50'
            }`}
          >
            📊 Dashboard
          </button>
        </Link>
      </div>
    </nav>
  );
}
