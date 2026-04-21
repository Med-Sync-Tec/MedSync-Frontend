import React from 'react';
import { Avatar } from '../avatars/Avatar';

interface PatientCardProps {
  name: string;
  patientId: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  name,
  patientId,
  selected = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 ${
        selected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#4f46e5]'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
      } ${className}`}
    >
      <Avatar name={name} size="md" />
      <div className="min-w-0">
        <p className={`text-sm font-semibold truncate ${selected ? 'text-[#4f46e5]' : 'text-gray-800 dark:text-white'}`}>
          {name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">ID: #{patientId}</p>
      </div>
    </button>
  );
};
