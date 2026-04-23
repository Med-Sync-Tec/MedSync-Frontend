import { z } from 'zod';

export const BackendFieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export const BackendErrorSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number(),
  error: z.string(),
  message: z.string(),
  details: z.array(BackendFieldErrorSchema).optional().nullable(),
});

export type BackendFieldError = z.infer<typeof BackendFieldErrorSchema>;
export type BackendError = z.infer<typeof BackendErrorSchema>;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: readonly BackendFieldError[];

  constructor(status: number, message: string, fieldErrors: readonly BackendFieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidation(): boolean {
    return this.status === 400;
  }
}
