
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
  http: { post: jest.fn() },
}));

jest.mock('@lib/firebase/client', () => ({
  auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue('test-token') } },
}));

import { apiFetch } from '@lib/http/client';
import { createConsulta, analyzeConsulta } from './api';
import type { CreateConsultaInput } from './schemas';

const mockApiFetch = jest.mocked(apiFetch);

/**
 * CreateConsultaInput (inferred from the Zod transform) declares every
 * optional field as `string | undefined`, so the keys must be present.
 */
function makeInput(fecha: string): CreateConsultaInput {
  return {
    fecha,
    motivoConsulta: undefined,
    subjetivo: undefined,
    objetivo: undefined,
    evaluacion: undefined,
    plan: undefined,
    prescripcion: undefined,
    diagnostico: undefined,
  };
}

const BACKEND_CONSULTA = {
  id: 'c1',
  fecha: '2024-05-10T10:00:00',
  motivoConsulta: 'Dolor abdominal',
  subjetivo: null,
  objetivo: null,
  evaluacion: null,
  plan: null,
  prescripcion: null,
  diagnostico: 'Gastritis',
  createdAt: '2024-05-10T10:05:00',
};

const ANALYSIS_RESPONSE = {
  consultaId: 'c1',
  especialidadId: 'e1',
  especialidadSlug: 'cardiologia',
  vocabularyStatus: 'POPULATED',
  suggestions: [{ tipo: 'enfermedad', valor: 'Hipertensión' }],
  modelUsed: 'llama-3.3-70b',
  promptTokens: 100,
  completionTokens: 40,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createConsulta', () => {
  it('calls POST /api/patients/{id}/consultas with only fecha when optionals are absent', async () => {
    mockApiFetch.mockResolvedValue(BACKEND_CONSULTA);

    await createConsulta('p1', makeInput('2024-05-10T10:00:00'));

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p1/consultas', {
      method: 'POST',
      body: { fecha: '2024-05-10T10:00:00' },
    });
  });

  it('includes every provided optional field in the body', async () => {
    mockApiFetch.mockResolvedValue(BACKEND_CONSULTA);

    await createConsulta('p1', {
      fecha: '2024-05-10T10:00:00',
      motivoConsulta: 'Dolor',
      subjetivo: 'Subj',
      objetivo: 'Obj',
      evaluacion: 'Eval',
      plan: 'Plan',
      prescripcion: 'Rx',
      diagnostico: 'Dx',
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p1/consultas', {
      method: 'POST',
      body: {
        fecha: '2024-05-10T10:00:00',
        motivoConsulta: 'Dolor',
        subjetivo: 'Subj',
        objetivo: 'Obj',
        evaluacion: 'Eval',
        plan: 'Plan',
        prescripcion: 'Rx',
        diagnostico: 'Dx',
      },
    });
  });

  it('URL-encodes the patient id', async () => {
    mockApiFetch.mockResolvedValue(BACKEND_CONSULTA);

    await createConsulta('p 1/x', makeInput('2024-05-10T10:00:00'));

    expect(mockApiFetch.mock.calls[0][0]).toBe('/api/patients/p%201%2Fx/consultas');
  });

  it('parses the backend response, normalizing null SOAP fields to empty strings', async () => {
    mockApiFetch.mockResolvedValue(BACKEND_CONSULTA);

    const result = await createConsulta('p1', makeInput('2024-05-10T10:00:00'));

    expect(result.id).toBe('c1');
    expect(result.motivoConsulta).toBe('Dolor abdominal');
    expect(result.subjetivo).toBe('');
    expect(result.diagnostico).toBe('Gastritis');
  });

  it('throws when the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ unexpected: 'shape' });

    await expect(createConsulta('p1', makeInput('2024-05-10T10:00:00'))).rejects.toThrow();
  });

  it('propagates transport errors from apiFetch', async () => {
    mockApiFetch.mockRejectedValue(new Error('network down'));

    await expect(createConsulta('p1', makeInput('2024-05-10T10:00:00'))).rejects.toThrow(
      'network down',
    );
  });
});

describe('analyzeConsulta', () => {
  it('calls POST /api/consultas/{id}/analyze', async () => {
    mockApiFetch.mockResolvedValue(ANALYSIS_RESPONSE);

    await analyzeConsulta('c1');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/consultas/c1/analyze', {
      method: 'POST',
    });
  });

  it('URL-encodes the consulta id', async () => {
    mockApiFetch.mockResolvedValue(ANALYSIS_RESPONSE);

    await analyzeConsulta('c 1/x');

    expect(mockApiFetch.mock.calls[0][0]).toBe('/api/consultas/c%201%2Fx/analyze');
  });

  it('returns the parsed analysis response', async () => {
    mockApiFetch.mockResolvedValue(ANALYSIS_RESPONSE);

    const result = await analyzeConsulta('c1');

    expect(result).toEqual(ANALYSIS_RESPONSE);
  });

  it('throws when the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ consultaId: 'c1' });

    await expect(analyzeConsulta('c1')).rejects.toThrow();
  });
});
