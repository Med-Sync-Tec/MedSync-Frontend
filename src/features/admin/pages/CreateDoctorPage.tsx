import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, PasswordInput } from '@ui/inputs/Input';
import { Button } from '@ui/buttons/Button';
import { Alert } from '@ui/feedback/Alert';
import { ApiError } from '@lib/http/errors';
import {
  CreateDoctorSchema,
  type CreateDoctorInput,
  type Specialty,
  type CreatedUser,
} from '@features/admin/schemas';
import { createDoctor, listActiveSpecialties } from '@features/admin/api';

type FieldErrors = Partial<Record<keyof CreateDoctorInput, string>>;

const EMPTY_FORM: CreateDoctorInput = {
  nombre: '',
  correo: '',
  password: '',
  especialidadId: '',
};

function describeApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isConflict) return 'El correo ya está registrado.';
    if (err.isForbidden) return 'Solo el COO puede crear médicos.';
    if (err.isUnauthorized) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    if (err.isValidation) {
      const first = err.fieldErrors[0];
      return first ? `${first.field}: ${first.message}` : err.message;
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Ocurrió un error inesperado.';
}

export const CreateDoctorPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateDoctorInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [created, setCreated] = useState<CreatedUser | null>(null);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtiesError, setSpecialtiesError] = useState('');
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingSpecialties(true);
    listActiveSpecialties()
      .then((list) => {
        if (cancelled) return;
        setSpecialties(list);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setSpecialtiesError(describeApiError(err));
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingSpecialties(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof CreateDoctorInput>(field: K, value: CreateDoctorInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const parsed = CreateDoctorSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field as keyof CreateDoctorInput]) {
          fieldErrors[field as keyof CreateDoctorInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const result = await createDoctor(parsed.data);
      setCreated(result);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      setServerError(describeApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (created) {
    return (
      <main className="w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-surface rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px] text-green-600 dark:text-green-400">
              person_add
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Médico creado</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200">{created.nombre}</span> ya
            puede iniciar sesión con el correo{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200">{created.correo}</span>.
          </p>
          {created.especialidadNombre && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Especialidad asignada: {created.especialidadNombre}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button fullWidth variant="secondary" onClick={() => setCreated(null)}>
              Crear otro médico
            </Button>
            <Button fullWidth onClick={() => navigate('/coo/dashboard')}>
              Volver al panel
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crear médico</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Da de alta un nuevo doctor en la plataforma. Recibirá la contraseña que definas aquí.
        </p>
      </header>

      <div className="bg-surface rounded-2xl shadow-xl p-6 sm:p-8 space-y-4">
        {serverError && <Alert type="error" message={serverError} onClose={() => setServerError('')} />}
        {specialtiesError && (
          <Alert
            type="error"
            message={`No se pudieron cargar las especialidades: ${specialtiesError}`}
            onClose={() => setSpecialtiesError('')}
          />
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Nombre completo"
            id="doctor-nombre"
            name="nombre"
            type="text"
            placeholder="Dr. Juan Pérez"
            value={form.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            error={errors.nombre}
            autoComplete="name"
          />
          <Input
            label="Correo electrónico"
            id="doctor-correo"
            name="correo"
            type="email"
            placeholder="doctor@medsync.local"
            value={form.correo}
            onChange={(e) => updateField('correo', e.target.value)}
            error={errors.correo}
            autoComplete="email"
          />
          <PasswordInput
            label="Contraseña inicial"
            id="doctor-password"
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />

          <div className="space-y-1.5">
            <label
              htmlFor="doctor-especialidad"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Especialidad
            </label>
            <select
              id="doctor-especialidad"
              name="especialidadId"
              value={form.especialidadId}
              onChange={(e) => updateField('especialidadId', e.target.value)}
              disabled={loadingSpecialties || specialties.length === 0}
              className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-900 transition-colors disabled:opacity-60"
              aria-invalid={Boolean(errors.especialidadId)}
            >
              <option value="" disabled>
                {loadingSpecialties ? 'Cargando especialidades...' : 'Selecciona una especialidad'}
              </option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <p
              className={`text-xs font-medium mt-1 h-4 leading-none ${
                errors.especialidadId ? 'text-red-500' : 'invisible select-none'
              }`}
            >
              {errors.especialidadId ?? ''}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate('/coo/dashboard')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              {isLoading ? 'Creando...' : 'Crear médico'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};
