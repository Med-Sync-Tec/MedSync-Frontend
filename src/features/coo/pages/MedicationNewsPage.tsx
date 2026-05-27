import React, { useCallback, useMemo, useState } from 'react';
import { useCooMatchingArticles } from '@features/matching/queries';
import { useMatchIntersection } from '@features/matching/useMatchIntersection';
import { useCatalogMedicamentos, toMedicamentoContextos } from '../medicationContext';
import { MedicamentosPanel } from '../components/MedicamentosPanel';
import { CooMatchingArticlesPanel } from '../components/CooMatchingArticlesPanel';

/**
 * COO "Noticias por medicamento" screen — the medication analog of the doctor's
 * patient-detail matching view. The whole catalog drives the match; the left
 * panel lists medications (with per-medication match counts and click-to-filter)
 * and the right panel shows the matching news with the same bidirectional
 * highlight used on the patient screen, plus inline save / analyze actions.
 */
export const MedicationNewsPage: React.FC = () => {
  const catalogQ = useCatalogMedicamentos();
  const articlesQ = useCooMatchingArticles();
  const [selectedTagKeys, setSelectedTagKeys] = useState<ReadonlySet<string>>(new Set());

  const contextos = useMemo(
    () => toMedicamentoContextos(catalogQ.data),
    [catalogQ.data],
  );
  const intersection = useMatchIntersection(contextos, articlesQ.data);

  const handleToggleFilter = useCallback((key: string) => {
    setSelectedTagKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleClearFilter = useCallback(() => setSelectedTagKeys(new Set()), []);

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Noticias por medicamento
        </h1>
        <p className="text-sm text-text-muted">
          Artículos científicos que mencionan medicamentos de tu catálogo. Analiza con IA
          para descubrir nuevas coincidencias.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-5 items-start">
        <div className="lg:sticky lg:top-20">
          <MedicamentosPanel
            medicamentos={catalogQ.data ?? []}
            isLoading={catalogQ.isLoading}
            hasError={Boolean(catalogQ.error)}
            onRetry={() => catalogQ.refetch()}
            matchCountById={intersection.contextoMatchCounts}
            selectedTagKeys={selectedTagKeys}
            onToggleFilter={handleToggleFilter}
          />
        </div>

        <CooMatchingArticlesPanel
          contextos={contextos}
          matchedTagPairs={intersection.matchedTagPairs}
          selectedTagKeys={selectedTagKeys}
          onClearFilter={handleClearFilter}
        />
      </div>
    </main>
  );
};
