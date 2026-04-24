import React from 'react';
import { CounterBadge } from '../badges/CounterBadge';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'info' | 'warning' | 'success';
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  badge,
  badgeVariant = 'info',
  iconBg,
  iconColor,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-3 shadow-sm flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg ?? 'var(--color-info-subtle)', color: iconColor ?? 'var(--color-primary)' }}
        >
          {icon}
        </div>
        {badge && <CounterBadge text={badge} variant={badgeVariant} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
};
