import React from 'react';

export interface ConsultationSummary {
  id: string;
  date: string;
  reason: string;
  diagnosis: string;
  type: 'general' | 'especialista' | 'seguimiento';
}

interface ConsultationCardProps {
  consultation: ConsultationSummary;
  onViewSOAP: (id: string) => void;
  className?: string;
}

const typeStyles: Record<ConsultationSummary['type'], string> = {
  general: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  especialista: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  seguimiento: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
};

const typeLabels: Record<ConsultationSummary['type'], string> = {
  general: 'Medicina General',
  especialista: 'Especialista',
  seguimiento: 'Seguimiento',
};

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  onViewSOAP,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200 group ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-500/20">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              {new Date(consultation.date).toLocaleDateString('es-ES', { month: 'short' })}
            </span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 -mt-1">
              {new Date(consultation.date).getDate()}
            </span>
          </div>
          
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${typeStyles[consultation.type]}`}>
                {typeLabels[consultation.type]}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                • {new Date(consultation.date).getFullYear()}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {consultation.reason}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {consultation.diagnosis}
            </p>
          </div>
        </div>

        <button
          onClick={() => onViewSOAP(consultation.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-900/40 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-xl text-sm font-semibold transition-all border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/30"
        >
          <span className="material-symbols-outlined text-[20px]">description</span>
          Ver SOAP
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};
