import React from 'react';
import type { SOAPData } from '@features/consultations/types';

export type { SOAPData } from '@features/consultations/types';

interface SOAPModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  doctorName: string;
  soap: SOAPData;
}

export const SOAPModal: React.FC<SOAPModalProps> = ({
  isOpen,
  onClose,
  date,
  doctorName,
  soap,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative bg-surface rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumen SOAP</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Consulta del {new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} • Dr. {doctorName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-[20px]">person_search</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">Subjetivo (S)</h3>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {soap.subjective}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">Objetivo (O)</h3>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {soap.objective}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined text-[20px]">assignment</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">Análisis (A)</h3>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {soap.assessment}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[20px]">event_note</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">Plan (P)</h3>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {soap.plan}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50/30 dark:bg-gray-800/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-100 dark:shadow-none"
          >
            Cerrar Resumen
          </button>
        </div>
      </div>
    </div>
  );
};
