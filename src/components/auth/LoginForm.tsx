import React, { useState } from 'react';
import { Input, PasswordInput } from '../ui/inputs/Input';
import { Checkbox } from '../ui/inputs/Checkbox';
import { Button } from '../ui/buttons/Button';
import { Alert } from '../ui/feedback/Alert';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setSuccess('');
    setErrors({});

    let hasError = false;
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Este campo es obligatorio';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato del correo electrónico es inválido';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Este campo es obligatorio';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'admin@medsync.com' && password === '123456') {
            resolve(true);
          } else {
            reject(new Error('Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.'));
          }
        }, 1500);
      });
      setSuccess('¡Inicio de sesión exitoso! Redirigiendo a tu panel de control...');
    } catch (err: any) {
      setGlobalError(err.message || 'Error desconocido al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

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
            setErrors(prev => ({ ...prev, email: undefined }));
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
            setErrors(prev => ({ ...prev, password: undefined }));
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
          <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
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
            <a href="#" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
              Solicitar acceso
            </a>
          </p>
        </div>
      </form>
    </>
  );
};
