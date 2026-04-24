import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { PatientCard } from '@ui/cards/PatientCard';
import { MOCK_PATIENT } from '@mocks/patients';

type PatientRow = {
  id: string;
  name: string;
  patientId: string;
  status: 'estable' | 'critico' | 'en-observacion' | 'alta';
  needsAttention: boolean;
};

const EXTRA_PATIENTS: PatientRow[] = [
  {
    id: 'p-002',
    name: 'María Fernanda López',
    patientId: 'HG-2024-10238',
    status: 'critico',
    needsAttention: true,
  },
  {
    id: 'p-003',
    name: 'Elena Gómez Ruiz',
    patientId: 'HG-2024-10245',
    status: 'en-observacion',
    needsAttention: false,
  },
  {
    id: 'p-004',
    name: 'Roberto Jiménez Aguirre',
    patientId: 'HG-2024-10257',
    status: 'estable',
    needsAttention: false,
  },
  {
    id: 'p-005',
    name: 'Sofía Castañeda Morales',
    patientId: 'HG-2024-10262',
    status: 'alta',
    needsAttention: false,
  },
  {
    id: 'p-006',
    name: 'Carlos Eduardo Méndez',
    patientId: 'HG-2024-10271',
    status: 'estable',
    needsAttention: false,
  },
];

export const PatientsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(MOCK_PATIENT.patient.id);

  const patients: PatientRow[] = useMemo(
    () => [
      {
        id: MOCK_PATIENT.patient.id,
        name: MOCK_PATIENT.patient.nombre,
        patientId: MOCK_PATIENT.patient.expedienteExternoId,
        status: 'estable' as const,
        needsAttention: false,
      },
      ...EXTRA_PATIENTS,
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q)
    );
  }, [patients, query]);

  const handleOpen = (id: string) => {
    setSelectedId(id);
    if (id === MOCK_PATIENT.patient.id) {
      navigate('/medical-record/history');
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            <Users size={12} strokeWidth={2} aria-hidden="true" />
            Pacientes
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Gestión de pacientes
          </h1>
          <p className="text-sm text-text-muted">
            {patients.length}{' '}
            {patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'} en tu cartera
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center h-9 w-64 rounded-lg border border-border-subtle bg-surface focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-colors">
            <span className="pl-3 text-text-subtle flex items-center">
              <Search size={14} strokeWidth={2} aria-hidden="true" />
            </span>
            <input
              type="search"
              placeholder="Buscar por nombre o expediente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-0 bg-transparent border-0 text-sm text-text-primary placeholder-text-subtle px-2 focus:outline-none focus:ring-0"
            />
          </label>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
            Nuevo paciente
          </button>
        </div>
      </header>

      <section
        aria-label="Lista de pacientes"
        className="rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden"
      >
        <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between gap-3 bg-surface-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
          <span className="text-[11px] text-text-subtle tracking-tight">
            Haz clic en un paciente para abrir su historial
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">
            Sin coincidencias para &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {filtered.map((p) => (
              <li key={p.id}>
                <PatientCard
                  name={p.name}
                  patientId={p.patientId}
                  status={p.status}
                  needsAttention={p.needsAttention}
                  selected={selectedId === p.id}
                  onClick={() => handleOpen(p.id)}
                  className="rounded-none"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};
