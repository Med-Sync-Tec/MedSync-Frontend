import { MutationObserver } from '@tanstack/react-query';
import { ApiError } from '@lib/http/errors';
import { createQueryClient, queryClient, setUnauthorizedHandler } from './client';

afterEach(() => {
  setUnauthorizedHandler(null);
  queryClient.clear();
});

function getRetryFn() {
  const retry = createQueryClient().getDefaultOptions().queries?.retry;
  if (typeof retry !== 'function') {
    throw new TypeError('expected retry to be a function');
  }
  return retry;
}

describe('createQueryClient', () => {
  it('configures a 30 second staleTime and refetchOnWindowFocus', () => {
    const client = createQueryClient();

    const queries = client.getDefaultOptions().queries;
    expect(queries?.staleTime).toBe(30_000);
    expect(queries?.refetchOnWindowFocus).toBe(true);
  });

  describe('default retry function', () => {

    it('does not retry on 401 unauthorized errors', () => {
      const retry = getRetryFn();

      expect(retry(0, new ApiError(401, 'No autorizado'))).toBe(false);
    });

    it('does not retry on 404 not found errors', () => {
      const retry = getRetryFn();

      expect(retry(0, new ApiError(404, 'No existe'))).toBe(false);
    });

    it('retries once for other errors', () => {
      const retry = getRetryFn();

      expect(retry(0, new ApiError(500, 'Error interno'))).toBe(true);
      expect(retry(1, new ApiError(500, 'Error interno'))).toBe(false);
    });

    it('retries once for non-ApiError errors', () => {
      const retry = getRetryFn();

      expect(retry(0, new Error('boom'))).toBe(true);
      expect(retry(1, new Error('boom'))).toBe(false);
    });
  });
});

describe('unauthorized handler wiring on the shared queryClient', () => {
  let handler: jest.Mock<void, []>;

  beforeEach(() => {
    handler = jest.fn();
    setUnauthorizedHandler(handler);
  });

  it('invokes the handler when a query fails with 401', async () => {
    await queryClient
      .fetchQuery({
        queryKey: ['test-401'],
        queryFn: () => Promise.reject(new ApiError(401, 'No autorizado')),
        retry: false,
      })
      .catch(() => undefined);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not invoke the handler for non-401 query errors', async () => {
    await queryClient
      .fetchQuery({
        queryKey: ['test-500'],
        queryFn: () => Promise.reject(new ApiError(500, 'Error interno')),
        retry: false,
      })
      .catch(() => undefined);

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not invoke the handler for plain errors', async () => {
    await queryClient
      .fetchQuery({
        queryKey: ['test-plain'],
        queryFn: () => Promise.reject(new Error('boom')),
        retry: false,
      })
      .catch(() => undefined);

    expect(handler).not.toHaveBeenCalled();
  });

  it('invokes the handler when a mutation fails with 401', async () => {
    const observer = new MutationObserver(queryClient, {
      mutationFn: () => Promise.reject(new ApiError(401, 'No autorizado')),
      retry: false,
    });

    await observer.mutate().catch(() => undefined);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not invoke the handler for non-401 mutation errors', async () => {
    const observer = new MutationObserver(queryClient, {
      mutationFn: () => Promise.reject(new ApiError(403, 'Prohibido')),
      retry: false,
    });

    await observer.mutate().catch(() => undefined);

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not crash on 401 when the handler is unset', async () => {
    setUnauthorizedHandler(null);

    const result = queryClient
      .fetchQuery({
        queryKey: ['test-401-nohandler'],
        queryFn: () => Promise.reject(new ApiError(401, 'No autorizado')),
        retry: false,
      })
      .catch((err: unknown) => err);

    await expect(result).resolves.toBeInstanceOf(ApiError);
  });
});
