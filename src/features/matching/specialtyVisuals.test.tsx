import { render, screen } from '@testing-library/react';
import type { Especialidad } from './schemas';
import {
  getSpecialtyVisual,
  specialtyVisualById,
  SpecialtyBadge,
} from './specialtyVisuals';

const CARDIO: Especialidad = {
  id: 'esp-1',
  nombre: 'Cardiología',
  slug: 'cardiologia',
};

describe('getSpecialtyVisual', () => {
  it('returns the fallback visual for null', () => {
    const visual = getSpecialtyVisual(null);

    expect(visual.key).toBe('__fallback');
    expect(visual.name).toBe('Sin especialidad');
  });

  it('returns the fallback visual for undefined', () => {
    const visual = getSpecialtyVisual(undefined);

    expect(visual.key).toBe('__fallback');
  });

  it('resolves a seeded specialty by its slug', () => {
    const visual = getSpecialtyVisual(CARDIO);

    expect(visual.key).toBe('cardiologia');
    expect(visual.name).toBe('Cardiología');
    expect(visual.sidebar).toBe('bg-rose-600');
  });

  it('slugifies nombre when slug is missing, stripping accents', () => {
    const visual = getSpecialtyVisual({ id: 'e2', nombre: 'Cardiología' });

    expect(visual.key).toBe('cardiologia');
    expect(visual.sidebar).toBe('bg-rose-600');
  });

  it('slugifies multi-word nombres with hyphens', () => {
    const visual = getSpecialtyVisual({ id: 'e3', nombre: 'Medicina Interna' });

    expect(visual.key).toBe('medicina-interna');
    expect(visual.name).toBe('Medicina Interna');
  });

  it('hashes unknown slugs into the seeded palette keeping the given nombre', () => {
    const visual = getSpecialtyVisual({
      id: 'e4',
      nombre: 'Traumatología',
      slug: 'traumatologia',
    });

    expect(visual.key).toBe('traumatologia');
    expect(visual.name).toBe('Traumatología');
    expect(visual.sidebar).toMatch(/^bg-/);
    // Hashed into a seeded slot, never the gray fallback icon slot.
    expect(visual.key).not.toBe('__fallback');
  });

  it('is deterministic for the same unknown slug', () => {
    const especialidad: Especialidad = {
      id: 'e4',
      nombre: 'Traumatología',
      slug: 'traumatologia',
    };

    const first = getSpecialtyVisual(especialidad);
    const second = getSpecialtyVisual(especialidad);

    expect(second.sidebar).toBe(first.sidebar);
    expect(second.badgeBg).toBe(first.badgeBg);
    expect(second.Icon).toBe(first.Icon);
  });
});

describe('specialtyVisualById', () => {
  const catalog = new Map<string, Especialidad>([[CARDIO.id, CARDIO]]);

  it('returns the fallback when id is null', () => {
    expect(specialtyVisualById(null, catalog).key).toBe('__fallback');
  });

  it('returns the fallback when id is undefined', () => {
    expect(specialtyVisualById(undefined, catalog).key).toBe('__fallback');
  });

  it('returns the fallback when the id is not in the catalog', () => {
    expect(specialtyVisualById('missing', catalog).key).toBe('__fallback');
  });

  it('resolves the visual through the catalog', () => {
    const visual = specialtyVisualById('esp-1', catalog);

    expect(visual.key).toBe('cardiologia');
    expect(visual.name).toBe('Cardiología');
  });
});

describe('SpecialtyBadge', () => {
  const visual = getSpecialtyVisual(CARDIO);

  it('renders the specialty name with a title attribute', () => {
    render(<SpecialtyBadge visual={visual} />);

    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.getByTitle('Cardiología')).toBeInTheDocument();
  });

  it('uses the small size by default', () => {
    const { container } = render(<SpecialtyBadge visual={visual} />);

    expect(container.firstElementChild?.className).toContain('h-6');
  });

  it('uses the medium size when requested', () => {
    const { container } = render(<SpecialtyBadge visual={visual} size="md" />);

    expect(container.firstElementChild?.className).toContain('h-7');
  });

  it('appends the caller className and the visual colors', () => {
    const { container } = render(
      <SpecialtyBadge visual={visual} className="extra-class" />,
    );
    const className = container.firstElementChild?.className ?? '';

    expect(className).toContain('extra-class');
    expect(className).toContain(visual.badgeBg);
    expect(className).toContain(visual.badgeText);
    expect(className).toContain(visual.badgeBorder);
  });
});
