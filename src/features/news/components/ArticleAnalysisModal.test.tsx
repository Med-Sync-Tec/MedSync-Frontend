import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArticleAnalysisModal } from './ArticleAnalysisModal';
import type { AnalyzeArticleResponse } from '../schemas';

const RESULT: AnalyzeArticleResponse = {
  articleId: 'a1',
  especialidadId: 'esp-1',
  especialidadNombre: 'Cardiología',
  tags: [
    { id: 't1', tipo: 'ENFERMEDAD', valor: 'hipertensión' },
    { id: 't2', tipo: 'MEDICAMENTO', valor: 'losartán' },
  ],
  modelUsed: 'llama-3.3-70b-versatile',
  promptTokens: 500,
  completionTokens: 80,
  hadAbstract: true,
};

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  phase: 'confirm' as const,
  articleTitle: 'Avances en hipertensión',
  result: null,
  errorMessage: null,
  onConfirm: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ArticleAnalysisModal — visibility', () => {
  it('renders nothing when closed', () => {
    // Act
    render(<ArticleAnalysisModal {...baseProps} isOpen={false} />);

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with title and article context when open', () => {
    render(<ArticleAnalysisModal {...baseProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Análisis con IA')).toBeInTheDocument();
    expect(screen.getByText('Avances en hipertensión')).toBeInTheDocument();
  });
});

describe('ArticleAnalysisModal — confirm phase', () => {
  it('shows the replace-tags warning and action buttons', () => {
    render(<ArticleAnalysisModal {...baseProps} />);

    expect(screen.getByText('reemplazará')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analizar' })).toBeInTheDocument();
  });

  it('calls onConfirm when "Analizar" is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(<ArticleAnalysisModal {...baseProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Analizar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Cancelar" is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ArticleAnalysisModal {...baseProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the header close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ArticleAnalysisModal {...baseProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape keydown', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ArticleAnalysisModal {...baseProps} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores keys other than Escape', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ArticleAnalysisModal {...baseProps} onClose={onClose} />);

    await user.keyboard('{Enter}');

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not listen for Escape when closed', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ArticleAnalysisModal {...baseProps} isOpen={false} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ArticleAnalysisModal — loading phase', () => {
  it('shows the spinner copy and no footer actions', () => {
    render(<ArticleAnalysisModal {...baseProps} phase="loading" />);

    expect(screen.getByText('Analizando con IA…')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Analizar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });
});

describe('ArticleAnalysisModal — result phase', () => {
  it('renders specialty, tags (lowercased tipo), and provenance footer', () => {
    // Act
    render(<ArticleAnalysisModal {...baseProps} phase="result" result={RESULT} />);

    // Assert
    expect(screen.getByText('Clasificado como:')).toBeInTheDocument();
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.getByText('Etiquetas extraídas')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('enfermedad')).toBeInTheDocument();
    expect(screen.getByText('hipertensión')).toBeInTheDocument();
    expect(screen.getByText('medicamento')).toBeInTheDocument();
    expect(screen.getByText('losartán')).toBeInTheDocument();
    expect(screen.getByText('llama-3.3-70b-versatile')).toBeInTheDocument();
    expect(screen.getByText(/580 tokens/)).toBeInTheDocument();
    expect(screen.getByText(/500 entrada \/ 80 salida/)).toBeInTheDocument();
  });

  it('omits the specialty row when especialidadNombre is null', () => {
    render(
      <ArticleAnalysisModal
        {...baseProps}
        phase="result"
        result={{ ...RESULT, especialidadId: null, especialidadNombre: null }}
      />,
    );

    expect(screen.queryByText('Clasificado como:')).not.toBeInTheDocument();
  });

  it('shows the no-abstract disclaimer when hadAbstract is false', () => {
    render(
      <ArticleAnalysisModal {...baseProps} phase="result" result={{ ...RESULT, hadAbstract: false }} />,
    );

    expect(screen.getByText(/Analizado sin/)).toBeInTheDocument();
  });

  it('hides the no-abstract disclaimer when hadAbstract is true', () => {
    render(<ArticleAnalysisModal {...baseProps} phase="result" result={RESULT} />);

    expect(screen.queryByText(/Analizado sin/)).not.toBeInTheDocument();
  });

  it('shows "Sin etiquetas." for an empty tag list', () => {
    render(
      <ArticleAnalysisModal {...baseProps} phase="result" result={{ ...RESULT, tags: [] }} />,
    );

    expect(screen.getByText('Sin etiquetas.')).toBeInTheDocument();
    expect(screen.getByText('(0)')).toBeInTheDocument();
  });

  it('renders a "Cerrar" footer button that calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ArticleAnalysisModal {...baseProps} phase="result" result={RESULT} onClose={onClose} />);

    // Two "Cerrar" buttons exist (header X + footer); both must close.
    const closeButtons = screen.getAllByRole('button', { name: 'Cerrar' });
    expect(closeButtons).toHaveLength(2);
    await user.click(closeButtons[1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders no result body when result is null', () => {
    render(<ArticleAnalysisModal {...baseProps} phase="result" result={null} />);

    expect(screen.queryByText('Etiquetas extraídas')).not.toBeInTheDocument();
  });
});

describe('ArticleAnalysisModal — error phase', () => {
  it('shows the provided error message', () => {
    render(
      <ArticleAnalysisModal {...baseProps} phase="error" errorMessage="Artículo no encontrado." />,
    );

    expect(screen.getByText('Artículo no encontrado.')).toBeInTheDocument();
  });

  it('falls back to a generic message when errorMessage is null', () => {
    render(<ArticleAnalysisModal {...baseProps} phase="error" errorMessage={null} />);

    expect(screen.getByText('Algo salió mal.')).toBeInTheDocument();
  });
});
