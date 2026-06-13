import React from 'react';

interface FileUploadZoneProps {
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <span className="material-symbols-outlined text-[20px]">attach_file</span>
        <h3 className="text-sm font-bold uppercase tracking-wider">Estudios y Archivos Adjuntos</h3>
      </div>
      
      <div className="border-2 border-dashed border-indigo-100 dark:border-gray-700 bg-indigo-50/20 dark:bg-gray-800/20 rounded-[2rem] p-8 transition-colors hover:bg-indigo-50/40 dark:hover:bg-gray-800/40 group cursor-pointer">
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]">upload_file</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Arrastre archivos aquí o haga clic para subir
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Soporta RX, PDF de laboratorio, Fotos (Max 20MB)
            </p>
          </div>
        </div>
        <input type="file" className="hidden" multiple />
      </div>
    </div>
  );
};
