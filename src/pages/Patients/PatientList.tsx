import React, { useState } from 'react';
import { Header } from '../../components/ui/navigation/Header';
import { Avatar } from '../../components/ui/avatars/Avatar';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  status: 'active' | 'inactive';
}

const INITIAL_PATIENTS: Patient[] = [
  { id: 'PT-001', name: 'Laura Martínez', age: 34, lastVisit: '2024-04-10', status: 'active' },
  { id: 'PT-002', name: 'Carlos Gómez', age: 45, lastVisit: '2024-03-22', status: 'active' },
  { id: 'PT-003', name: 'Ana Silva', age: 28, lastVisit: '2024-04-15', status: 'active' },
  { id: 'PT-004', name: 'Roberto Fernández', age: 52, lastVisit: '2024-01-05', status: 'active' },
];

export const PatientList: React.FC = () => {

  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const handleDeactivate = (id: string) => {
    setPatients(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'inactive' } : p
    ));
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
      setPatientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setPatientToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      <Header role="doctor" activeLink="Pacientes" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Pacientes</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gestiona el listado y el estado de tus pacientes registrados.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {patients.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-[#25334b] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={patient.name} size="lg" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {patient.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>ID: {patient.id}</span>
                        <span>•</span>
                        <span>{patient.age} años</span>
                        <span>•</span>
                        <span>Última visita: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {patient.status === 'active' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeactivate(patient.id);
                        }}
                        className="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(patient);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4 block">
                group_off
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sin pacientes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">No tienes pacientes en tu lista.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmación */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-3xl shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-6 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-4xl">warning</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Eliminar paciente</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-8">
              ¿Estás seguro de que deseas eliminar permanentemente a <strong>{patientToDelete.name}</strong>? Esta acción no se puede deshacer y se perderán todos los datos asociados.
            </p>

            <div className="flex items-center justify-end gap-3 pointer-events-auto">
              <button
                onClick={cancelDelete}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-none transition-colors"
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
