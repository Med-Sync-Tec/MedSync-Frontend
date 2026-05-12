import React from 'react';
import {
  Brain,
  ClipboardList,
  MessageSquareText,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

interface SOAPSectionProps {
  letter: 'S' | 'O' | 'A' | 'P';
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

interface SectionStyle {
  accent: string;
  accentBar: string;
  chipBg: string;
  chipText: string;
  icon: LucideIcon;
}

const config: Record<SOAPSectionProps['letter'], SectionStyle> = {
  S: {
    accent: 'text-indigo-600 dark:text-indigo-400',
    accentBar: 'bg-indigo-500/70 dark:bg-indigo-400/60',
    chipBg: 'bg-indigo-500/10 dark:bg-indigo-400/15',
    chipText: 'text-indigo-700 dark:text-indigo-300',
    icon: MessageSquareText,
  },
  O: {
    accent: 'text-sky-600 dark:text-sky-400',
    accentBar: 'bg-sky-500/70 dark:bg-sky-400/60',
    chipBg: 'bg-sky-500/10 dark:bg-sky-400/15',
    chipText: 'text-sky-700 dark:text-sky-300',
    icon: Stethoscope,
  },
  A: {
    accent: 'text-violet-600 dark:text-violet-400',
    accentBar: 'bg-violet-500/70 dark:bg-violet-400/60',
    chipBg: 'bg-violet-500/10 dark:bg-violet-400/15',
    chipText: 'text-violet-700 dark:text-violet-300',
    icon: Brain,
  },
  P: {
    accent: 'text-emerald-600 dark:text-emerald-400',
    accentBar: 'bg-emerald-500/70 dark:bg-emerald-400/60',
    chipBg: 'bg-emerald-500/10 dark:bg-emerald-400/15',
    chipText: 'text-emerald-700 dark:text-emerald-300',
    icon: ClipboardList,
  },
};

export const SOAPSection: React.FC<SOAPSectionProps> = ({
  letter,
  title,
  subtitle,
  children,
  className = '',
  headerAction,
}) => {
  const styles = config[letter];
  const Icon = styles.icon;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-card ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${styles.accentBar}`}
      />

      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold tracking-tight ${styles.chipBg} ${styles.chipText}`}
          >
            {letter}
          </span>
          <div className="flex flex-col leading-tight min-w-0">
            <h3 className={`text-sm font-semibold tracking-tight ${styles.accent}`}>{title}</h3>
            {subtitle && (
              <span className="text-[11px] text-text-subtle truncate">{subtitle}</span>
            )}
          </div>
          <Icon
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            className={`ml-1 ${styles.accent} opacity-60`}
          />
        </div>
        {headerAction}
      </header>

      <div className="px-5 py-4">{children}</div>
    </div>
  );
};
