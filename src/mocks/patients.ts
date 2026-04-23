import { PatientDetailSchema } from '@features/patients/schemas';
import type { PatientDetail } from '@features/patients/schemas';

const rawPatient: PatientDetail = {
  id: 'p-001',
  name: 'Juan Pérez Rodríguez',
  status: 'estable',
  personalInfo: {
    age: 45,
    gender: 'Masculino',
    phone: '55-1234-5678',
    email: 'juan.perez@email.com',
  },
  medicalHistory: {
    chronicConditions: ['Hipertensión Arterial', 'Diabetes Tipo 2'],
    allergies: ['Penicilina', 'Polen'],
  },
  treatments: [
    { icon: 'medication', name: 'Enalapril', dose: '10mg', instructions: '1 tableta cada 12 horas' },
    { icon: 'pill', name: 'Metformina', dose: '850mg', instructions: '1 tableta con la cena' },
  ],
  vitalStats: {
    bloodPressure: '125/80',
    bpm: 72,
    weight: 82,
    o2Sat: 98,
  },
};

export const MOCK_PATIENT: PatientDetail = PatientDetailSchema.parse(rawPatient);
