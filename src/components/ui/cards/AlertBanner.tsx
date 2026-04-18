import React from 'react';

type AlertBannerType = 'info' | 'warning' | 'tip';

interface AlertBannerProps {
  type?: AlertBannerType;
  message: string;
  className?: string;
}

const typeConfig: Record<AlertBannerType, { icon: string; styles: string }> = {
  info: {
    icon: 'info',
    styles: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  },
  warning: {
    icon: 'warning',
    styles: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  },
  tip: {
    icon: 'lightbulb',
    styles: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  message,
  className = '',
}) => {
  const { icon, styles } = typeConfig[type];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${styles} ${className}`}>
      <span className="material-symbols-outlined text-xl shrink-0">{icon}</span>
      <p>{message}</p>
    </div>
  );
};
