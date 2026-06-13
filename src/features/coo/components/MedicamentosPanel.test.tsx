import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Medicamento } from '@features/inventory/schemas';
import { MedicamentosPanel } from './MedicamentosPanel';

function makeMedicamento(overrides: Partial<Medicamento> = {}): Medicamento {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    nombre: 'Paracetamol',
    estado: 'vigente',
    descripcion: null,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: null,
    ...overrides,
  };
}

interface RenderOverrides {
  medicamentos?: Medicamento[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  matchCountById?: Map<string, number>;
  selectedTagKeys?: ReadonlySet<string>;
  onToggleFilter?: (key: string) => void;
}

function renderPanel(overrides: RenderOverrides = {}) {
  const props = {
    medicamentos: [],
    isLoading: false,
    hasError: false,
    onRetry: jest.fn(),
    matchCountById: new Map<string, number>(),
    selectedTagKeys: new Set<string>(),
    onToggleFilter: jest.fn(),
    ...overrides,
  };
  const view = render(<MedicamentosPanel {...props} />);
  return { ...view, props };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MedicamentosPanel', () => {
  it('renders the section title', () => {
    renderPanel();

    expect(
      screen.getByRole('heading', { name: 'Catálogo de medicamentos' }),
    ).toBeInTheDocument();
  });

  it('shows the error state and retries on click', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    renderPanel({ hasError: true, onRetry });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar el catálogo de medicamentos.',
    );
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('prioritizes the error state over loading', () => {
    renderPanel({ hasError: true, isLoading: true });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders skeleton chips while loading', () => {
    const { container } = renderPanel({ isLoading: true });

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No hay medicamentos en el catálogo.'),
    ).not.toBeInTheDocument();
  });

  it('shows the empty state when the catalog has no medications', () => {
    renderPanel();

    expect(screen.getByText('No hay medicamentos en el catálogo.')).toBeInTheDocument();
    expect(
      screen.getByText('Agrega medicamentos desde la pantalla de Inventario.'),
    ).toBeInTheDocument();
  });

  it('shows the total count badge in the header', () => {
    const meds = [
      makeMedicamento({ id: '11111111-1111-4111-8111-111111111111', nombre: 'Paracetamol' }),
      makeMedicamento({ id: '22222222-2222-4222-8222-222222222222', nombre: 'Ibuprofeno' }),
    ];

    renderPanel({ medicamentos: meds });

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders a medication without matches as plain text (no filter button)', () => {
    renderPanel({ medicamentos: [makeMedicamento()] });

    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Filtrar artículos por: Paracetamol' }),
    ).not.toBeInTheDocument();
  });

  it('renders a medication with matches as a filter toggle with its count', () => {
    const med = makeMedicamento();

    renderPanel({
      medicamentos: [med],
      matchCountById: new Map([[med.id, 3]]),
    });

    const toggle = screen.getByRole('button', { name: 'Filtrar artículos por: Paracetamol' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('×3')).toBeInTheDocument();
  });

  it('calls onToggleFilter with the normalized tag key on click', async () => {
    const user = userEvent.setup();
    const onToggleFilter = jest.fn();
    const med = makeMedicamento({ nombre: 'Paracetamol' });

    renderPanel({
      medicamentos: [med],
      matchCountById: new Map([[med.id, 1]]),
      onToggleFilter,
    });

    await user.click(screen.getByRole('button', { name: 'Filtrar artículos por: Paracetamol' }));

    expect(onToggleFilter).toHaveBeenCalledWith('medicamento::paracetamol');
  });

  it('marks a selected medication as pressed and offers to remove the filter', () => {
    const med = makeMedicamento();

    renderPanel({
      medicamentos: [med],
      matchCountById: new Map([[med.id, 2]]),
      selectedTagKeys: new Set(['medicamento::paracetamol']),
    });

    const toggle = screen.getByRole('button', { name: 'Quitar filtro: Paracetamol' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders one list item per medication', () => {
    const meds = [
      makeMedicamento({ id: '11111111-1111-4111-8111-111111111111', nombre: 'Paracetamol' }),
      makeMedicamento({ id: '22222222-2222-4222-8222-222222222222', nombre: 'Ibuprofeno' }),
      makeMedicamento({ id: '33333333-3333-4333-8333-333333333333', nombre: 'Metformina' }),
    ];

    renderPanel({ medicamentos: meds });

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
