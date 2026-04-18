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
  
  // Field errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
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

    // Mock API Call para la base de datos
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
      
      // Simulate Redirect
      // setTimeout(() => {
      //   window.location.href = '/dashboard';
      // }, 1500);

    } catch (err: any) {
      setGlobalError(err.message || 'Error desconocido al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Alerta flotante desvinculada del form normal para no empujar la UI */}
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

        <div className="flex items-center justify-between pt-1 pb-2">
          <Checkbox 
            label="Recordarme" 
            id="remember-me" 
            name="remember-me" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <a href="#" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isLoading} className="py-4 text-base">
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
            <a href="#" className="font-bold text-primary hover:text-primary-hover transition-colors">
              Solicitar acceso
            </a>
          </p>
        </div>
      </form>
    </>
  );
};
