import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@features/patients/api', () => ({
  bulkAddPacienteContextos: jest.fn(),
  createPacienteContexto: jest.fn(),
  createPatient: jest.fn(),
  deletePacienteContexto: jest.fn(),
  getConsultasByPatient: jest.fn(),
  getExpediente: jest.fn(),
  getPatient: jest.fn(),
  listPacienteContextos: jest.fn(),
  listPatients: jest.fn(),
}));

import { ApiError } from '@lib/http/errors';
import { matchKey } from '@features/matching/useMatchIntersection';
import {
  deletePacienteContexto,
  listPacienteContextos,
} from '@features/patients/api';
import type { PacienteContexto } from '@features/patients/schemas';
import { PatientContextosPanel } from './PatientContextosPanel';

const mockList = jest.mocked(listPacienteContextos);
const mockDelete = jest.mocked(deletePacienteContexto);

const ENFERMEDAD: PacienteContexto = {
  id: 'c1',
  pacienteId: 'p1',
  tipo: 'enfermedad',
  valor: 'Hipertensión',
  createdAt: '2024-01-01T00:00:00Z',
};

const SINTOMA: PacienteContexto = {
  id: 'c2',
  pacienteId: 'p1',
  tipo: 'sintoma',
  valor: 'Mareo',
  createdAt: '2024-01-02T00:00:00Z',
};

function renderPanel(
  props: Partial<React.ComponentProps<typeof PatientContextosPanel>> = {},
) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <PatientContextosPanel patientId="p1" {...props} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PatientContextosPanel', () => {
  it('shows the section title and skeleton while loading', () => {
    mockList.mockReturnValue(new Promise(() => {}));

    const { container } = renderPanel();

    expect(screen.getByText('Contexto clínico')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sin contexto clínico registrado.')).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no contextos', async () => {
    mockList.mockResolvedValue([]);

    renderPanel();

    expect(await screen.findByText('Sin contexto clínico registrado.')).toBeInTheDocument();
    expect(
      screen.getByText('Agrega enfermedades, síntomas, tratamientos o medicamentos relevantes.'),
    ).toBeInTheDocument();
  });

  it('renders contextos grouped by tipo with a total badge', async () => {
    mockList.mockResolvedValue([ENFERMEDAD, SINTOMA]);

    renderPanel();

    expect(await screen.findByText('Hipertensión')).toBeInTheDocument();
    expect(screen.getByText('Mareo')).toBeInTheDocument();
    expect(screen.getByText('Enfermedad')).toBeInTheDocument();
    expect(screen.getByText('Síntoma')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows a not-found message for a 404 error and retries on click', async () => {
    mockList.mockRejectedValueOnce(new ApiError(404, 'Not found'));
    mockList.mockResolvedValueOnce([ENFERMEDAD]);
    const user = userEvent.setup();

    renderPanel();

    expect(await screen.findByText('No encontramos al paciente.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Hipertensión')).toBeInTheDocument();
    expect(mockList).toHaveBeenCalledTimes(2);
  });

  it('shows a session message for a 401 error', async () => {
    mockList.mockRejectedValue(new ApiError(401, 'Unauthorized'));

    renderPanel();

    expect(
      await screen.findByText('Tu sesión expiró. Vuelve a iniciar sesión.'),
    ).toBeInTheDocument();
  });

  it('shows the plain error message for generic errors', async () => {
    mockList.mockRejectedValue(new Error('Se cayó la red'));

    renderPanel();

    expect(await screen.findByText('Se cayó la red')).toBeInTheDocument();
  });

  it('deletes a contexto via the chip X button', async () => {
    mockList.mockResolvedValue([ENFERMEDAD]);
    mockDelete.mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderPanel();
    await screen.findByText('Hipertensión');

    await user.click(
      screen.getByRole('button', { name: 'Eliminar enfermedad: Hipertensión' }),
    );

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('p1', 'c1'));
  });

  it('shows the match count and a filter toggle when the contexto has matches', async () => {
    mockList.mockResolvedValue([ENFERMEDAD]);
    const onToggleFilter = jest.fn();
    const user = userEvent.setup();

    renderPanel({
      contextoMatchCounts: new Map([['c1', 3]]),
      selectedTagKeys: new Set<string>(),
      onToggleFilter,
    });

    expect(await screen.findByText('×3')).toBeInTheDocument();

    const toggle = screen.getByRole('button', {
      name: 'Filtrar artículos por: Hipertensión',
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);

    expect(onToggleFilter).toHaveBeenCalledWith(matchKey('enfermedad', 'Hipertensión'));
  });

  it('marks a selected filter chip as pressed with a remove label', async () => {
    mockList.mockResolvedValue([ENFERMEDAD]);
    const key = matchKey('enfermedad', 'Hipertensión');

    renderPanel({
      contextoMatchCounts: new Map([['c1', 1]]),
      selectedTagKeys: new Set([key]),
      onToggleFilter: jest.fn(),
    });

    const toggle = await screen.findByRole('button', {
      name: 'Quitar filtro: Hipertensión',
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders a plain (non-filterable) chip when there are no matches', async () => {
    mockList.mockResolvedValue([ENFERMEDAD]);

    renderPanel({
      contextoMatchCounts: new Map(),
      onToggleFilter: jest.fn(),
    });

    expect(await screen.findByText('Hipertensión')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Filtrar artículos por/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/×\d/)).not.toBeInTheDocument();
  });

  it('opens the new contexto modal from the Agregar button', async () => {
    mockList.mockResolvedValue([]);
    const user = userEvent.setup();

    renderPanel();
    await screen.findByText('Sin contexto clínico registrado.');

    await user.click(screen.getByRole('button', { name: /Agregar$/ }));

    expect(
      await screen.findByRole('heading', { name: 'Nuevo contexto clínico' }),
    ).toBeInTheDocument();
  });
});
