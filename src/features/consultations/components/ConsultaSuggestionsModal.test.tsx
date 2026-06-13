import type { ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsultaSuggestionsModal } from './ConsultaSuggestionsModal';
import type { ConsultaAnalysisResponse } from '../schemas';

type ModalProps = ComponentProps<typeof ConsultaSuggestionsModal>;

const BASE_RESULT: ConsultaAnalysisResponse = {
  consultaId: 'c1',
  especialidadId: 'e1',
  especialidadSlug: 'cardiologia',
  vocabularyStatus: 'POPULATED',
  suggestions: [
    { tipo: 'enfermedad', valor: 'Diabetes tipo 2' },
    { tipo: 'sintoma', valor: 'Fiebre' },
  ],
  modelUsed: 'llama-3.3-70b',
  promptTokens: 100,
  completionTokens: 50,
};

const defaultProps: ModalProps = {
  isOpen: true,
  onClose: jest.fn(),
  phase: 'result',
  result: BASE_RESULT,
  errorMessage: null,
  isSaving: false,
  onConfirm: jest.fn(),
};

function renderModal(overrides: Partial<ModalProps> = {}) {
  return render(<ConsultaSuggestionsModal {...defaultProps} {...overrides} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ConsultaSuggestionsModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the loading spinner during the loading phase', () => {
    renderModal({ phase: 'loading', result: null });

    expect(screen.getByText('Generando sugerencias…')).toBeInTheDocument();
  });

  it('shows the empty-vocabulary guidance card', () => {
    renderModal({ phase: 'empty-vocab', result: null });

    expect(
      screen.getByText(/Tu especialidad no tiene un vocabulario clínico cargado/),
    ).toBeInTheDocument();
  });

  it('shows the provided error message during the error phase', () => {
    renderModal({ phase: 'error', result: null, errorMessage: 'Consulta no encontrada.' });

    expect(screen.getByText('Consulta no encontrada.')).toBeInTheDocument();
  });

  it('falls back to a generic error message when none is provided', () => {
    renderModal({ phase: 'error', result: null, errorMessage: null });

    expect(screen.getByText('Algo salió mal.')).toBeInTheDocument();
  });

  it('shows an empty-suggestions message and only a close button', () => {
    renderModal({ result: { ...BASE_RESULT, suggestions: [] } });

    expect(
      screen.getByText('La IA no encontró sugerencias relevantes en esta consulta.'),
    ).toBeInTheDocument();
    // Header close (aria-label) + footer button both read "Cerrar".
    expect(screen.getAllByRole('button', { name: 'Cerrar' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Guardar/ })).not.toBeInTheDocument();
  });

  it('renders all suggestions selected by default with model metadata', () => {
    renderModal();

    expect(screen.getByDisplayValue('Diabetes tipo 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fiebre')).toBeInTheDocument();
    expect(screen.getByText('2 de 2 seleccionadas')).toBeInTheDocument();
    expect(screen.getByText('llama-3.3-70b')).toBeInTheDocument();
    expect(screen.getByText(/150 tokens/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar 2 sugerencias' })).toBeInTheDocument();
  });

  it('normalizes uppercase tipos and drops suggestions with unknown tipos', () => {
    renderModal({
      result: {
        ...BASE_RESULT,
        suggestions: [
          { tipo: 'ENFERMEDAD', valor: 'Asma' },
          { tipo: 'alergia-desconocida', valor: 'Polen' },
        ],
      },
    });

    expect(screen.getByText('enfermedad')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Asma')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Polen')).not.toBeInTheDocument();
    expect(screen.getByText('1 de 1 seleccionadas')).toBeInTheDocument();
  });

  it('toggles a single row and disables save when nothing is selected', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getAllByRole('button', { name: 'Desmarcar' })[0]);
    expect(screen.getByText('1 de 2 seleccionadas')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Desmarcar' }));
    expect(screen.getByText('0 de 2 seleccionadas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar 0 sugerencias' })).toBeDisabled();

    await user.click(screen.getAllByRole('button', { name: 'Marcar' })[0]);
    expect(screen.getByText('1 de 2 seleccionadas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar 1 sugerencia' })).toBeEnabled();
  });

  it('selects and deselects all rows with the toggle-all button', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Deseleccionar todas' }));
    expect(screen.getByText('0 de 2 seleccionadas')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Seleccionar todas' }));
    expect(screen.getByText('2 de 2 seleccionadas')).toBeInTheDocument();
  });

  it('confirms only the selected rows with trimmed, possibly edited values', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    renderModal({ onConfirm });

    const input = screen.getByDisplayValue('Diabetes tipo 2');
    fireEvent.change(input, { target: { value: '  Diabetes mellitus  ' } });

    await user.click(screen.getAllByRole('button', { name: 'Desmarcar' })[1]);
    await user.click(screen.getByRole('button', { name: 'Guardar 1 sugerencia' }));

    expect(onConfirm).toHaveBeenCalledWith([
      { tipo: 'enfermedad', valor: 'Diabetes mellitus' },
    ]);
  });

  it('does not confirm when every selected row has a blank value', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    renderModal({
      onConfirm,
      result: { ...BASE_RESULT, suggestions: [{ tipo: 'sintoma', valor: 'Tos' }] },
    });

    fireEvent.change(screen.getByDisplayValue('Tos'), { target: { value: '   ' } });
    await user.click(screen.getByRole('button', { name: 'Guardar 1 sugerencia' }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('closes on Escape when not saving', () => {
    const onClose = jest.fn();
    renderModal({ onClose });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape while saving', () => {
    const onClose = jest.fn();
    renderModal({ onClose, isSaving: true });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when the backdrop is clicked, unless saving', () => {
    const onClose = jest.fn();
    const { container, rerender } = renderModal({ onClose });

    const backdrop = container.querySelector('div.absolute.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(<ConsultaSuggestionsModal {...defaultProps} onClose={onClose} isSaving={true} />);
    fireEvent.click(container.querySelector('div.absolute.inset-0') as Element);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables header close and cancel buttons and shows a spinner while saving', () => {
    renderModal({ isSaving: true });

    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByText('Guardando…')).toBeInTheDocument();
  });

  it('resets the rows when a new analysis result arrives', () => {
    const { rerender } = renderModal();
    expect(screen.getByDisplayValue('Diabetes tipo 2')).toBeInTheDocument();

    rerender(
      <ConsultaSuggestionsModal
        {...defaultProps}
        result={{
          ...BASE_RESULT,
          suggestions: [{ tipo: 'medicamento', valor: 'Metformina' }],
        }}
      />,
    );

    expect(screen.queryByDisplayValue('Diabetes tipo 2')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Metformina')).toBeInTheDocument();
    expect(screen.getByText('1 de 1 seleccionadas')).toBeInTheDocument();
  });
});
