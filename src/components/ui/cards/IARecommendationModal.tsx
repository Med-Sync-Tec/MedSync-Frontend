import React from 'react';

type IAModalStatus = 'loading' | 'normal' | 'critical';

interface IARecommendationModalProps {
  status?: IAModalStatus;
  recommendation?: string;
  onClose?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

const statusConfig: Record<IAModalStatus, { label: string; icon: string; styles: string; borderStyles: string }> = {
  loading: {
    label: 'Analizando con IA...',
    icon: 'autorenew',
    styles: 'text-purple-600 dark:text-purple-400',
    borderStyles: 'border-purple-200 dark:border-purple-800',
  },
  normal: {
    label: 'Recomendación MedSync AI',
    icon: 'smart_toy',
    styles: 'text-purple-600 dark:text-purple-400',
    borderStyles: 'border-purple-200 dark:border-purple-800',
  },
  critical: {
    label: 'Alerta Crítica MedSync AI',
    icon: 'warning',
    styles: 'text-red-600 dark:text-red-400',
    borderStyles: 'border-red-300 dark:border-red-700',
  },
};

export const IARecommendationModal: React.FC<IARecommendationModalProps> = ({
  status = 'normal',
  recommendation,
  onClose,
  onAccept,
  onReject,
}) => {
  const config = statusConfig[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 ${config.borderStyles} w-full max-w-md mx-4 p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`material-symbols-outlined text-2xl ${config.styles} ${status === 'loading' ? 'animate-spin' : ''}`}>
            {config.icon}
          </span>
          <h3 className={`text-base font-bold ${config.styles}`}>{config.label}</h3>
        </div>

        {status === 'loading' ? (
          <div className="space-y-2">
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Procesando datos clínicos del paciente...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-5">{recommendation}</p>
            <div className="flex gap-3 justify-end">
              {onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Descartar
                </button>
              )}
              {onAccept && (
                <button
                  type="button"
                  onClick={onAccept}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${
                    status === 'critical'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary hover:bg-primary-hover'
                  }`}
                >
                  Aplicar sugerencia
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
