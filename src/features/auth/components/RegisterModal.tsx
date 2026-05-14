import React, { useState } from 'react';
import { Input } from '@ui/inputs/Input';
import { Button } from '@ui/buttons/Button';
import { Alert } from '@ui/feedback/Alert';
import { RegisterSchema } from '@features/auth/schemas';
import type { RegisterInput } from '@features/auth/schemas';
import { registerUser } from '@features/auth/api';
import { describeAuthError } from '@features/auth/errors';

type RegisterRole = 'DOCTOR' | 'COO';

const ROLES: { value: RegisterRole; label: string }[] = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'COO', label: 'COO' },
];

type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

interface RegisterModalProps {
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState<RegisterRole>('DOCTOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof RegisterInput) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = RegisterSchema.safeParse({ nombre, correo, rol });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field as keyof RegisterInput]) {
          fieldErrors[field as keyof RegisterInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await registerUser(parsed.data);
      setSuccess(true);
    } catch (err: unknown) {
      setError(describeAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Solicitar acceso</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Completa los datos para enviar tu solicitud.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px] text-green-600 dark:text-green-400">mark_email_read</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Solicitud enviada correctamente.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Un administrador revisará tu solicitud. Si es aprobada, recibirás un correo con un enlace para establecer tu contraseña.
            </p>
            <Button fullWidth onClick={onClose} className="mt-2">
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <Input
                label="Nombre completo"
                id="reg-nombre"
                name="nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); clearFieldError('nombre'); }}
                error={errors.nombre}
              />
              <Input
                label="Correo electrónico"
                id="reg-correo"
                name="correo"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={correo}
                onChange={(e) => { setCorreo(e.target.value); clearFieldError('correo'); }}
                error={errors.correo}
              />
              <div className="space-y-1.5">
                <label htmlFor="reg-rol" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rol
                </label>
                <select
                  id="reg-rol"
                  value={rol}
                  onChange={(e) => { setRol(e.target.value as RegisterRole); clearFieldError('rol'); }}
                  className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {errors.rol && <p className="text-xs text-danger">{errors.rol}</p>}
              </div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                className="py-3 text-sm bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-lg shadow-indigo-500/30 border-0 mt-1"
              >
                {isLoading ? 'Enviando solicitud...' : 'Solicitar acceso'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
