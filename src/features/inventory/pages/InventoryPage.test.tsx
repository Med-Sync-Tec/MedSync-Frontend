import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryPage } from './InventoryPage';
import type { Medicamento, MedicamentosPage } from '@features/inventory/schemas';

jest.mock('@features/inventory/api', () => ({
  fetchMedicamentos: jest.fn(),
  createMedicamento: jest.fn(),
  updateMedicamento: jest.fn(),
  deleteMedicamento: jest.fn(),
}));

import {
  fetchMedicamentos,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
} from '@features/inventory/api';

const mockFetch = jest.mocked(fetchMedicamentos);
const mockCreate = jest.mocked(createMedicamento);
const mockUpdate = jest.mocked(updateMedicamento);
const mockDelete = jest.mocked(deleteMedicamento);

const makeMed = (id: string, overrides: Partial<Medicamento> = {}): Medicamento => ({
  id,
  nombre: `Medicamento ${id}`,
  estado: 'vigente',
  descripcion: 'Descripción de prueba',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makePage = (content: Medicamento[], overrides: Partial<MedicamentosPage> = {}): MedicamentosPage => ({
  content,
  page: 0,
  size: 10,
  totalElements: content.length,
  totalPages: 1,
  ...overrides,
});

const defaultMeds = [
  makeMed('med-1', { nombre: 'Amoxicilina 500mg' }),
  makeMed('med-2', { nombre: 'Paracetamol', estado: 'en_revision', descripcion: null }),
];

const findModal = (titleText: string | RegExp) => {
  const title = screen.getByText(titleText);
  const modal = title.closest('div.fixed');
  if (!modal) throw new Error('Modal container not found');
  return within(modal as HTMLElement);
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockResolvedValue(makePage(defaultMeds));
});

describe('InventoryPage', () => {
  it('shows a loading spinner before the first page resolves', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(<InventoryPage />);

    expect(screen.getByText('progress_activity')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the medicamentos table after loading', async () => {
    render(<InventoryPage />);

    expect(await screen.findByText('Amoxicilina 500mg')).toBeInTheDocument();
    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    // Scope to the table: estado labels also exist as filter buttons
    const table = within(screen.getByRole('table'));
    expect(table.getByText('Vigente')).toBeInTheDocument();
    expect(table.getByText('En revisión')).toBeInTheDocument();
    expect(table.getByText('—')).toBeInTheDocument(); // null descripcion fallback
    expect(mockFetch).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      nombre: undefined,
      estado: undefined,
    });
  });

  it('shows an empty state when there are no medicamentos', async () => {
    mockFetch.mockResolvedValue(makePage([]));

    render(<InventoryPage />);

    expect(await screen.findByText('No se encontraron medicamentos.')).toBeInTheDocument();
  });

  it('shows a global error when the page fails to load', async () => {
    mockFetch.mockRejectedValue(new Error('boom'));

    render(<InventoryPage />);

    expect(await screen.findByText('No se pudo cargar el inventario.')).toBeInTheDocument();
  });

  it('refetches with the estado filter when clicking a filter button', async () => {
    const user = userEvent.setup();
    render(<InventoryPage />);
    await screen.findByText('Amoxicilina 500mg');

    await user.click(screen.getByRole('button', { name: 'Obsoleto' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith({
        page: 0,
        size: 10,
        nombre: undefined,
        estado: 'obsoleto',
      });
    });
  });

  it('debounces the search box and refetches by nombre', async () => {
    const user = userEvent.setup();
    render(<InventoryPage />);
    await screen.findByText('Amoxicilina 500mg');

    await user.type(screen.getByPlaceholderText('Buscar por nombre...'), 'amoxi');

    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenLastCalledWith({
          page: 0,
          size: 10,
          nombre: 'amoxi',
          estado: undefined,
        });
      },
      { timeout: 2000 }
    );
  });

  it('shows pagination info and fetches the requested page', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(makePage(defaultMeds, { totalElements: 15, totalPages: 2 }));
    render(<InventoryPage />);
    await screen.findByText('Amoxicilina 500mg');

    expect(screen.getByText('15 medicamentos · página 1 de 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        nombre: undefined,
        estado: undefined,
      });
    });
  });

  it('does not render pagination when there is a single page', async () => {
    render(<InventoryPage />);
    await screen.findByText('Amoxicilina 500mg');

    expect(screen.queryByLabelText('Paginación')).not.toBeInTheDocument();
  });

  describe('create modal', () => {
    it('opens and closes the create modal', async () => {
      const user = userEvent.setup();
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getByRole('button', { name: /Nuevo medicamento/ }));
      expect(screen.getByRole('heading', { name: 'Nuevo medicamento' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.queryByRole('heading', { name: 'Nuevo medicamento' })).not.toBeInTheDocument();
    });

    it('shows a validation error when nombre is empty and does not call the API', async () => {
      const user = userEvent.setup();
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getByRole('button', { name: /Nuevo medicamento/ }));
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('creates a medicamento, closes the modal and reloads page 0', async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue(makeMed('med-3', { nombre: 'Ibuprofeno' }));
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');
      mockFetch.mockClear();

      await user.click(screen.getByRole('button', { name: /Nuevo medicamento/ }));
      await user.type(screen.getByLabelText('Nombre'), 'Ibuprofeno');
      await user.type(screen.getByLabelText('Descripción'), 'Antiinflamatorio');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          nombre: 'Ibuprofeno',
          descripcion: 'Antiinflamatorio',
        });
      });
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Nuevo medicamento' })).not.toBeInTheDocument();
      });
      expect(mockFetch).toHaveBeenCalled();
    });

    it('shows a modal error when the create request fails', async () => {
      const user = userEvent.setup();
      mockCreate.mockRejectedValue(new Error('500'));
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getByRole('button', { name: /Nuevo medicamento/ }));
      await user.type(screen.getByLabelText('Nombre'), 'Ibuprofeno');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      expect(
        await screen.findByText('Ocurrió un error. Verifica los datos e intenta de nuevo.')
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Nuevo medicamento' })).toBeInTheDocument();
    });
  });

  describe('edit modal', () => {
    it('prefills the form with the selected medicamento', async () => {
      const user = userEvent.setup();
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]!);

      expect(screen.getByRole('heading', { name: 'Editar medicamento' })).toBeInTheDocument();
      expect(screen.getByLabelText('Nombre')).toHaveValue('Amoxicilina 500mg');
      expect(screen.getByLabelText('Estado')).toHaveValue('vigente');
      expect(screen.getByLabelText('Descripción')).toHaveValue('Descripción de prueba');
    });

    it('updates the medicamento and closes the modal', async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue(makeMed('med-1', { estado: 'obsoleto' }));
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]!);
      await user.selectOptions(screen.getByLabelText('Estado'), 'obsoleto');
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('med-1', {
          nombre: 'Amoxicilina 500mg',
          estado: 'obsoleto',
          descripcion: 'Descripción de prueba',
        });
      });
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Editar medicamento' })).not.toBeInTheDocument();
      });
    });

    it('shows a validation error when the edited nombre is cleared', async () => {
      const user = userEvent.setup();
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]!);
      await user.clear(screen.getByLabelText('Nombre'));
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('shows a modal error when the update request fails', async () => {
      const user = userEvent.setup();
      mockUpdate.mockRejectedValue(new Error('500'));
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]!);
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(
        await screen.findByText('Ocurrió un error. Verifica los datos e intenta de nuevo.')
      ).toBeInTheDocument();
    });
  });

  describe('delete flow', () => {
    it('asks for confirmation and deletes the medicamento', async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue(undefined);
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]!);

      const modal = findModal('Eliminar medicamento');
      expect(modal.getByText(/¿Seguro que quieres eliminar/)).toBeInTheDocument();

      await user.click(modal.getByRole('button', { name: 'Eliminar' }));

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('med-1');
      });
      expect(screen.queryByText(/¿Seguro que quieres eliminar/)).not.toBeInTheDocument();
    });

    it('closes the confirmation without deleting when cancelled', async () => {
      const user = userEvent.setup();
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]!);
      const modal = findModal('Eliminar medicamento');
      await user.click(modal.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByText(/¿Seguro que quieres eliminar/)).not.toBeInTheDocument();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('shows a global error when the delete request fails', async () => {
      const user = userEvent.setup();
      mockDelete.mockRejectedValue(new Error('500'));
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]!);
      const modal = findModal('Eliminar medicamento');
      await user.click(modal.getByRole('button', { name: 'Eliminar' }));

      expect(await screen.findByText('No se pudo eliminar el medicamento.')).toBeInTheDocument();
      expect(screen.queryByText(/¿Seguro que quieres eliminar/)).not.toBeInTheDocument();
    });

    it('goes back one page when deleting the last item of a page beyond the first', async () => {
      const user = userEvent.setup();
      const lastItem = makeMed('med-last', { nombre: 'Último Medicamento' });
      mockFetch.mockImplementation(async (params = {}) =>
        params.page === 1
          ? makePage([lastItem], { page: 1, totalElements: 11, totalPages: 2 })
          : makePage(defaultMeds, { totalElements: 11, totalPages: 2 })
      );
      mockDelete.mockResolvedValue(undefined);
      render(<InventoryPage />);
      await screen.findByText('Amoxicilina 500mg');

      await user.click(screen.getByRole('button', { name: '2' }));
      await screen.findByText('Último Medicamento');

      await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]!);
      const modal = findModal('Eliminar medicamento');
      await user.click(modal.getByRole('button', { name: 'Eliminar' }));

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('med-last');
      });
      await waitFor(() => {
        expect(mockFetch).toHaveBeenLastCalledWith(
          expect.objectContaining({ page: 0 })
        );
      });
    });
  });
});
