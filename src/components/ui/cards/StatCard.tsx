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
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-5 px-4 sm:px-5 min-h-[100px] shadow-sm flex items-center gap-4 ${className}`}>
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: iconBg ?? 'var(--color-info-subtle)', color: iconColor ?? 'var(--color-primary)' }}
      >
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: `${(icon as React.ReactElement<any>).props.className || ''} !text-2xl sm:!text-3xl` }) : icon}
      </div>
      
      <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300 leading-tight" title={label}>
            {label}
          </p>
          {badge && (
            <div className="self-start mt-0.5">
              <CounterBadge text={badge} variant={badgeVariant} />
            </div>
          )}
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-none shrink-0">
          {value}
        </p>
      </div>
    </div>
  );
};
