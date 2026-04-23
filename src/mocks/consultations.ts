import { z } from 'zod';
import { ConsultationSchema } from '@features/consultations/schemas';
import type { Consultation } from '@features/consultations/schemas';

const rawConsultations: Consultation[] = [
  {
    id: '1',
    date: '2024-03-15T10:00:00Z',
    reason: 'Control de Hipertensión',
    diagnosis: 'Hipertensión arterial controlada, ajuste leve de dosis.',
    type: 'seguimiento',
    doctorName: 'García Pérez',
    soap: {
      subjective:
        'Paciente refiere sentirse bien, sin cefaleas ni visión borrosa. Cumple con la dieta baja en sodio.',
      objective: 'TA: 125/80 mmHg, FC: 72 lpm. Sin edemas en miembros inferiores.',
      assessment: 'Hipertensión arterial esencial bajo buen control con el tratamiento actual.',
      plan: 'Continuar con Enalapril 10mg cada 12h. Control en 3 meses.',
    },
  },
  {
    id: '2',
    date: '2024-02-10T09:30:00Z',
    reason: 'Infección Respiratoria Superior',
    diagnosis: 'Faringoamigdalitis viral aguda.',
    type: 'general',
    doctorName: 'Martínez López',
    soap: {
      subjective:
        'Dolor de garganta de 2 días de evolución, fiebre no cuantificada, rinorrea hialina.',
      objective:
        'Faringe hiperémica, amígdalas grado II sin exudados. Auscultación pulmonar normal.',
      assessment: 'Cuadro compatible con infección viral de vías respiratorias superiores.',
      plan: 'Paracetamol 500mg cada 8h por 3 días. Abundantes líquidos y reposo.',
    },
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
    },
  },
];

export const MOCK_CONSULTATIONS: Consultation[] = z
  .array(ConsultationSchema)
  .parse(rawConsultations);
