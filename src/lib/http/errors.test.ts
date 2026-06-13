import { ApiError, BackendErrorSchema, BackendFieldErrorSchema } from './errors';

describe('BackendFieldErrorSchema', () => {
  it('parses a valid field error', () => {
    // Arrange
    const input = { field: 'email', message: 'Formato inválido' };

    // Act
    const result = BackendFieldErrorSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it('rejects a field error without message', () => {
    const result = BackendFieldErrorSchema.safeParse({ field: 'email' });

    expect(result.success).toBe(false);
  });
});

describe('BackendErrorSchema', () => {
  it('parses a complete backend error', () => {
    const input = {
      timestamp: '2026-06-12T10:00:00Z',
      status: 400,
      error: 'Bad Request',
      message: 'Datos inválidos',
      details: [{ field: 'email', message: 'Requerido' }],
    };

    const result = BackendErrorSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(400);
      expect(result.data.details).toEqual([{ field: 'email', message: 'Requerido' }]);
    }
  });

  it('parses without optional timestamp and details', () => {
    const input = { status: 500, error: 'Internal', message: 'Boom' };

    const result = BackendErrorSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it('accepts null details (nullable)', () => {
    const input = { status: 404, error: 'Not Found', message: 'No existe', details: null };

    const result = BackendErrorSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.details).toBeNull();
    }
  });

  it('passes through unknown extra keys', () => {
    const input = {
      status: 409,
      error: 'Conflict',
      message: 'Duplicado',
      traceId: 'abc-123',
    };

    const result = BackendErrorSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.traceId).toBe('abc-123');
    }
  });

  it('rejects when status is missing', () => {
    const result = BackendErrorSchema.safeParse({ error: 'x', message: 'y' });

    expect(result.success).toBe(false);
  });

  it('rejects when status is not a number', () => {
    const result = BackendErrorSchema.safeParse({ status: '400', error: 'x', message: 'y' });

    expect(result.success).toBe(false);
  });
});

describe('ApiError', () => {
  it('exposes status, message, name and defaults', () => {
    const err = new ApiError(500, 'Error interno');

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.status).toBe(500);
    expect(err.message).toBe('Error interno');
    expect(err.fieldErrors).toEqual([]);
    expect(err.metadata).toEqual({});
  });

  it('stores fieldErrors and metadata when provided', () => {
    const fieldErrors = [{ field: 'email', message: 'Requerido' }];
    const metadata = { traceId: 'abc' };

    const err = new ApiError(400, 'Validación', fieldErrors, metadata);

    expect(err.fieldErrors).toEqual(fieldErrors);
    expect(err.metadata).toEqual(metadata);
  });

  it.each([
    [401, 'isUnauthorized'],
    [403, 'isForbidden'],
    [404, 'isNotFound'],
    [409, 'isConflict'],
    [400, 'isValidation'],
  ] as const)('status %i activates only %s', (status, getter) => {
    const err = new ApiError(status, 'x');

    const getters = {
      isUnauthorized: err.isUnauthorized,
      isForbidden: err.isForbidden,
      isNotFound: err.isNotFound,
      isConflict: err.isConflict,
      isValidation: err.isValidation,
    };

    const expected = Object.fromEntries(
      Object.keys(getters).map((name) => [name, name === getter]),
    );
    expect(getters).toEqual(expected);
  });

  it('all status getters are false for an unrelated status', () => {
    const err = new ApiError(500, 'x');

    expect(err.isUnauthorized).toBe(false);
    expect(err.isForbidden).toBe(false);
    expect(err.isNotFound).toBe(false);
    expect(err.isConflict).toBe(false);
    expect(err.isValidation).toBe(false);
  });
});
