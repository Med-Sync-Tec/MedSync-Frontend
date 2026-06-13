import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('./api', () => ({
  analyzeArticle: jest.fn(),
  getRecentArticles: jest.fn(),
  getSavedArticles: jest.fn(),
  markArticleAsRead: jest.fn(),
  saveArticle: jest.fn(),
  syncRecentArticles: jest.fn(),
  unsaveArticle: jest.fn(),
}));

import {
  analyzeArticle,
  getRecentArticles,
  getSavedArticles,
  markArticleAsRead,
  saveArticle,
  syncRecentArticles,
  unsaveArticle,
} from './api';
import {
  newsKeys,
  useAnalyzeArticle,
  useMarkArticleAsRead,
  useRecentArticles,
  useSaveArticle,
  useSavedArticles,
  useSyncArticles,
  useUnsaveArticle,
} from './queries';
import type { AnalyzeArticleResponse } from './schemas';
import type { PagedArticlesResponse } from './types';

const mockGetRecent = jest.mocked(getRecentArticles);
const mockGetSaved = jest.mocked(getSavedArticles);
const mockSync = jest.mocked(syncRecentArticles);
const mockMarkRead = jest.mocked(markArticleAsRead);
const mockSave = jest.mocked(saveArticle);
const mockUnsave = jest.mocked(unsaveArticle);
const mockAnalyze = jest.mocked(analyzeArticle);

const EMPTY_PAGE: PagedArticlesResponse = { items: [], total: 0, page: 0, size: 5 };

const ANALYZE_RESPONSE: AnalyzeArticleResponse = {
  articleId: 'a1',
  especialidadId: 'esp-1',
  especialidadNombre: 'Cardiología',
  tags: [{ id: 't1', tipo: 'ENFERMEDAD', valor: 'hipertensión' }],
  modelUsed: 'llama-3.3-70b-versatile',
  promptTokens: 500,
  completionTokens: 80,
  hadAbstract: true,
};

function createHarness() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidateSpy, wrapper };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('newsKeys', () => {
  it('builds hierarchical query keys under "news"', () => {
    expect(newsKeys.all).toEqual(['news']);
    expect(newsKeys.recent()).toEqual(['news', 'recent']);
    expect(newsKeys.saved()).toEqual(['news', 'saved']);
  });
});

describe('useRecentArticles', () => {
  it('fetches with default page=0 and size=5', async () => {
    // Arrange
    mockGetRecent.mockResolvedValue(EMPTY_PAGE);
    const { wrapper } = createHarness();

    // Act
    const { result } = renderHook(() => useRecentArticles(), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetRecent).toHaveBeenCalledWith(0, 5);
    expect(result.current.data).toEqual(EMPTY_PAGE);
  });

  it('forwards custom page and size', async () => {
    mockGetRecent.mockResolvedValue({ ...EMPTY_PAGE, page: 2, size: 7 });
    const { wrapper } = createHarness();

    const { result } = renderHook(() => useRecentArticles(2, 7), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetRecent).toHaveBeenCalledWith(2, 7);
  });

  it('surfaces fetch errors', async () => {
    mockGetRecent.mockRejectedValue(new Error('boom'));
    const { wrapper } = createHarness();

    const { result } = renderHook(() => useRecentArticles(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useSavedArticles', () => {
  it('fetches with default page=0 and size=10', async () => {
    mockGetSaved.mockResolvedValue({ ...EMPTY_PAGE, size: 10 });
    const { wrapper } = createHarness();

    const { result } = renderHook(() => useSavedArticles(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetSaved).toHaveBeenCalledWith(0, 10);
  });

  it('forwards custom page and size', async () => {
    mockGetSaved.mockResolvedValue({ ...EMPTY_PAGE, size: 200 });
    const { wrapper } = createHarness();

    const { result } = renderHook(() => useSavedArticles(0, 200), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetSaved).toHaveBeenCalledWith(0, 200);
  });

  it('surfaces fetch errors', async () => {
    mockGetSaved.mockRejectedValue(new Error('saved failed'));
    const { wrapper } = createHarness();

    const { result } = renderHook(() => useSavedArticles(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useSyncArticles', () => {
  it('invalidates all news queries on success', async () => {
    // Arrange
    mockSync.mockResolvedValue({ articulosProcesados: 3 });
    const { wrapper, invalidateSpy } = createHarness();
    const { result } = renderHook(() => useSyncArticles(), { wrapper });

    // Act
    result.current.mutate();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ articulosProcesados: 3 });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['news'] });
  });

  it('does not invalidate on error', async () => {
    mockSync.mockRejectedValue(new Error('sync failed'));
    const { wrapper, invalidateSpy } = createHarness();
    const { result } = renderHook(() => useSyncArticles(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('useMarkArticleAsRead', () => {
  it('marks the article as read and invalidates the dashboard query', async () => {
    mockMarkRead.mockResolvedValue(undefined);
    const { wrapper, invalidateSpy } = createHarness();
    const { result } = renderHook(() => useMarkArticleAsRead(), { wrapper });

    result.current.mutate('a1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockMarkRead).toHaveBeenCalledWith('a1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboardData'] });
  });
});

describe('useSaveArticle', () => {
  it('saves the article and invalidates the saved-articles query', async () => {
    mockSave.mockResolvedValue(undefined);
    const { wrapper, invalidateSpy } = createHarness();
    const { result } = renderHook(() => useSaveArticle(), { wrapper });

    result.current.mutate('a2');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSave).toHaveBeenCalledWith('a2');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['news', 'saved'] });
  });
});

describe('useUnsaveArticle', () => {
  it('unsaves the article and invalidates the saved-articles query', async () => {
    mockUnsave.mockResolvedValue(undefined);
    const { wrapper, invalidateSpy } = createHarness();
    const { result } = renderHook(() => useUnsaveArticle(), { wrapper });

    result.current.mutate('a3');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUnsave).toHaveBeenCalledWith('a3');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['news', 'saved'] });
  });
});

describe('useAnalyzeArticle', () => {
  it('returns the analysis and invalidates news, dashboard, and matching caches', async () => {
    // Arrange
    mockAnalyze.mockResolvedValue(ANALYZE_RESPONSE);
    const { wrapper, invalidateSpy } = createHarness();
    const { result } = renderHook(() => useAnalyzeArticle(), { wrapper });

    // Act
    result.current.mutate('a1');

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // mutationFn receives the article id as first arg (plus TanStack context)
    expect(mockAnalyze.mock.calls[0][0]).toBe('a1');
    expect(result.current.data).toEqual(ANALYZE_RESPONSE);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['news'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboardData'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['matching'] });
  });

  it('surfaces errors without invalidating caches', async () => {
    mockAnalyze.mockRejectedValue(new Error('analyze failed'));
    const { wrapper, invalidateSpy } = createHarness();
    const { result } = renderHook(() => useAnalyzeArticle(), { wrapper });

    result.current.mutate('a1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('analyze failed');
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
