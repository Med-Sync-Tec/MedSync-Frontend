import React from 'react';

interface SOAPSectionProps {
  letter: 'S' | 'O' | 'A' | 'P';
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

const config = {
  S: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', darkBg: 'dark:bg-indigo-900/10', darkBorder: 'dark:border-indigo-800/30' },
  O: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', darkBg: 'dark:bg-blue-900/10', darkBorder: 'dark:border-blue-800/30' },
  A: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', darkBg: 'dark:bg-purple-900/10', darkBorder: 'dark:border-purple-800/30' },
  P: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', darkBg: 'dark:bg-emerald-900/10', darkBorder: 'dark:border-emerald-800/30' },
};

export const SOAPSection: React.FC<SOAPSectionProps> = ({
  letter,
  title,
  subtitle,
  children,
  className = '',
  headerAction
}) => {
  const styles = config[letter];

  return (
    <div className={`bg-white dark:bg-[#1e293b] rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${styles.bg} ${styles.darkBg} flex items-center justify-center font-bold ${styles.color} text-lg shadow-sm`}>
            {letter}
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium lowercase">
                ({subtitle})
              </span>
            )}
          </div>
        </div>
        {headerAction}
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
