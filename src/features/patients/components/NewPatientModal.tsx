import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, UserPlus, X } from 'lucide-react';
import { ApiError } from '@lib/http/errors';
import { useCreatePatient } from '@features/patients/queries';
import {
  CreatePatientInputSchema,
  type CreatePatientInput,
  type Patient,
} from '@features/patients/schemas';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (patient: Patient) => void;
}

type FormState = {
  nombre: string;
  expedienteExternoId: string;
  fechaNacimiento: string;
  genero: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  nombre: '',
  expedienteExternoId: '',
  fechaNacimiento: '',
  genero: '',
};

const GENDER_OPTIONS = ['Femenino', 'Masculino', 'Otro', 'Prefiere no decir'] as const;

const FIELD_LABELS: Record<keyof FormState, string> = {
  nombre: 'Nombre completo',
  expedienteExternoId: 'Expediente externo',
  fechaNacimiento: 'Fecha de nacimiento',
  genero: 'Género',
};

function buildFieldErrors(
  details: ReadonlyArray<{ field: string; message: string }>,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const d of details) {
    const key = d.field as keyof FormState;
    if (key in EMPTY_FORM) errors[key] = d.message;
  }
  return errors;
}

/** Extracts field-level Zod parse errors into a FieldErrors map. */
function extractPatientZodErrors(issues: Array<{ path: Array<string | number>; message: string }>): FieldErrors {
  const localErrors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof FormState | undefined;
    if (key && key in EMPTY_FORM && !localErrors[key]) {
      localErrors[key] = issue.message;
    }
  }
  return localErrors;
}

/** Maps an ApiError to field errors or a global error message for the patient form. */
function handlePatientApiError(
  err: ApiError,
  setFieldErrors: (e: FieldErrors) => void,
  setGlobalError: (msg: string) => void,
): void {
  if (err.isValidation && err.fieldErrors.length > 0) {
    setFieldErrors(buildFieldErrors(err.fieldErrors));
    return;
  }
  if (err.isConflict) {
    setFieldErrors({ expedienteExternoId: 'Ya existe un paciente con este expediente' });
    return;
  }
  setGlobalError(err.message || 'No se pudo crear el paciente.');
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const mutation = useCreatePatient();

  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setGlobalError(null);
    mutation.reset();
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !mutation.isPending) onClose();
    };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [isOpen, mutation.isPending, onClose]);

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  if (!isOpen) return null;

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (globalError) setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    const parsed = CreatePatientInputSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(extractPatientZodErrors(parsed.error.issues));
      return;
    }

    try {
      const created = await mutation.mutateAsync(parsed.data as CreatePatientInput);
      onCreated?.(created);
    } catch (err) {
      if (err instanceof ApiError) {
        handlePatientApiError(err, setFieldErrors, setGlobalError);
        return;
      }
      setGlobalError(err instanceof Error ? err.message : 'No se pudo crear el paciente.');
    }
  };

  const isPending = mutation.isPending;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 max-w-none w-full h-full"
      aria-modal="true"
      aria-labelledby="new-patient-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={isPending ? undefined : onClose}
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
      />

      <div className="relative bg-surface rounded-2xl shadow-elevated border border-border-subtle w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <header className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-subtle text-primary shrink-0">
              <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="new-patient-title"
                className="text-sm font-semibold tracking-tight text-text-primary"
              >
                Nuevo paciente
              </h2>
              <p className="text-[11px] text-text-muted tracking-tight">
                Quedará asignado a tu cartera automáticamente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto" noValidate>
          <div className="px-5 py-4 space-y-4">
            <Field
              id="np-nombre"
              label={FIELD_LABELS.nombre}
              error={fieldErrors.nombre}
              required
            >
              <input
                ref={firstFieldRef}
                id="np-nombre"
                type="text"
                value={form.nombre}
                onChange={(e) => updateField('nombre', e.target.value)}
                disabled={isPending}
                maxLength={200}
                autoComplete="off"
                className={inputClass(Boolean(fieldErrors.nombre))}
                placeholder="Ej. María Fernanda López"
              />
            </Field>

            <Field
              id="np-expediente"
              label={FIELD_LABELS.expedienteExternoId}
              error={fieldErrors.expedienteExternoId}
              required
              hint="Identificador del expediente en el hospital"
            >
              <input
                id="np-expediente"
                type="text"
                value={form.expedienteExternoId}
                onChange={(e) => updateField('expedienteExternoId', e.target.value)}
                disabled={isPending}
                maxLength={100}
                autoComplete="off"
                className={`${inputClass(Boolean(fieldErrors.expedienteExternoId))} font-mono`}
                placeholder="HG-2024-10238"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                id="np-fecha"
                label={FIELD_LABELS.fechaNacimiento}
                error={fieldErrors.fechaNacimiento}
                required
              >
                <input
                  id="np-fecha"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => updateField('fechaNacimiento', e.target.value)}
                  disabled={isPending}
                  max={today}
                  className={inputClass(Boolean(fieldErrors.fechaNacimiento))}
                />
              </Field>

              <Field
                id="np-genero"
                label={FIELD_LABELS.genero}
                error={fieldErrors.genero}
                required
              >
                <select
                  id="np-genero"
                  value={form.genero}
                  onChange={(e) => updateField('genero', e.target.value)}
                  disabled={isPending}
                  className={inputClass(Boolean(fieldErrors.genero))}
                >
                  <option value="" disabled>Seleccionar género</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {globalError && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-[13px] text-danger"
              >
                <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>{globalError}</span>
              </div>
            )}
          </div>

          <footer className="px-5 py-3 border-t border-border-subtle flex items-center justify-end gap-2 bg-surface-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-border-subtle bg-surface text-sm font-medium text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creando…' : 'Crear paciente'}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
};

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ id, label, error, required, hint, children }) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-[12px] font-medium text-text-primary tracking-tight"
    >
      {label}
      {required && <span aria-hidden="true" className="text-danger ml-0.5">*</span>}
    </label>
    {children}
    {renderPatientFieldHelper(id, error, hint)}
  </div>
);

function renderPatientFieldHelper(id: string, error?: string, hint?: string): React.ReactNode {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="text-[11px] text-danger tracking-tight">
        {error}
      </p>
    );
  }
  if (hint) {
    return <p className="text-[11px] text-text-subtle tracking-tight">{hint}</p>;
  }
  return null;
}

function inputClass(hasError: boolean): string {
  const base =
    'h-9 w-full rounded-md border bg-surface px-3 text-sm text-text-primary placeholder-text-subtle transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed';
  return hasError
    ? `${base} border-danger/50 focus:border-danger focus:ring-danger/20`
    : `${base} border-border-subtle focus:border-primary/40 focus:ring-primary/15`;
}
