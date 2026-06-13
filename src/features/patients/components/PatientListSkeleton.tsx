import React from 'react';

interface PatientListSkeletonProps {
  rows?: number;
}

export const PatientListSkeleton: React.FC<PatientListSkeletonProps> = ({ rows = 6 }) => {
  return (
    <ul
      role="status"
      aria-live="polite"
      aria-label="Cargando lista de pacientes"
      className="divide-y divide-border-subtle"
    >
      {Array.from({ length: rows }, (_, n) => n + 1).map((n) => (
        <li key={`skeleton-patient-${n}`} className="flex items-center gap-3 px-4 py-3">
          <span className="w-10 h-10 rounded-full bg-surface-muted animate-pulse" aria-hidden="true" />
          <div className="flex-1 min-w-0 space-y-2">
            <span className="block h-3 w-2/5 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="block h-2.5 w-1/4 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
          </div>
          <span className="w-16 h-5 rounded-full bg-surface-muted animate-pulse" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
};
