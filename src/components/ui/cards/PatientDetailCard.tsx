import React from 'react';
import { StatusBadge } from '../badges/StatusBadge';

interface PersonalInfo {
  age: number;
  gender: string;
  phone: string;
  email: string;
}

interface MedicalHistory {
  chronicConditions: string[];
  allergies: string[];
}

interface Treatment {
  icon?: string;
  name: string;
  dose: string;
  instructions: string;
}

interface VitalStats {
  bloodPressure: string;
  bpm: number;
  weight: number;
  o2Sat: number;
}

interface PatientDetailCardProps {
  patientName: string;
  status?: 'estable' | 'critico' | 'en-observacion' | 'alta';
  personalInfo: PersonalInfo;
  medicalHistory: MedicalHistory;
  treatments: Treatment[];
  vitalStats: VitalStats;
  className?: string;
}

export const PatientDetailCard: React.FC<PatientDetailCardProps> = ({
  patientName,
  status = 'estable',
  personalInfo,
  medicalHistory,
  treatments,
  vitalStats,
  className = '',
}) => {
  const cardBase = 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{patientName}</h2>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 5a — Información Personal */}
        <div className={cardBase}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Información Personal</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {[
                ['Edad', `${personalInfo.age} años`],
                ['Género', personalInfo.gender],
                ['Teléfono', personalInfo.phone],
                ['Email', personalInfo.email],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 font-medium">{label}</td>
                  <td className="py-2 text-gray-900 dark:text-white text-right">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5b — Historial Médico */}
        <div className={cardBase}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Historial Médico</h3>
          <div className="space-y-3">
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Condiciones Crónicas</p>
              <ul className="space-y-0.5">
                {medicalHistory.chronicConditions.map((c) => (
                  <li key={c} className="text-sm text-gray-700 dark:text-gray-300">{c}</li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-3">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">Alergias</p>
              <ul className="space-y-0.5">
                {medicalHistory.allergies.map((a) => (
                  <li key={a} className="text-sm text-gray-700 dark:text-gray-300">{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 5c — Tratamiento Actual */}
        <div className={cardBase}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Tratamiento Actual</h3>
          <ul className="space-y-3">
            {treatments.map((t) => (
              <li key={t.name} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#4f46e5] shrink-0">
                  <span className="material-symbols-outlined text-base">{t.icon ?? 'medication'}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{t.name} — {t.dose}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.instructions}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 5d — Estadísticas Recientes */}
        <div className={cardBase}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Estadísticas Recientes</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Presión Art.', value: vitalStats.bloodPressure, icon: 'favorite' },
              { label: 'BPM', value: vitalStats.bpm, icon: 'monitor_heart' },
              { label: 'Peso', value: `${vitalStats.weight} kg`, icon: 'scale' },
              { label: 'O₂ Sat.', value: `${vitalStats.o2Sat}%`, icon: 'air' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
