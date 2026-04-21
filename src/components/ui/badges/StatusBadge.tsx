import React from 'react';

type PatientStatus = 'estable' | 'critico' | 'en-observacion' | 'alta';

interface StatusBadgeProps {
  status: PatientStatus;
  className?: string;
}

const statusConfig: Record<PatientStatus, { label: string; styles: string }> = {
  estable: {
    label: 'Estable',
    styles: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  critico: {
    label: 'Crítico',
    styles: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  'en-observacion': {
    label: 'En Observación',
    styles: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  alta: {
    label: 'Alta',
    styles: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { label, styles } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles} ${className}`}
    >
      {label}
    </span>
  );
};
