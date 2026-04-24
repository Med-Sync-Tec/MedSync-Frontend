import { PatientDetailSchema } from '@features/patients/schemas';
import type { PatientDetail } from '@features/patients/schemas';

const rawPatient: PatientDetail = {
  patient: {
    id: 'p-001',
    expedienteExternoId: 'HG-2024-10234',
    nombre: 'Juan Pérez Rodríguez',
    fechaNacimiento: '1980-03-17',
    genero: 'Masculino',
    medicoId: 'doc-004',
    activo: true,
    createdAt: '2023-05-12T08:15:00Z',
    updatedAt: '2025-11-02T14:30:00Z',
  },
  expediente: {
    id: 'exp-001',
    pacienteExternoId: 'HG-2024-10234',
    doctorResponsableId: 'doc-004',
    createdAt: '2023-05-12T08:20:00Z',
  },
  consultas: [
    {
      id: '1',
      fecha: '2024-03-15T10:00:00Z',
      diagnostico: 'Hipertensión arterial controlada',
      prescripcion: 'Enalapril 10 mg cada 12 horas',
    },
    {
      id: '2',
      fecha: '2024-02-10T09:30:00Z',
      diagnostico: 'Faringoamigdalitis viral aguda',
      prescripcion: 'Paracetamol 500 mg cada 8 horas por 3 días',
    },
    {
      id: '3',
      fecha: '2024-01-05T11:15:00Z',
      diagnostico: 'Soplo sistólico grado I',
      prescripcion: 'Ecocardiograma transtorácico de control',
    },
  ],
};

export const MOCK_PATIENT: PatientDetail = PatientDetailSchema.parse(rawPatient);
