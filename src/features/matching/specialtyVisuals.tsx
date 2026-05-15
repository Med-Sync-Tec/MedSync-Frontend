import React from 'react';
import {
  Apple,
  Baby,
  Bone,
  Brain,
  Bug,
  Droplet,
  Eye,
  FlaskConical,
  Flower,
  HandHeart,
  Heart,
  Microscope,
  Sparkles,
  Stethoscope,
  Wind,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import type { Especialidad } from './schemas';

export interface SpecialtyVisual {
  /** Stable slug from the catalog, lowercased & deduped. */
  key: string;
  /** Human-readable name (falls back to a humanized slug). */
  name: string;
  Icon: LucideIcon;
  /** Solid background used on the article-card left strip. */
  sidebar: string;
  /** Soft pill background. */
  badgeBg: string;
  /** Text color for the badge contents (matches {@code badgeBg}). */
  badgeText: string;
  /** Border that pairs with {@code badgeBg}. */
  badgeBorder: string;
  /** Tiny accent dot — used in dense layouts where a chip is too heavy. */
  dot: string;
}

/**
 * One visual per seeded specialty (see {@code V11__seed_especialidades.sql}).
 * Keyed by {@code slug} so a backend rename of {@code nombre} doesn't break
 * the mapping. Hue choices are intentionally distinct from neighbors in the
 * catalog ordering so adjacent tiles in the dashboard never collide.
 */
const SPECIALTY_BY_SLUG: Record<string, SpecialtyVisual> = {
  cardiologia: {
    key: 'cardiologia',
    name: 'Cardiología',
    Icon: Heart,
    sidebar: 'bg-rose-600',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  endocrinologia: {
    key: 'endocrinologia',
    name: 'Endocrinología',
    Icon: Droplet,
    sidebar: 'bg-orange-500',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  neurologia: {
    key: 'neurologia',
    name: 'Neurología',
    Icon: Brain,
    sidebar: 'bg-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  oncologia: {
    key: 'oncologia',
    name: 'Oncología',
    Icon: Microscope,
    sidebar: 'bg-purple-600',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  pediatria: {
    key: 'pediatria',
    name: 'Pediatría',
    Icon: Baby,
    sidebar: 'bg-pink-500',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-700',
    badgeBorder: 'border-pink-200',
    dot: 'bg-pink-500',
  },
  gastroenterologia: {
    key: 'gastroenterologia',
    name: 'Gastroenterología',
    Icon: Apple,
    sidebar: 'bg-lime-600',
    badgeBg: 'bg-lime-50',
    badgeText: 'text-lime-700',
    badgeBorder: 'border-lime-200',
    dot: 'bg-lime-500',
  },
  neumologia: {
    key: 'neumologia',
    name: 'Neumología',
    Icon: Wind,
    sidebar: 'bg-sky-500',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  dermatologia: {
    key: 'dermatologia',
    name: 'Dermatología',
    Icon: Sun,
    sidebar: 'bg-amber-500',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  ginecologia: {
    key: 'ginecologia',
    name: 'Ginecología',
    Icon: Flower,
    sidebar: 'bg-fuchsia-500',
    badgeBg: 'bg-fuchsia-50',
    badgeText: 'text-fuchsia-700',
    badgeBorder: 'border-fuchsia-200',
    dot: 'bg-fuchsia-500',
  },
  urologia: {
    key: 'urologia',
    name: 'Urología',
    Icon: FlaskConical,
    sidebar: 'bg-blue-600',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  psiquiatria: {
    key: 'psiquiatria',
    name: 'Psiquiatría',
    Icon: HandHeart,
    sidebar: 'bg-teal-600',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
    dot: 'bg-teal-500',
  },
  reumatologia: {
    key: 'reumatologia',
    name: 'Reumatología',
    Icon: Bone,
    sidebar: 'bg-stone-500',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-700',
    badgeBorder: 'border-stone-200',
    dot: 'bg-stone-500',
  },
  oftalmologia: {
    key: 'oftalmologia',
    name: 'Oftalmología',
    Icon: Eye,
    sidebar: 'bg-cyan-600',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
    dot: 'bg-cyan-500',
  },
  hematologia: {
    key: 'hematologia',
    name: 'Hematología',
    Icon: Droplet,
    sidebar: 'bg-red-700',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-800',
    badgeBorder: 'border-red-200',
    dot: 'bg-red-700',
  },
  'medicina-interna': {
    key: 'medicina-interna',
    name: 'Medicina Interna',
    Icon: Stethoscope,
    sidebar: 'bg-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  infectologia: {
    key: 'infectologia',
    name: 'Infectología',
    Icon: Bug,
    sidebar: 'bg-yellow-600',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
};

const FALLBACK_VISUAL: SpecialtyVisual = {
  key: '__fallback',
  name: 'Sin especialidad',
  Icon: Sparkles,
  sidebar: 'bg-slate-400',
  badgeBg: 'bg-slate-100',
  badgeText: 'text-slate-700',
  badgeBorder: 'border-slate-200',
  dot: 'bg-slate-400',
};

/** Hashed fallback so unseeded specialties still get a stable, distinct color. */
const FALLBACK_PALETTE: SpecialtyVisual[] = Object.values(SPECIALTY_BY_SLUG);

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Resolve a specialty (by id or slug, with optional fallback nombre) to its
 * visual theme. Lookups go through a slug-keyed table first; an unrecognized
 * slug is hashed into the existing 16-slot palette so the color stays
 * deterministic between renders without bleeding through the fallback icon.
 */
export function getSpecialtyVisual(
  especialidad: Especialidad | null | undefined,
): SpecialtyVisual {
  if (!especialidad) return FALLBACK_VISUAL;
  const slug = especialidad.slug ?? slugify(especialidad.nombre);
  const direct = SPECIALTY_BY_SLUG[slug];
  if (direct) return direct;
  const fallback = FALLBACK_PALETTE[hashSlug(slug) % FALLBACK_PALETTE.length];
  return { ...fallback, name: especialidad.nombre, key: slug };
}

export function specialtyVisualById(
  especialidadId: string | null | undefined,
  catalog: Map<string, Especialidad>,
): SpecialtyVisual {
  if (!especialidadId) return FALLBACK_VISUAL;
  return getSpecialtyVisual(catalog.get(especialidadId));
}

interface SpecialtyBadgeProps {
  visual: SpecialtyVisual;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Compact specialty pill: leading icon + name. Doubles as the dashboard tile
 * category badge and the matching-article-card header indicator. Color is
 * driven entirely by {@link SpecialtyVisual} so the same import-and-pass
 * pattern can be reused anywhere else in the app.
 */
export const SpecialtyBadge: React.FC<SpecialtyBadgeProps> = ({
  visual,
  size = 'sm',
  className = '',
}) => {
  const { Icon } = visual;
  const sizes =
    size === 'md'
      ? 'h-7 px-2.5 text-xs gap-1.5'
      : 'h-6 px-2 text-[11px] gap-1';
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-tight ${sizes} ${visual.badgeBg} ${visual.badgeText} ${visual.badgeBorder} ${className}`}
      title={visual.name}
    >
      <Icon size={size === 'md' ? 14 : 12} strokeWidth={2.2} aria-hidden="true" />
      <span className="max-w-[180px] truncate">{visual.name}</span>
    </span>
  );
};
