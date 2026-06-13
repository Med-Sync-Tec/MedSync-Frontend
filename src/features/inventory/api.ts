import { apiFetch } from '@lib/http/client';
import { MedicamentosPageSchema, MedicamentoSchema } from './schemas';
import type { CreateMedicamentoInput, MedicamentosPage, Medicamento, UpdateMedicamentoInput } from './schemas';

export interface FetchMedicamentosParams {
  page?: number;
  size?: number;
  nombre?: string;
  estado?: string;
}

export async function fetchMedicamentos(params: FetchMedicamentosParams = {}): Promise<MedicamentosPage> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));
  if (params.nombre) query.set('nombre', params.nombre);
  if (params.estado && params.estado !== 'todos') query.set('estado', params.estado);
  const qs = query.toString();
  const path = qs ? `/api/medicamentos?${qs}` : '/api/medicamentos';
  const data = await apiFetch<unknown>(path);
  return MedicamentosPageSchema.parse(data);
}

export async function createMedicamento(input: CreateMedicamentoInput): Promise<Medicamento> {
  const data = await apiFetch<unknown>('/api/medicamentos', {
    method: 'POST',
    body: { nombre: input.nombre, descripcion: input.descripcion },
  });
  return MedicamentoSchema.parse(data);
}

export async function updateMedicamento(id: string, input: UpdateMedicamentoInput): Promise<Medicamento> {
  const data = await apiFetch<unknown>(`/api/medicamentos/${id}`, {
    method: 'PUT',
    body: { nombre: input.nombre, estado: input.estado, descripcion: input.descripcion },
  });
  return MedicamentoSchema.parse(data);
}

export async function deleteMedicamento(id: string): Promise<void> {
  await apiFetch<void>(`/api/medicamentos/${id}`, { method: 'DELETE' });
}
