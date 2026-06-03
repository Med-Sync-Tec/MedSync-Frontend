import React, { useState } from 'react';
import { useAuthStore } from '@features/auth/store';
import { useEspecialidades } from '@features/matching/queries';
import { specialtyVisualById, SpecialtyBadge } from '@features/matching/specialtyVisuals';
import { updateUserPassword } from '@features/auth/api';
import { Mail, Key, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';

import { PasswordInput } from '@ui/inputs/Input';
import { Button } from '@ui/buttons/Button';

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export const ProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { byId: specialtiesById } = useEspecialidades();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!user) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setSuccessMsg('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/invalid-credential') {
        setErrorMsg('La contraseña actual es incorrecta.');
      } else {
        setErrorMsg('Ocurrió un error al actualizar la contraseña. Revisa que tu contraseña actual sea correcta.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDoctor = user.role.toUpperCase() === 'DOCTOR';
  const displayRole = isDoctor ? 'Doctor' : 'Administración';

  return (
    <div className="mx-auto max-w-3xl py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <UserIcon size={24} className="text-text-muted" />
          Mi Perfil
        </h1>
        <p className="text-sm text-text-muted">
          Gestiona tu información personal y tus preferencias de seguridad.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="rounded-xl border border-border-subtle bg-surface shadow-sm overflow-hidden flex flex-col items-center text-center p-6 gap-4">
            <span className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-subtle text-primary text-3xl font-semibold ring-4 ring-primary/10">
              {getInitials(user.name)}
            </span>
            <div className="flex flex-col items-center w-full min-w-0">
              <h2 className="text-lg font-semibold text-text-primary truncate w-full">
                {user.name}
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-text-muted mt-1 truncate w-full justify-center">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-text-muted mt-1 truncate w-full justify-center">
                <ShieldCheck size={14} className="shrink-0" />
                <span>{displayRole}</span>
              </div>

              {isDoctor && user.especialidadId && (
                <div className="mt-4">
                  <SpecialtyBadge visual={specialtyVisualById(user.especialidadId, specialtiesById)} size="md" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-border-subtle bg-surface shadow-sm overflow-hidden p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-4">
              <Key size={18} className="text-text-muted" />
              <h3 className="text-base font-semibold text-text-primary">
                Cambiar contraseña
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {errorMsg && (
                <div className="rounded-md bg-danger-subtle p-3 border border-danger/20">
                  <p className="text-sm text-danger-strong">{errorMsg}</p>
                </div>
              )}
              {successMsg && (
                <div className="rounded-md bg-success-subtle p-3 border border-success/20">
                  <p className="text-sm text-success-strong">{successMsg}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <PasswordInput
                  id="currentPassword"
                  label="Contraseña actual"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <PasswordInput
                    id="newPassword"
                    label="Nueva contraseña"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <PasswordInput
                    id="confirmPassword"
                    label="Confirmar contraseña"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}>
                  {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Actualizar contraseña
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
