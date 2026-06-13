import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@lib/http/errors';
import type { AnalyzeArticleResponse } from '../schemas';

interface MutateOptions {
  onSuccess: (data: AnalyzeArticleResponse) => void;
  onError: (err: unknown) => void;
}

const mockHoisted = {
  mutate: jest.fn(),
  isPending: false,
};

jest.mock('../queries', () => ({
  useAnalyzeArticle: () => ({ mutate: mockHoisted.mutate, isPending: mockHoisted.isPending }),
}));

import { AnalyzeArticleButton } from './AnalyzeArticleButton';

const RESULT: AnalyzeArticleResponse = {
  articleId: 'a1',
  especialidadId: 'esp-1',
  especialidadNombre: 'Cardiología',
  tags: [{ id: 't1', tipo: 'ENFERMEDAD', valor: 'hipertensión' }],
  modelUsed: 'llama-3.3-70b-versatile',
  promptTokens: 500,
  completionTokens: 80,
  hadAbstract: true,
};

const TRIGGER_NAME = 'Analizar artículo con IA';

beforeEach(() => {
  jest.clearAllMocks();
  mockHoisted.isPending = false;
});

async function openModal() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: TRIGGER_NAME }));
  return user;
}

async function openAndConfirm() {
  const user = await openModal();
  await user.click(screen.getByRole('button', { name: 'Analizar' }));
  const options = mockHoisted.mutate.mock.calls[0][1] as MutateOptions;
  return { user, options };
}

describe('AnalyzeArticleButton — trigger', () => {
  it('renders the trigger button and keeps the modal closed', () => {
    // Act
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" />);

    // Assert
    expect(screen.getByRole('button', { name: TRIGGER_NAME })).toHaveTextContent(
      'Analizar con IA',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('applies a custom className to the trigger', () => {
    render(
      <AnalyzeArticleButton articleId="a1" articleTitle="Título" className="custom-class" />,
    );

    expect(screen.getByRole('button', { name: TRIGGER_NAME })).toHaveClass('custom-class');
  });

  it('opens the modal in the confirm phase with the article title', async () => {
    // Arrange
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Mi artículo" />);

    // Act
    await openModal();

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Mi artículo')).toBeInTheDocument();
    expect(screen.getByText('reemplazará')).toBeInTheDocument();
    expect(mockHoisted.mutate).not.toHaveBeenCalled();
  });
});

describe('AnalyzeArticleButton — analyze flow', () => {
  it('moves to loading and triggers the mutation with the article id on confirm', async () => {
    // Arrange
    render(<AnalyzeArticleButton articleId="art-42" articleTitle="Título" />);

    // Act
    await openAndConfirm();

    // Assert
    expect(mockHoisted.mutate).toHaveBeenCalledTimes(1);
    expect(mockHoisted.mutate.mock.calls[0][0]).toBe('art-42');
    expect(screen.getByText('Analizando con IA…')).toBeInTheDocument();
  });

  it('shows the result and fires onAnalyzed on success', async () => {
    // Arrange
    const onAnalyzed = jest.fn();
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" onAnalyzed={onAnalyzed} />);
    const { options } = await openAndConfirm();

    // Act
    act(() => options.onSuccess(RESULT));

    // Assert
    expect(screen.getByText('Etiquetas extraídas')).toBeInTheDocument();
    expect(screen.getByText('hipertensión')).toBeInTheDocument();
    expect(onAnalyzed).toHaveBeenCalledWith(RESULT);
  });

  it('works without an onAnalyzed callback', async () => {
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" />);
    const { options } = await openAndConfirm();

    act(() => options.onSuccess(RESULT));

    expect(screen.getByText('Etiquetas extraídas')).toBeInTheDocument();
  });

  it('resets to the confirm phase when reopened after a result', async () => {
    // Arrange
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" />);
    const { user, options } = await openAndConfirm();
    act(() => options.onSuccess(RESULT));
    await user.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: TRIGGER_NAME }));

    // Assert
    expect(screen.getByText('reemplazará')).toBeInTheDocument();
    expect(screen.queryByText('Etiquetas extraídas')).not.toBeInTheDocument();
  });
});

describe('AnalyzeArticleButton — error mapping', () => {
  it.each([
    [
      new ApiError(400, 'Bad Request'),
      'Este artículo no tiene texto analizable (título, abstract y keywords vacíos).',
    ],
    [new ApiError(401, 'Unauthorized'), 'Tu sesión expiró. Inicia sesión de nuevo.'],
    [new ApiError(404, 'Not Found'), 'Artículo no encontrado.'],
    [
      new ApiError(502, 'Bad Gateway'),
      'El servicio de IA devolvió una respuesta inválida. Intenta de nuevo en unos segundos.',
    ],
    [new ApiError(504, 'Gateway Timeout'), 'El servicio de IA tardó demasiado. Intenta de nuevo.'],
    [new ApiError(500, 'Fallo interno del servidor'), 'Fallo interno del servidor'],
    [new ApiError(500, ''), 'Error inesperado.'],
    [new Error('network down'), 'Error inesperado al conectar con el servidor.'],
  ])('maps %s to a doctor-friendly message', async (err, expectedMessage) => {
    // Arrange
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" />);
    const { options } = await openAndConfirm();

    // Act
    act(() => options.onError(err));

    // Assert
    expect(screen.getByText(expectedMessage)).toBeInTheDocument();
  });
});

describe('AnalyzeArticleButton — close behavior', () => {
  it('blocks closing while the mutation is pending', async () => {
    // Arrange
    mockHoisted.isPending = true;
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" />);
    const user = await openModal();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes via the header button when idle', async () => {
    // Arrange
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" />);
    const user = await openModal();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes after an error via the footer button', async () => {
    // Arrange
    render(<AnalyzeArticleButton articleId="a1" articleTitle="Título" />);
    const { user, options } = await openAndConfirm();
    act(() => options.onError(new ApiError(404, 'Not Found')));

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]);

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
