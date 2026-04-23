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
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex flex-col gap-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg ?? '#EFF6FF', color: iconColor ?? '#4f46e5' }}
        >
          {icon}
        </div>
        {badge && <CounterBadge text={badge} variant={badgeVariant} />}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
};
