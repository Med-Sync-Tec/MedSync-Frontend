import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PacienteContexto } from '@features/patients/schemas';
import type { MatchingArticle } from '../schemas';
import { tagMatchKey } from '../useMatchIntersection';
import { getSpecialtyVisual } from '../specialtyVisuals';
import { MatchExplainPanel } from './MatchExplainPanel';

function makeArticle(overrides: Partial<MatchingArticle> = {}): MatchingArticle {
  return {
    id: 'art-1',
    titulo: 'Manejo de diabetes tipo 2',
    autores: null,
    revista: null,
    anioPub: null,
    mesPub: null,
    doi: null,
    abstractText: null,
    keywords: null,
    tipoPublicacion: null,
    url: null,
    especialidadId: 'esp-1',
    tags: [
      { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
      { id: 't2', tipo: 'medicamento', valor: 'metformina' },
      { id: 't3', tipo: 'sintoma', valor: 'fatiga' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    ...overrides,
  };
}

function makeContexto(overrides: Partial<PacienteContexto> = {}): PacienteContexto {
  return {
    id: 'ctx-1',
    pacienteId: 'pat-1',
    tipo: 'enfermedad',
    valor: 'diabetes',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const onClose = jest.fn();

function renderPanel(props: Partial<Parameters<typeof MatchExplainPanel>[0]> = {}) {
  const article = makeArticle();
  return render(
    <MatchExplainPanel
      open
      onClose={onClose}
      article={article}
      contextos={[makeContexto()]}
      matchedTagPairs={new Set([tagMatchKey(article.id, 't1')])}
      especialidadName="Cardiología"
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MatchExplainPanel', () => {
  it('renders nothing when closed', () => {
    const { container } = renderPanel({ open: false });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the article is null', () => {
    const { container } = renderPanel({ article: null });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders an accessible dialog with the article title', () => {
    renderPanel();

    expect(
      screen.getByRole('dialog', { name: 'Por qué coincide este artículo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Manejo de diabetes tipo 2')).toBeInTheDocument();
  });

  it('explains the match with a singular tag summary', () => {
    const { container } = renderPanel();

    expect(container.textContent).toContain('comparte la especialidad Cardiología');
    expect(container.textContent).toContain('1 de sus tags está');
    expect(container.textContent).toContain('(de 3 en total)');
  });

  it('uses the plural form when several tags match', () => {
    const article = makeArticle();
    const { container } = renderPanel({
      matchedTagPairs: new Set([
        tagMatchKey(article.id, 't1'),
        tagMatchKey(article.id, 't2'),
      ]),
      contextos: [
        makeContexto(),
        makeContexto({ id: 'ctx-2', tipo: 'medicamento', valor: 'metformina' }),
      ],
    });

    expect(container.textContent).toContain('2 de sus tags están');
  });

  it('falls back to "sin asignar" when especialidadName is null', () => {
    const { container } = renderPanel({ especialidadName: null });

    expect(container.textContent).toContain('sin asignar');
    expect(screen.getByText('Sin especialidad asignada')).toBeInTheDocument();
  });

  it('shows the specialty badge instead of the plain name when a visual exists', () => {
    const visual = getSpecialtyVisual({
      id: 'esp-1',
      nombre: 'Cardiología',
      slug: 'cardiologia',
    });

    renderPanel({ specialtyVisual: visual });

    const badgeName = screen
      .getAllByText('Cardiología')
      .find((el) => el.className.includes('truncate'));
    expect(badgeName).toBeDefined();
    expect(screen.queryByText('Sin especialidad asignada')).not.toBeInTheDocument();
  });

  it('groups contextos under their tipo heading', () => {
    renderPanel({
      contextos: [
        makeContexto(),
        makeContexto({ id: 'ctx-2', tipo: 'sintoma', valor: 'tos' }),
      ],
    });

    const contextosSection = screen.getByRole('region', {
      name: 'Contexto del paciente',
    });
    expect(contextosSection).toHaveTextContent('Enfermedad');
    expect(contextosSection).toHaveTextContent('Síntoma');
    expect(contextosSection).not.toHaveTextContent('Tratamiento');
    expect(contextosSection).not.toHaveTextContent('Medicamento');
  });

  it('shows an empty state when the patient has no contextos', () => {
    renderPanel({ contextos: [], matchedTagPairs: new Set() });

    expect(
      screen.getByText('El paciente aún no tiene contexto clínico registrado.'),
    ).toBeInTheDocument();
  });

  it('lists every article tag in the right column', () => {
    renderPanel();

    const tagsSection = screen.getByRole('region', { name: 'Tags del artículo' });
    expect(tagsSection).toHaveTextContent('diabetes');
    expect(tagsSection).toHaveTextContent('metformina');
    expect(tagsSection).toHaveTextContent('fatiga');
  });

  it('shows the analyze hint when the article has no tags', () => {
    renderPanel({
      article: makeArticle({ tags: [] }),
      matchedTagPairs: new Set(),
    });

    expect(
      screen.getByText(/Este artículo aún no tiene tags clínicos/),
    ).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    renderPanel();

    fireEvent.keyDown(globalThis, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    renderPanel();

    fireEvent.keyDown(globalThis, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on backdrop click', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes from the header close button', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('omits the footer link when onJumpToContextos is not provided', () => {
    renderPanel();

    expect(
      screen.queryByRole('button', { name: /Editar contexto del paciente/ }),
    ).not.toBeInTheDocument();
  });

  it('the footer link jumps to contextos and closes the panel', async () => {
    const user = userEvent.setup();
    const onJumpToContextos = jest.fn();
    renderPanel({ onJumpToContextos });

    await user.click(
      screen.getByRole('button', { name: /Editar contexto del paciente/ }),
    );

    expect(onJumpToContextos).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
