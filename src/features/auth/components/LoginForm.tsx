import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { Alert } from '@ui/feedback/Alert';
import { LoginCredentialsSchema } from '@features/auth/schemas';
import type { LoginCredentials, UserRole } from '@features/auth/schemas';
import { useAuthStore } from '@features/auth/store';
import { signInWithEmail } from '@features/auth/api';
import { describeAuthError } from '@features/auth/errors';

const LANDING_BY_ROLE: Record<UserRole, string> = {
  DOCTOR: '/doctor/dashboard',
  COO: '/coo/dashboard',
  CMO: '/cmo/dashboard',
};

type FieldErrors = Partial<Record<keyof LoginCredentials, string>>;

interface LocationState {
  from?: string;
}

const INPUT_BASE =
  'w-full h-12 pl-11 pr-4 rounded-xl bg-surface text-[14.5px] text-text-primary placeholder:text-text-subtle ' +
  'border outline-none transition-all focus:ring-4 focus:ring-primary/20';

const INPUT_IDLE = 'border-border-strong hover:border-[#C7CADB] focus:border-primary';
const INPUT_ERROR = 'border-danger focus:border-danger focus:ring-danger/20';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

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
      const user = await signInWithEmail(parsed.data.email, parsed.data.password);
      login(user);
      setSuccess('¡Bienvenido!');
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
      {globalError && (
        <div className="mb-4">
          <Alert type="error" message={globalError} onClose={() => setGlobalError('')} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="mb-[18px]">
          <label
            htmlFor="email"
            className="block mb-2 text-[13px] font-semibold text-text-primary tracking-[-0.005em]"
          >
            Correo electrónico
          </label>
          <div className="relative flex items-center group">
            <Mail
              size={18}
              strokeWidth={1.8}
              className={`absolute left-[14px] pointer-events-none transition-colors ${
                errors.email ? 'text-danger' : 'text-text-subtle group-focus-within:text-primary'
              }`}
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@clinica.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              aria-invalid={Boolean(errors.email)}
              className={`${INPUT_BASE} ${errors.email ? INPUT_ERROR : INPUT_IDLE}`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-[18px]">
          <label
            htmlFor="password"
            className="block mb-2 text-[13px] font-semibold text-text-primary tracking-[-0.005em]"
          >
            Contraseña
          </label>
          <div className="relative flex items-center group">
            <Lock
              size={18}
              strokeWidth={1.8}
              className={`absolute left-[14px] pointer-events-none transition-colors ${
                errors.password ? 'text-danger' : 'text-text-subtle group-focus-within:text-primary'
              }`}
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              aria-invalid={Boolean(errors.password)}
              className={`${INPUT_BASE} pr-11 ${errors.password ? INPUT_ERROR : INPUT_IDLE}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="absolute right-1.5 w-9 h-9 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-muted flex items-center justify-center transition-colors"
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Eye size={18} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.password}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between mt-1.5 mb-6">
          <label className="inline-flex items-center gap-2.5 text-[13.5px] text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="sr-only peer"
            />
            <span
              className="w-[18px] h-[18px] rounded-md border-[1.5px] border-border-strong bg-surface flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary"
            >
              {remember && <Check size={11} strokeWidth={3} className="text-white" aria-hidden="true" />}
            </span>
            {' '}Mantener sesión iniciada
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[50px] rounded-xl text-white text-[15px] font-semibold tracking-[-0.005em] inline-flex items-center justify-center gap-2.5 transition-[transform,box-shadow,filter] duration-150 disabled:opacity-80 disabled:cursor-not-allowed active:translate-y-px hover:brightness-105"
          style={{
            background: 'linear-gradient(135deg, #7C68FF 0%, #5B4BE8 60%, #4F4BE8 100%)',
            boxShadow:
              '0 10px 24px -10px rgba(91,75,232,.55), inset 0 1px 0 rgba(255,255,255,.18)',
          }}
        >
          {isLoading ? (
            <>
              <span className="w-[18px] h-[18px] rounded-full border-2 border-white/40 border-t-white animate-spin" />
              <span>Verificando…</span>
            </>
          ) : (
            <>
              <span>Iniciar sesión</span>
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </>
  );
};
