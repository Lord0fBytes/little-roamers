import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  colorClass?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  subtitle,
  colorClass = 'from-sage-light to-sage'
}: StatCardProps) {
  return (
    <div className="bg-white rounded-card shadow-card border border-warm-200 p-6 hover:shadow-hover transition-all duration-300">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} text-white text-3xl mb-4`}>
        {icon}
      </div>
      <p className="text-warm-600 text-sm font-semibold mb-1">{label}</p>
      <p className="text-4xl font-bold text-warm-900 mb-1">{value}</p>
      {subtitle && (
        <p className="text-warm-500 text-xs">{subtitle}</p>
      )}
    </div>
  );
}
