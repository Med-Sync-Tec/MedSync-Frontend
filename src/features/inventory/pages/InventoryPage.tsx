import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@ui/buttons/Button';
import { Input } from '@ui/inputs/Input';
import { Textarea } from '@ui/inputs/Textarea';
import { Alert } from '@ui/feedback/Alert';
import { Pagination } from '@ui/buttons/Pagination';
import {
  fetchMedicamentos,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
} from '@features/inventory/api';
import type { Medicamento, MedicamentoEstado, MedicamentosPage } from '@features/inventory/schemas';
import { CreateMedicamentoSchema, UpdateMedicamentoSchema } from '@features/inventory/schemas';
import type { CreateMedicamentoInput, UpdateMedicamentoInput } from '@features/inventory/schemas';

const PAGE_SIZE = 10;

const ESTADO_STYLES: Record<MedicamentoEstado, { label: string; className: string }> = {
  vigente:     { label: 'Vigente',     className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  en_revision: { label: 'En revisión', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  obsoleto:    { label: 'Obsoleto',    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

const FILTROS: { value: MedicamentoEstado | 'todos'; label: string }[] = [
  { value: 'todos',       label: 'Todos' },
  { value: 'vigente',     label: 'Vigente' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'obsoleto',    label: 'Obsoleto' },
];

const EMPTY_CREATE: CreateMedicamentoInput = { nombre: '', descripcion: '' };
const EMPTY_UPDATE: UpdateMedicamentoInput = { nombre: '', estado: 'vigente', descripcion: '' };

type ModalMode = 'create' | 'edit';

export const InventoryPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filtro, setFiltro] = useState<MedicamentoEstado | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');

  const [pageData, setPageData] = useState<MedicamentosPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateMedicamentoInput>(EMPTY_CREATE);
  const [updateForm, setUpdateForm] = useState<UpdateMedicamentoInput>(EMPTY_UPDATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Medicamento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
      setPage(0);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  const loadPage = useCallback(() => {
    setIsLoading(true);
    setGlobalError('');
    fetchMedicamentos({
      page,
      size: PAGE_SIZE,
      nombre: debouncedBusqueda || undefined,
      estado: filtro !== 'todos' ? filtro : undefined,
    })
      .then(setPageData)
      .catch(() => setGlobalError('No se pudo cargar el inventario.'))
      .finally(() => setIsLoading(false));
  }, [page, filtro, debouncedBusqueda]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const handleFilterChange = (f: MedicamentoEstado | 'todos') => {
    setFiltro(f);
    setPage(0);
  };

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE);
    setFormErrors({});
    setModalError('');
    setModalMode('create');
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (m: Medicamento) => {
    setUpdateForm({ nombre: m.nombre, estado: m.estado, descripcion: m.descripcion ?? '' });
    setFormErrors({});
    setModalError('');
    setModalMode('edit');
    setEditingId(m.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setModalError('');

    if (modalMode === 'create') {
      const parsed = CreateMedicamentoSchema.safeParse(createForm);
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0]);
          if (!errs[field]) errs[field] = issue.message;
        }
        setFormErrors(errs);
        return;
      }
      setIsSaving(true);
      try {
        await createMedicamento(parsed.data);
        closeModal();
        setPage(0);
        loadPage();
      } catch {
        setModalError('Ocurrió un error. Verifica los datos e intenta de nuevo.');
      } finally {
        setIsSaving(false);
      }
    } else if (editingId) {
      const parsed = UpdateMedicamentoSchema.safeParse(updateForm);
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0]);
          if (!errs[field]) errs[field] = issue.message;
        }
        setFormErrors(errs);
        return;
      }
      setIsSaving(true);
      try {
        await updateMedicamento(editingId, parsed.data);
        closeModal();
        loadPage();
      } catch {
        setModalError('Ocurrió un error. Verifica los datos e intenta de nuevo.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMedicamento(deleteTarget.id);
      setDeleteTarget(null);
      const isLastItemOnPage =
        pageData && pageData.content.length === 1 && page > 0;
      if (isLastItemOnPage) {
        setPage((p) => p - 1);
      } else {
        loadPage();
      }
    } catch {
      setGlobalError('No se pudo eliminar el medicamento.');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const displayPage = page + 1;

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-text-primary">Inventario de Medicamentos</h1>
        <Button onClick={openCreate} icon={<span className="material-symbols-outlined text-lg">add</span>}>
          Nuevo medicamento
        </Button>
      </div>

      {globalError && (
        <Alert type="error" message={globalError} onClose={() => setGlobalError('')} />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={handleBusquedaChange}
          className="flex-1 px-4 py-2 text-sm rounded-lg border border-border-subtle bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilterChange(f.value)}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                filtro === f.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-3xl text-text-muted">progress_activity</span>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-muted">
                  <th className="px-4 py-3 text-left font-semibold text-text-primary">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-primary">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-primary hidden md:table-cell">Descripción</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!pageData || pageData.content.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-text-muted">
                      No se encontraron medicamentos.
                    </td>
                  </tr>
                ) : (
                  pageData.content.map((m) => {
                    const estado = ESTADO_STYLES[m.estado];
                    return (
                      <tr key={m.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-muted transition-colors">
                        <td className="px-4 py-3 font-medium text-text-primary">{m.nombre}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${estado.className}`}>
                            {estado.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted hidden md:table-cell max-w-xs truncate">
                          {m.descripcion ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(m)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              aria-label="Editar"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(m)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                              aria-label="Eliminar"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">
                {totalElements} medicamentos · página {displayPage} de {totalPages}
              </p>
              <Pagination
                currentPage={displayPage}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </>
      )}

      {/* Modal crear */}
      {modalOpen && modalMode === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">Nuevo medicamento</h2>
              <button type="button" onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {modalError && <Alert type="error" message={modalError} onClose={() => setModalError('')} />}

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                id="nombre-create"
                label="Nombre"
                value={createForm.nombre}
                onChange={(e) => setCreateForm((f) => ({ ...f, nombre: e.target.value }))}
                error={formErrors['nombre']}
                placeholder="Ej. Amoxicilina 500mg"
              />
              <Textarea
                id="descripcion-create"
                label="Descripción"
                value={createForm.descripcion}
                onChange={(e) => setCreateForm((f) => ({ ...f, descripcion: e.target.value }))}
                error={formErrors['descripcion']}
                placeholder="Descripción opcional..."
                rows={3}
              />
              <p className="text-xs text-text-muted">
                El medicamento se registrará con estado <span className="font-semibold text-green-600">Vigente</span> por defecto.
              </p>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" fullWidth onClick={closeModal}>Cancelar</Button>
                <Button type="submit" fullWidth isLoading={isSaving}>Crear</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {modalOpen && modalMode === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">Editar medicamento</h2>
              <button type="button" onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {modalError && <Alert type="error" message={modalError} onClose={() => setModalError('')} />}

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                id="nombre-edit"
                label="Nombre"
                value={updateForm.nombre}
                onChange={(e) => setUpdateForm((f) => ({ ...f, nombre: e.target.value }))}
                error={formErrors['nombre']}
                placeholder="Ej. Amoxicilina 500mg"
              />
              <div className="space-y-1.5">
                <label htmlFor="estado-edit" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <select
                  id="estado-edit"
                  value={updateForm.estado}
                  onChange={(e) => setUpdateForm((f) => ({ ...f, estado: e.target.value as MedicamentoEstado }))}
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                >
                  <option value="vigente">Vigente</option>
                  <option value="en_revision">En revisión</option>
                  <option value="obsoleto">Obsoleto</option>
                </select>
              </div>
              <Textarea
                id="descripcion-edit"
                label="Descripción"
                value={updateForm.descripcion}
                onChange={(e) => setUpdateForm((f) => ({ ...f, descripcion: e.target.value }))}
                error={formErrors['descripcion']}
                placeholder="Descripción opcional..."
                rows={3}
              />
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" fullWidth onClick={closeModal}>Cancelar</Button>
                <Button type="submit" fullWidth isLoading={isSaving}>Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-surface rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-danger mt-0.5">warning</span>
              <div>
                <h2 className="text-base font-bold text-text-primary">Eliminar medicamento</h2>
                <p className="text-sm text-text-muted mt-1">
                  ¿Seguro que quieres eliminar{' '}
                  <span className="font-semibold text-text-primary">{deleteTarget.nombre}</span>?
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="danger" fullWidth isLoading={isDeleting} onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};
