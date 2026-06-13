import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const mockAuth = {
  authStateReady: jest.fn<Promise<void>, []>(),
  currentUser: null as null | { getIdToken: () => Promise<string> },
};

// Getter para diferir el acceso: el factory corre antes de que se inicialice mockAuth.
jest.mock('@lib/firebase/client', () => ({
  get auth() {
    return mockAuth;
  },
}));

import { http, apiFetch } from './client';
import { ApiError } from './errors';

let lastConfig: InternalAxiosRequestConfig | undefined;

function respondWith(data: unknown, status = 200, statusText = 'OK'): void {
  http.defaults.adapter = (config) => {
    lastConfig = config;
    const response: AxiosResponse = { data, status, statusText, headers: {}, config };
    return Promise.resolve(response);
  };
}

function rejectWithBackendBody(body: unknown, status: number, statusText = ''): void {
  http.defaults.adapter = (config) => {
    lastConfig = config;
    const response: AxiosResponse = { data: body, status, statusText, headers: {}, config };
    return Promise.reject(
      new AxiosError(
        `Request failed with status code ${status}`,
        'ERR_BAD_REQUEST',
        config,
        null,
        response,
      ),
    );
  };
}

function rejectWith(error: unknown): void {
  http.defaults.adapter = (config) => {
    lastConfig = config;
    return Promise.reject(error);
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  lastConfig = undefined;
  mockAuth.authStateReady.mockResolvedValue(undefined);
  mockAuth.currentUser = null;
});

describe('http instance', () => {
  it('uses the env base URL without trailing slash', () => {
    expect(http.defaults.baseURL).toBe('http://localhost:8080');
  });
});

describe('apiFetch — auth header injection', () => {
  it('adds Authorization Bearer header when a user is signed in', async () => {
    // Arrange
    mockAuth.currentUser = { getIdToken: jest.fn().mockResolvedValue('tok-123') };
    respondWith({ ok: true });

    // Act
    await apiFetch('/api/patients');

    // Assert
    expect(mockAuth.authStateReady).toHaveBeenCalled();
    expect(lastConfig?.headers.Authorization).toBe('Bearer tok-123');
  });

  it('sends no Authorization header when there is no current user', async () => {
    respondWith({ ok: true });

    await apiFetch('/api/public');

    expect(mockAuth.authStateReady).toHaveBeenCalled();
    expect(lastConfig?.headers.Authorization).toBeUndefined();
  });

  it('skips auth entirely when options.auth is false', async () => {
    mockAuth.currentUser = { getIdToken: jest.fn().mockResolvedValue('tok-123') };
    respondWith({ ok: true });

    await apiFetch('/api/open', { auth: false });

    expect(mockAuth.authStateReady).not.toHaveBeenCalled();
    expect(lastConfig?.headers.Authorization).toBeUndefined();
  });

  it('removes the X-Auth-Skip marker header before sending', async () => {
    respondWith({ ok: true });

    await apiFetch('/api/open', { auth: false });

    expect(lastConfig?.headers['X-Auth-Skip']).toBeUndefined();
  });
});

describe('apiFetch — request building', () => {
  it('prefixes the path with a slash when missing', async () => {
    respondWith({ ok: true });

    await apiFetch('api/users');

    expect(lastConfig?.url).toBe('/api/users');
  });

  it('keeps an already-slashed path as is', async () => {
    respondWith({ ok: true });

    await apiFetch('/api/users');

    expect(lastConfig?.url).toBe('/api/users');
  });

  it('defaults to GET', async () => {
    respondWith({ ok: true });

    await apiFetch('/api/users');

    expect(lastConfig?.method?.toUpperCase()).toBe('GET');
  });

  it('sends method and body for POST requests', async () => {
    respondWith({ created: true }, 201);

    await apiFetch('/api/users', { method: 'POST', body: { name: 'Ana' } });

    expect(lastConfig?.method?.toUpperCase()).toBe('POST');
    expect(lastConfig?.data).toBe(JSON.stringify({ name: 'Ana' }));
  });

  it('returns the parsed response data on success', async () => {
    respondWith({ id: '1', name: 'Ana' });

    const result = await apiFetch<{ id: string; name: string }>('/api/users/1');

    expect(result).toEqual({ id: '1', name: 'Ana' });
  });

  it('returns undefined for 204 No Content responses', async () => {
    respondWith(null, 204, 'No Content');

    const result = await apiFetch<undefined>('/api/users/1', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });
});

describe('apiFetch — error handling', () => {
  it('maps a parseable backend error body to ApiError with field errors and metadata', async () => {
    rejectWithBackendBody(
      {
        timestamp: '2026-06-12T10:00:00Z',
        status: 400,
        error: 'Bad Request',
        message: 'Datos inválidos',
        details: [{ field: 'email', message: 'Requerido' }],
        traceId: 'abc-123',
      },
      400,
      'Bad Request',
    );

    const promise = apiFetch('/api/users', { method: 'POST', body: {} });

    await expect(promise).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Datos inválidos',
      fieldErrors: [{ field: 'email', message: 'Requerido' }],
      metadata: {
        timestamp: '2026-06-12T10:00:00Z',
        error: 'Bad Request',
        traceId: 'abc-123',
      },
    });
  });

  it('uses an empty fieldErrors array when backend details is null', async () => {
    rejectWithBackendBody(
      { status: 404, error: 'Not Found', message: 'No existe', details: null },
      404,
    );

    let caught: unknown;
    try {
      await apiFetch('/api/users/999');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    if (caught instanceof ApiError) {
      expect(caught.status).toBe(404);
      expect(caught.isNotFound).toBe(true);
      expect(caught.fieldErrors).toEqual([]);
    }
  });

  it('falls back to HTTP status and statusText when the error body is not parseable', async () => {
    rejectWithBackendBody('<html>Internal Server Error</html>', 500, 'Internal Server Error');

    let caught: unknown;
    try {
      await apiFetch('/api/users');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    if (caught instanceof ApiError) {
      expect(caught.status).toBe(500);
      expect(caught.message).toBe('Internal Server Error');
    }
  });

  it('falls back to the axios error message when statusText is empty', async () => {
    rejectWithBackendBody({ unexpected: 'shape' }, 502, '');

    let caught: unknown;
    try {
      await apiFetch('/api/users');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    if (caught instanceof ApiError) {
      expect(caught.status).toBe(502);
      expect(caught.message).toBe('Request failed with status code 502');
    }
  });

  it('maps a network error (no response) to ApiError with status 0', async () => {
    rejectWith(new AxiosError('Network Error', 'ERR_NETWORK'));

    let caught: unknown;
    try {
      await apiFetch('/api/users');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    if (caught instanceof ApiError) {
      expect(caught.status).toBe(0);
      expect(caught.message).toBe('Network Error');
    }
  });

  it('passes through non-Axios errors unchanged', async () => {
    const original = new Error('boom');
    rejectWith(original);

    let caught: unknown;
    try {
      await apiFetch('/api/users');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBe(original);
    expect(caught).not.toBeInstanceOf(ApiError);
  });
});
