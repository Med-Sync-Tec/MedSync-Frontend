import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, PasswordInput } from '@ui/inputs/Input';
import { Button } from '@ui/buttons/Button';
import { Alert } from '@ui/feedback/Alert';
import type { RoleType } from '@ui/selectors/RoleSelector';
import { LoginCredentialsSchema } from '@features/auth/schemas';
import type { LoginCredentials, UserRole } from '@features/auth/schemas';
import { useAuthStore } from '@features/auth/store';
import { signInWithEmail } from '@features/auth/api';
import { describeAuthError } from '@features/auth/errors';
import { RegisterModal } from './RegisterModal';

const LANDING_BY_ROLE: Record<UserRole, string> = {
  DOCTOR: '/doctor/dashboard',
  COO: '/coo/dashboard',
  CMO: '/cmo/dashboard',
};

function toUserRole(role: RoleType): UserRole {
  return role.toUpperCase() as UserRole;
}

type FieldErrors = Partial<Record<keyof LoginCredentials, string>>;

interface LocationState {
  from?: string;
}

interface LoginFormProps {
  role: RoleType;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setSuccess('');

    const parsed = LoginCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field as keyof LoginCredentials]) {
          fieldErrors[field as keyof LoginCredentials] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const expectedRole = toUserRole(role);
      const user = await signInWithEmail(parsed.data.email, parsed.data.password, expectedRole);
      login(user);
      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      const redirectTo =
        (location.state as LocationState | null)?.from ?? LANDING_BY_ROLE[user.role];
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setGlobalError(describeAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const clearFieldError = (field: keyof LoginCredentials) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  return (
    <>
      {globalError && <Alert type="error" message={globalError} onClose={() => setGlobalError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Correo electrónico"
          id="email"
          name="email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError('email');
          }}
          error={errors.email}
        />

        <PasswordInput
          label="Contraseña"
          id="password"
          name="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError('password');
          }}
          error={errors.password}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className="py-3 text-sm bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-lg shadow-indigo-500/30 border-0 mt-1"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Solicitar acceso
            </button>
          </p>
        </div>
      </form>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </>
  );
};
