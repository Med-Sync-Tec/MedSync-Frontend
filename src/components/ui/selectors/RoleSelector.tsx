import React from 'react';

export type RoleType = 'doctor' | 'coo';

interface RoleSelectorProps {
  role: RoleType;
  onChange: (role: RoleType) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ role, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button 
        type="button"
        onClick={() => onChange('doctor')}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 group ${
          role === 'doctor' 
            ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20' 
            : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
          role === 'doctor' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <span className="material-symbols-outlined text-2xl">stethoscope</span>
        </div>
        <span className={`text-sm ${role === 'doctor' ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300 font-medium'}`}>
          Doctor
        </span>
        {role === 'doctor' && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"></div>
        )}
      </button>

      <button 
        type="button"
        onClick={() => onChange('coo')}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 group ${
          role === 'coo' 
            ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20' 
            : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
          role === 'coo' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
        </div>
        <span className={`text-sm ${role === 'coo' ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300 font-medium'}`}>
          Director (COO)
        </span>
        {role === 'coo' && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"></div>
        )}
      </button>
    </div>
  );
};
