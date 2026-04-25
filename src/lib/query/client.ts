import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@lib/http/errors';

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function handleApiError(error: unknown): void {
  if (error instanceof ApiError && error.isUnauthorized) {
    unauthorizedHandler?.();
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && (error.isUnauthorized || error.isNotFound)) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
    queryCache: undefined,
  });
}

export const queryClient = createQueryClient();

queryClient.getQueryCache().config.onError = handleApiError;
queryClient.getMutationCache().config.onError = handleApiError;
