const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateShortFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
});

export function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: string | undefined): string {
  if (!value) return '—';
  const parsed = parseDate(value);
  return parsed ? dateFormatter.format(parsed) : '—';
}

export function formatDateShort(value: string | undefined): string {
  if (!value) return '—';
  const parsed = parseDate(value);
  return parsed ? dateShortFormatter.format(parsed) : '—';
}

export function calculateAge(fechaNacimiento: string, reference: Date = new Date()): number | null {
  const birth = parseDate(fechaNacimiento);
  if (!birth) return null;
  let age = reference.getFullYear() - birth.getFullYear();
  const m = reference.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && reference.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function formatRelative(days: number): string {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 30) return `hace ${days} d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} m`;
  const years = Math.floor(days / 365);
  return `hace ${years} a`;
}

export function formatRelativeFromNow(value: string, reference: Date = new Date()): string {
  const parsed = parseDate(value);
  if (!parsed) return '—';
  const days = daysBetween(parsed, reference);
  return formatRelative(days);
}

export function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}
