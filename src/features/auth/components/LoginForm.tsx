import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, PasswordInput } from '@ui/inputs/Input';
import { Checkbox } from '@ui/inputs/Checkbox';
import { Button } from '@ui/buttons/Button';
import { Alert } from '@ui/feedback/Alert';
import { LoginCredentialsSchema } from '@features/auth/schemas';
import type { AuthUser, LoginCredentials } from '@features/auth/schemas';
import { useAuthStore } from '@features/auth/store';

const MOCK_CREDENTIALS = {
  email: 'admin@medsync.com',
  password: '123456',
} as const;

const MOCK_USER: AuthUser = {
  id: 'mock-admin-1',
  email: MOCK_CREDENTIALS.email,
  name: 'Admin Demo',
  role: 'doctor',
};

const DEFAULT_LANDING = '/medical-record/history';

type FieldErrors = Partial<Record<keyof LoginCredentials, string>>;

interface LocationState {
  from?: string;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setSuccess('');

    const parsed = LoginCredentialsSchema.safeParse({ email, password, rememberMe });
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
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (
            parsed.data.email === MOCK_CREDENTIALS.email &&
            parsed.data.password === MOCK_CREDENTIALS.password
          ) {
            resolve();
          } else {
            reject(
              new Error('Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.')
            );
          }
        }, 1000);
      });

      login(MOCK_USER);
      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      const redirectTo = (location.state as LocationState | null)?.from ?? DEFAULT_LANDING;
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión';
      setGlobalError(message);
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

        <div className="flex items-center justify-between">
          <Checkbox
            label="Recordarme"
            id="remember-me"
            name="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <a
            href="#"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

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
            <a
              href="#"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Solicitar acceso
            </a>
          </p>
        </div>
      </form>
    </>
  );
};
