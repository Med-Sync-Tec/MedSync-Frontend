import { useQuery } from '@tanstack/react-query';
import { fetchMedicamentos } from '@features/inventory/api';
import type { Medicamento } from '@features/inventory/schemas';
import type { PacienteContexto } from '@features/patients/schemas';

/** Single page big enough to cover the whole catalog without paging. */
const CATALOG_PAGE_SIZE = 500;
const FIVE_MIN_MS = 5 * 60 * 1000;

export const cooKeys = {
  all: ['coo'] as const,
  catalog: () => [...cooKeys.all, 'medicamentos-catalog'] as const,
};

/**
 * Loads the whole medication catalog (any estado). The COO match uses the
 * full catalog as its "context", mirroring how a patient's contextos drive the
 * patient feed.
 */
export function useCatalogMedicamentos() {
  return useQuery<Medicamento[]>({
    queryKey: cooKeys.catalog(),
    queryFn: async () => {
      const page = await fetchMedicamentos({ page: 0, size: CATALOG_PAGE_SIZE });
      return page.content;
    },
    staleTime: FIVE_MIN_MS,
  });
}

/**
 * Adapts the catalog into {@link PacienteContexto}-shaped rows (all
 * {@code tipo: 'medicamento'}) so the existing {@code useMatchIntersection}
 * and the matching components work unchanged. The medication id flows through
 * as the contexto id, so per-medication match counts stay addressable.
 */
export function toMedicamentoContextos(medicamentos: Medicamento[] | undefined): PacienteContexto[] {
  if (!medicamentos) return [];
  return medicamentos.map((m) => ({
    id: m.id,
    pacienteId: '',
    tipo: 'medicamento' as const,
    valor: m.nombre,
    createdAt: m.createdAt ?? '',
  }));
}
