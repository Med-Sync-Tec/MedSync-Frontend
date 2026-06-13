
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@lib/http/client';
import {
  getMatchingArticles,
  getCooMatchingArticles,
  getMatchingPatients,
  listEspecialidades,
} from './api';

const mockApiFetch = jest.mocked(apiFetch);

const ARTICLE = {
  id: 'art-1',
  titulo: 'Título',
  autores: null,
  revista: null,
  anioPub: null,
  mesPub: null,
  doi: null,
  abstractText: null,
  keywords: null,
  tipoPublicacion: null,
  url: null,
  especialidadId: null,
  tags: [{ id: 'tag-1', tipo: 'sintoma', valor: 'fiebre' }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

const PATIENT = {
  id: 'pat-1',
  expedienteExternoId: 'EXP-1',
  nombre: 'Juan Pérez',
  fechaNacimiento: '1990-05-01',
  genero: 'M',
  medicoId: 'doc-1',
  activo: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getMatchingArticles', () => {
  it('calls GET /api/patients/{id}/matching-articles with the default limit', async () => {
    mockApiFetch.mockResolvedValue([ARTICLE]);

    await getMatchingArticles('pat-1');

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/patients/pat-1/matching-articles?limit=50',
    );
  });

  it('honors a custom limit', async () => {
    mockApiFetch.mockResolvedValue([]);

    await getMatchingArticles('pat-1', 10);

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/patients/pat-1/matching-articles?limit=10',
    );
  });

  it('URL-encodes the patient id', async () => {
    mockApiFetch.mockResolvedValue([]);

    await getMatchingArticles('p 1/é');

    expect(mockApiFetch).toHaveBeenCalledWith(
      `/api/patients/${encodeURIComponent('p 1/é')}/matching-articles?limit=50`,
    );
  });

  it('returns the parsed article list', async () => {
    mockApiFetch.mockResolvedValue([ARTICLE]);

    const result = await getMatchingArticles('pat-1');

    expect(result).toEqual([ARTICLE]);
  });

  it('throws when the payload does not match the schema', async () => {
    mockApiFetch.mockResolvedValue([{ id: 1, titulo: 'sin campos' }]);

    await expect(getMatchingArticles('pat-1')).rejects.toThrow();
  });

  it('throws when the payload is not an array', async () => {
    mockApiFetch.mockResolvedValue({ items: [ARTICLE] });

    await expect(getMatchingArticles('pat-1')).rejects.toThrow();
  });
});

describe('getCooMatchingArticles', () => {
  it('calls GET /api/coo/matching-articles with the default limit', async () => {
    mockApiFetch.mockResolvedValue([ARTICLE]);

    await getCooMatchingArticles();

    expect(mockApiFetch).toHaveBeenCalledWith('/api/coo/matching-articles?limit=50');
  });

  it('honors a custom limit', async () => {
    mockApiFetch.mockResolvedValue([]);

    await getCooMatchingArticles(5);

    expect(mockApiFetch).toHaveBeenCalledWith('/api/coo/matching-articles?limit=5');
  });

  it('returns the parsed article list', async () => {
    mockApiFetch.mockResolvedValue([ARTICLE]);

    const result = await getCooMatchingArticles();

    expect(result).toEqual([ARTICLE]);
  });

  it('throws when the payload does not match the schema', async () => {
    mockApiFetch.mockResolvedValue([{ unexpected: true }]);

    await expect(getCooMatchingArticles()).rejects.toThrow();
  });
});

describe('getMatchingPatients', () => {
  it('calls GET /api/articles/{id}/matching-patients with the default limit', async () => {
    mockApiFetch.mockResolvedValue([PATIENT]);

    await getMatchingPatients('art-1');

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/articles/art-1/matching-patients?limit=50',
    );
  });

  it('URL-encodes the article id and honors a custom limit', async () => {
    mockApiFetch.mockResolvedValue([]);

    await getMatchingPatients('a/b', 3);

    expect(mockApiFetch).toHaveBeenCalledWith(
      `/api/articles/${encodeURIComponent('a/b')}/matching-patients?limit=3`,
    );
  });

  it('returns the parsed patient list', async () => {
    mockApiFetch.mockResolvedValue([PATIENT]);

    const result = await getMatchingPatients('art-1');

    expect(result).toEqual([PATIENT]);
  });

  it('throws when the payload does not match the patient schema', async () => {
    mockApiFetch.mockResolvedValue([{ id: 'pat-1' }]);

    await expect(getMatchingPatients('art-1')).rejects.toThrow();
  });
});

describe('listEspecialidades', () => {
  it('calls GET /api/especialidades', async () => {
    mockApiFetch.mockResolvedValue([]);

    await listEspecialidades();

    expect(mockApiFetch).toHaveBeenCalledWith('/api/especialidades');
  });

  it('returns the parsed catalog', async () => {
    const catalog = [{ id: 'e1', nombre: 'Cardiología', slug: 'cardiologia' }];
    mockApiFetch.mockResolvedValue(catalog);

    const result = await listEspecialidades();

    expect(result).toEqual(catalog);
  });

  it('throws when an entry is invalid', async () => {
    mockApiFetch.mockResolvedValue([{ id: 'e1' }]);

    await expect(listEspecialidades()).rejects.toThrow();
  });
});
