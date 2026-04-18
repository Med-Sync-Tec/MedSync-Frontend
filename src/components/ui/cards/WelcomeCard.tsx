import React from 'react';
import { Button } from '../buttons/Button';

interface WelcomeCardProps {
  doctorName: string;
  date?: string;
  summary?: string;
  onViewSchedule?: () => void;
  onViewAlerts?: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  doctorName,
  date,
  summary = 'Tienes 8 citas programadas y 3 alertas pendientes.',
  onViewSchedule,
  onViewAlerts,
}) => {
  const today = date ?? new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d2451] to-[#4f46e5] text-white p-6 shadow-xl">
      <div className="relative z-10">
        <p className="text-sm text-blue-200 capitalize">{today}</p>
        <h2 className="text-2xl font-bold mt-1">Buenos días, {doctorName}</h2>
        <p className="text-blue-100 text-sm mt-2">{summary}</p>
        <div className="flex gap-3 mt-5">
          <Button
            variant="secondary"
            onClick={onViewSchedule}
            className="bg-white/15 hover:bg-white/25 text-white border-white/20 text-sm py-2.5"
          >
            Ver agenda
          </Button>
          <Button
            variant="outline"
            onClick={onViewAlerts}
            className="border-white/30 text-white hover:bg-white/10 text-sm py-2.5"
          >
            Ver alertas
          </Button>
        </div>
      </div>
      <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/5 select-none">
        medical_services
      </span>
    </div>
  );
};
