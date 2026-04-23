import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientDetailCard } from '@ui/cards/PatientDetailCard';
import { ConsultationCard } from '@ui/cards/ConsultationCard';
import { SOAPModal } from '@ui/feedback/SOAPModal';
import { MOCK_CONSULTATIONS } from '@mocks/consultations';
import { MOCK_PATIENT } from '@mocks/patients';

export const ConsultationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const selectedConsultation = useMemo(
    () => MOCK_CONSULTATIONS.find((c) => c.id === selectedConsultationId),
    [selectedConsultationId]
  );

  const sortedConsultations = useMemo(
    () =>
      [...MOCK_CONSULTATIONS].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    []
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/3 xl:w-1/4">
          <div className="sticky top-8">
            <PatientDetailCard
              patientName={MOCK_PATIENT.name}
              status={MOCK_PATIENT.status}
              personalInfo={MOCK_PATIENT.personalInfo}
              medicalHistory={MOCK_PATIENT.medicalHistory}
              treatments={MOCK_PATIENT.treatments}
              vitalStats={MOCK_PATIENT.vitalStats}
            />
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Historial de Consultas
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sortedConsultations.length} consultas registradas para este paciente
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/medical-record/new-soap')}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                <span className="material-symbols-outlined text-[22px]">add</span>
                Nueva Consulta
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Filtrar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sortedConsultations.map((consultation) => (
              <ConsultationCard
                key={consultation.id}
                consultation={consultation}
                onViewSOAP={setSelectedConsultationId}
              />
            ))}
          </div>

          {sortedConsultations.length === 0 && (
            <div className="text-center py-20 bg-surface rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 mb-4 block">
                history
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sin historial</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Este paciente aún no tiene consultas registradas.
              </p>
            </div>
          )}
        </section>
      </div>

      {selectedConsultation && (
        <SOAPModal
          isOpen={Boolean(selectedConsultationId)}
          onClose={() => setSelectedConsultationId(null)}
          date={selectedConsultation.date}
          doctorName={selectedConsultation.doctorName}
          soap={selectedConsultation.soap}
        />
      )}
    </main>
  );
};
