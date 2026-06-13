
const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  jest.resetModules();
});

describe('env', () => {
  it('exposes the validated environment variables when all are present', async () => {
    const { env } = await import('./env');

    expect(env).toEqual({
      VITE_API_BASE_URL: 'http://localhost:8080',
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_APP_ID: 'test-app-id',
    });
  });

  it('throws at import time when a required variable is empty, listing it', async () => {
    process.env.VITE_FIREBASE_API_KEY = '';

    await expect(import('./env')).rejects.toThrow(
      /Faltan variables de entorno requeridas[\s\S]*VITE_FIREBASE_API_KEY/,
    );
  });

  it('throws when the API base URL is not a valid URL', async () => {
    process.env.VITE_API_BASE_URL = 'not-a-url';

    await expect(import('./env')).rejects.toThrow(/VITE_API_BASE_URL/);
  });

  it('lists every missing variable in the error message', async () => {
    process.env.VITE_FIREBASE_PROJECT_ID = '';
    process.env.VITE_FIREBASE_APP_ID = '';

    let caught: unknown;
    try {
      await import('./env');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(Error);
    if (caught instanceof Error) {
      expect(caught.message).toContain('VITE_FIREBASE_PROJECT_ID');
      expect(caught.message).toContain('VITE_FIREBASE_APP_ID');
      expect(caught.message).toContain('.env.example');
    }
  });
});
