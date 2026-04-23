import React, { useState, useMemo } from 'react';
import { Header } from '../../../components/ui/navigation/Header';
import { PatientDetailCard } from '../../../components/ui/cards/PatientDetailCard';
import { ConsultationCard } from '../../../components/ui/cards/ConsultationCard';
import type { ConsultationSummary } from '../../../components/ui/cards/ConsultationCard';
import { SOAPModal } from '../../../components/ui/feedback/SOAPModal';
import type { SOAPData } from '../../../components/ui/feedback/SOAPModal';

interface FullConsultation extends ConsultationSummary {
  doctorName: string;
  soap: SOAPData;
}

const MOCK_CONSULTATIONS: FullConsultation[] = [
  {
    id: '1',
    date: '2024-03-15T10:00:00Z',
    reason: 'Control de Hipertensión',
    diagnosis: 'Hipertensión arterial controlada, ajuste leve de dosis.',
    type: 'seguimiento',
    doctorName: 'García Pérez',
    soap: {
      subjective: 'Paciente refiere sentirse bien, sin cefaleas ni visión borrosa. Cumple con la dieta baja en sodio.',
      objective: 'TA: 125/80 mmHg, FC: 72 lpm. Sin edemas en miembros inferiores.',
      assessment: 'Hipertensión arterial esencial bajo buen control con el tratamiento actual.',
      plan: 'Continuar con Enalapril 10mg cada 12h. Control en 3 meses.',
    }
  },
  {
    id: '2',
    date: '2024-02-10T09:30:00Z',
    reason: 'Infección Respiratoria Superior',
    diagnosis: 'Faringoamigdalitis viral aguda.',
    type: 'general',
    doctorName: 'Martínez López',
    soap: {
      subjective: 'Dolor de garganta de 2 días de evolución, fiebre no cuantificada, rinorrea hialina.',
      objective: 'Faringe hiperémica, amígdalas grado II sin exudados. Auscultación pulmonar normal.',
      assessment: 'Cuadro compatible con infección viral de vías respiratorias superiores.',
      plan: 'Paracetamol 500mg cada 8h por 3 días. Abundantes líquidos y reposo.',
    }
  },
  {
    id: '3',
    date: '2024-01-05T11:15:00Z',
    reason: 'Evaluación Cardiológica',
    diagnosis: 'Soplo sistólico grado I, sin compromiso hemodinámico.',
    type: 'especialista',
    doctorName: 'Rodríguez San',
    soap: {
      subjective: 'Paciente solicita chequeo general, refiere fatiga leve al subir escaleras.',
      objective: 'Ruidos cardiacos rítmicos, presencia de soplo sistólico suave. EKG normal.',
      assessment: 'Soplo funcional vs. estructural leve. No sugiere patología aguda.',
      plan: 'Ecocardiograma transtorácico de control para descartar valvuopatías.',
    }
  }
];

const MOCK_PATIENT = {
  name: 'Juan Pérez Rodríguez',
  status: 'estable' as const,
  personalInfo: {
    age: 45,
    gender: 'Masculino',
    phone: '55-1234-5678',
    email: 'juan.perez@email.com'
  },
  medicalHistory: {
    chronicConditions: ['Hipertensión Arterial', 'Diabetes Tipo 2'],
    allergies: ['Penicilina', 'Polen']
  },
  treatments: [
    { icon: 'medication', name: 'Enalapril', dose: '10mg', instructions: '1 tableta cada 12 horas' },
    { icon: 'pill', name: 'Metformina', dose: '850mg', instructions: '1 tableta con la cena' }
  ],
  vitalStats: {
    bloodPressure: '125/80',
    bpm: 72,
    weight: 82,
    o2Sat: 98
  }
};

export const ConsultationHistory: React.FC = () => {
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const selectedConsultation = useMemo(() =>
    MOCK_CONSULTATIONS.find(c => c.id === selectedConsultationId),
    [selectedConsultationId]
  );

  const sortedConsultations = useMemo(() =>
    [...MOCK_CONSULTATIONS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      <Header role="doctor" activeLink="Pacientes" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Patient Info */}
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

          {/* Main Content - Consultation List */}
          <section className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial de Consultas</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedConsultations.length} consultas registradas para este paciente
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.location.href = '/medical-record/new-soap'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1d2451] hover:bg-[#151a3a] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  <span className="material-symbols-outlined text-[22px]">add</span>
                  Nueva Consulta
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
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

            {/* Empty state if no consultations */}
            {sortedConsultations.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 mb-4 block">
                  history
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sin historial</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Este paciente aún no tiene consultas registradas.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* SOAP Modal */}
      {selectedConsultation && (
        <SOAPModal
          isOpen={!!selectedConsultationId}
          onClose={() => setSelectedConsultationId(null)}
          date={selectedConsultation.date}
          doctorName={selectedConsultation.doctorName}
          soap={selectedConsultation.soap}
        />
      )}
    </div>
  );
};
