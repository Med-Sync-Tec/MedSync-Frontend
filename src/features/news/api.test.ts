
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@lib/http/client';
import {
  getRecentArticles,
  syncRecentArticles,
  markArticleAsRead,
  getSavedArticles,
  saveArticle,
  unsaveArticle,
  analyzeArticle,
} from './api';

const mockApiFetch = jest.mocked(apiFetch);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getRecentArticles', () => {
  it('calls GET /api/articles/recent with default pagination', async () => {
    // Arrange
    const page = { items: [], total: 0, page: 0, size: 20 };
    mockApiFetch.mockResolvedValue(page);

    // Act
    const result = await getRecentArticles();

    // Assert
    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/recent?page=0&size=20');
    expect(result).toEqual(page);
  });

  it('forwards custom page and size', async () => {
    mockApiFetch.mockResolvedValue({ items: [], total: 0, page: 3, size: 5 });

    await getRecentArticles(3, 5);

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/recent?page=3&size=5');
  });
});

describe('syncRecentArticles', () => {
  it('calls POST /api/articles/sync and returns the processed count', async () => {
    mockApiFetch.mockResolvedValue({ articulosProcesados: 7 });

    const result = await syncRecentArticles();

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/sync', { method: 'POST' });
    expect(result).toEqual({ articulosProcesados: 7 });
  });
});

describe('markArticleAsRead', () => {
  it('calls POST /api/articles/{id}/read', async () => {
    mockApiFetch.mockResolvedValue(undefined);

    await markArticleAsRead('a1');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/a1/read', { method: 'POST' });
  });
});

describe('getSavedArticles', () => {
  it('calls GET /api/articles/saved with default pagination', async () => {
    mockApiFetch.mockResolvedValue({ items: [], total: 0, page: 0, size: 20 });

    await getSavedArticles();

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/saved?page=0&size=20');
  });

  it('forwards custom page and size', async () => {
    mockApiFetch.mockResolvedValue({ items: [], total: 0, page: 1, size: 10 });

    await getSavedArticles(1, 10);

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/saved?page=1&size=10');
  });
});

describe('saveArticle', () => {
  it('calls POST /api/articles/{id}/save', async () => {
    mockApiFetch.mockResolvedValue(undefined);

    await saveArticle('a2');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/a2/save', { method: 'POST' });
  });
});

describe('unsaveArticle', () => {
  it('calls DELETE /api/articles/{id}/save', async () => {
    mockApiFetch.mockResolvedValue(undefined);

    await unsaveArticle('a2');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/a2/save', { method: 'DELETE' });
  });
});

describe('analyzeArticle', () => {
  const validResponse = {
    articleId: 'a1',
    especialidadId: null,
    especialidadNombre: null,
    tags: [{ id: 't1', tipo: 'SINTOMA', valor: 'cefalea' }],
    modelUsed: 'llama-3.3-70b-versatile',
    promptTokens: 400,
    completionTokens: 60,
    hadAbstract: false,
  };

  it('calls POST /api/articles/{id}/analyze and returns the parsed response', async () => {
    // Arrange
    mockApiFetch.mockResolvedValue(validResponse);

    // Act
    const result = await analyzeArticle('a1');

    // Assert
    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/a1/analyze', { method: 'POST' });
    expect(result).toEqual(validResponse);
  });

  it('URL-encodes the article id', async () => {
    mockApiFetch.mockResolvedValue(validResponse);

    await analyzeArticle('id with/slash');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/articles/id%20with%2Fslash/analyze', {
      method: 'POST',
    });
  });

  it('throws when the backend response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ unexpected: 'shape' });

    await expect(analyzeArticle('a1')).rejects.toThrow();
  });

  it('propagates transport errors from apiFetch', async () => {
    mockApiFetch.mockRejectedValue(new Error('network down'));

    await expect(analyzeArticle('a1')).rejects.toThrow('network down');
  });
});
