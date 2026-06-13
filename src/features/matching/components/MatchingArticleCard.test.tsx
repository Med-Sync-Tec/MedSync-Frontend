import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MatchingArticle } from '../schemas';
import { tagMatchKey } from '../useMatchIntersection';
import { getSpecialtyVisual } from '../specialtyVisuals';
import { MatchingArticleCard } from './MatchingArticleCard';

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
    especialidadId: null,
    tags: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    ...overrides,
  };
}

const CARDIO_VISUAL = getSpecialtyVisual({
  id: 'esp-1',
  nombre: 'Cardiología',
  slug: 'cardiologia',
});

const onOpenExplain = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MatchingArticleCard', () => {
  it('renders the article title', () => {
    render(
      <MatchingArticleCard
        article={makeArticle()}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('Manejo de diabetes tipo 2')).toBeInTheDocument();
  });

  it('renders revista and anioPub joined in the meta line', () => {
    render(
      <MatchingArticleCard
        article={makeArticle({ revista: 'NEJM', anioPub: 2024 })}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('NEJM · 2024')).toBeInTheDocument();
  });

  it('renders only the year when revista is missing', () => {
    render(
      <MatchingArticleCard
        article={makeArticle({ anioPub: 2023 })}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('shows the specialty badge when a visual is provided', () => {
    render(
      <MatchingArticleCard
        article={makeArticle()}
        matchedTagPairs={new Set()}
        specialtyVisual={CARDIO_VISUAL}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.queryByText('Sin especialidad')).not.toBeInTheDocument();
  });

  it('shows the "Sin especialidad" placeholder without a visual', () => {
    render(
      <MatchingArticleCard
        article={makeArticle()}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('Sin especialidad')).toBeInTheDocument();
  });

  it('shows "Coincide en N de M" when some tags match', () => {
    const article = makeArticle({
      tags: [
        { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
        { id: 't2', tipo: 'sintoma', valor: 'fatiga' },
      ],
    });
    const matched = new Set([tagMatchKey(article.id, 't1')]);

    render(
      <MatchingArticleCard
        article={article}
        matchedTagPairs={matched}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Coincide en 1 de 2 tags. Ver detalle.' }),
    ).toHaveTextContent('Coincide en 1 de 2');
  });

  it('shows "Coincide por especialidad" when no tag matches but tags exist', () => {
    const article = makeArticle({
      tags: [{ id: 't1', tipo: 'enfermedad', valor: 'diabetes' }],
    });

    render(
      <MatchingArticleCard
        article={article}
        matchedTagPairs={new Set()}
        specialtyVisual={CARDIO_VISUAL}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Coincide por especialidad. Ver detalle.' }),
    ).toBeInTheDocument();
  });

  it('omits the match badge entirely when the article has no tags', () => {
    render(
      <MatchingArticleCard
        article={makeArticle({ tags: [] })}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.queryByText(/Coincide/)).not.toBeInTheDocument();
  });

  it('renders one chip per tag, highlighting matched ones', () => {
    const article = makeArticle({
      tags: [
        { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
        { id: 't2', tipo: 'medicamento', valor: 'metformina' },
      ],
    });
    const matched = new Set([tagMatchKey(article.id, 't1')]);

    render(
      <MatchingArticleCard
        article={article}
        matchedTagPairs={matched}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('diabetes')).toBeInTheDocument();
    expect(screen.getByText('metformina')).toBeInTheDocument();
    expect(
      screen.getByTitle(
        'Coincide con el contexto del paciente: enfermedad — diabetes',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTitle('medicamento — metformina')).toBeInTheDocument();
  });

  it('calls onOpenExplain with the article id from the overlay button', async () => {
    const user = userEvent.setup();
    render(
      <MatchingArticleCard
        article={makeArticle()}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Ver detalles de: Manejo de diabetes tipo 2',
      }),
    );

    expect(onOpenExplain).toHaveBeenCalledWith('art-1');
  });

  it('calls onOpenExplain with the article id from the match badge', async () => {
    const user = userEvent.setup();
    const article = makeArticle({
      tags: [{ id: 't1', tipo: 'enfermedad', valor: 'diabetes' }],
    });

    render(
      <MatchingArticleCard
        article={article}
        matchedTagPairs={new Set([tagMatchKey(article.id, 't1')])}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );
    await user.click(
      screen.getByRole('button', { name: 'Coincide en 1 de 1 tags. Ver detalle.' }),
    );

    expect(onOpenExplain).toHaveBeenCalledWith('art-1');
  });

  it('shows the DOI in the footer when present', () => {
    render(
      <MatchingArticleCard
        article={makeArticle({ doi: '10.1000/xyz', tipoPublicacion: 'Review' })}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('DOI 10.1000/xyz')).toBeInTheDocument();
    expect(screen.queryByText('Review')).not.toBeInTheDocument();
  });

  it('falls back to tipoPublicacion in the footer when DOI is missing', () => {
    render(
      <MatchingArticleCard
        article={makeArticle({ doi: null, tipoPublicacion: 'Review' })}
        matchedTagPairs={new Set()}
        specialtyVisual={null}
        onOpenExplain={onOpenExplain}
      />,
    );

    expect(screen.getByText('Review')).toBeInTheDocument();
  });
});
