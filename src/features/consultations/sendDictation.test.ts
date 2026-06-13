
jest.mock('@lib/http/client', () => ({
  http: { post: jest.fn() },
  apiFetch: jest.fn(),
}));

jest.mock('@lib/firebase/client', () => ({
  auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue('test-token') } },
}));

import { http } from '@lib/http/client';
import { sendDictation } from './api';

const mockPost = jest.mocked(http.post);

beforeEach(() => jest.clearAllMocks());

describe('sendDictation', () => {
  it('calls POST /api/soap/dictation with FormData', async () => {
    mockPost.mockResolvedValue({
      data: { motivoConsulta: 'Dolor', subjetivo: null, objetivo: null,
              evaluacion: null, diagnostico: null, plan: null, prescripcion: null },
    });

    const blob = new Blob(['audio'], { type: 'audio/webm' });
    await sendDictation(blob);

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [url, formData] = mockPost.mock.calls[0];
    expect(url).toBe('/api/soap/dictation');
    expect(formData).toBeInstanceOf(FormData);
  });

  it('FormData contains audio field with correct filename', async () => {
    mockPost.mockResolvedValue({
      data: { motivoConsulta: null, subjetivo: null, objetivo: null,
              evaluacion: null, diagnostico: null, plan: null, prescripcion: null },
    });

    const blob = new Blob(['audio'], { type: 'audio/webm' });
    await sendDictation(blob);

    const formData = mockPost.mock.calls[0][1] as FormData;
    const file = formData.get('audio') as File;
    expect(file).not.toBeNull();
    expect(file.name).toBe('dictation.webm');
  });

  it('parses and returns the response', async () => {
    mockPost.mockResolvedValue({
      data: { motivoConsulta: 'Dolor abdominal', subjetivo: 'Fiebre', objetivo: null,
              evaluacion: null, diagnostico: null, plan: null, prescripcion: null },
    });

    const result = await sendDictation(new Blob(['audio']));
    expect(result.motivoConsulta).toBe('Dolor abdominal');
  });

  it('throws if response does not match schema', async () => {
    mockPost.mockResolvedValue({ data: 'not an object' });

    await expect(sendDictation(new Blob(['audio']))).rejects.toThrow();
  });
});
