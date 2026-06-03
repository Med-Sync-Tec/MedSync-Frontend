import React, { forwardRef, useMemo } from 'react';
import {
  CalendarClock,
  Files,
  IdCard,
  UserRound,
} from 'lucide-react';
import type { Expediente, Patient, PatientConsultaLite } from '@features/patients/types';
import {
  calculateAge,
  daysBetween,
  formatDate,
  formatDateShort,
  formatRelative,
  formatRelativeFromNow,
  getInitials,
  parseDate,
} from '@features/patients/utils';

interface PatientDetailCardProps extends React.HTMLAttributes<HTMLElement> {
  patient: Patient;
  expediente?: Expediente;
  consultas: PatientConsultaLite[];
  lastActivityAuthor?: string;
  lastActivityAt?: string;
}

const CARD_STYLES =
  'rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden';

const SECTION_TITLE_STYLES =
  'text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted';

const ROW_STYLES =
  'flex items-center justify-between gap-3 px-4 py-2 text-[13px]';

export const PatientDetailCard = forwardRef<HTMLElement, PatientDetailCardProps>(
  function PatientDetailCard(
    {
      patient,
      expediente,
      consultas,
      lastActivityAuthor,
      lastActivityAt,
      className = '',
      ...rest
    },
    ref
  ) {
    const age = useMemo(() => calculateAge(patient.fechaNacimiento), [patient.fechaNacimiento]);

    const sortedConsultas = useMemo(
      () =>
        [...consultas].sort((a, b) => {
          const da = parseDate(a.fecha)?.getTime() ?? 0;
          const db = parseDate(b.fecha)?.getTime() ?? 0;
          return db - da;
        }),
      [consultas]
    );

    const ultima = sortedConsultas[0];
    const ultimaDate = ultima ? parseDate(ultima.fecha) : null;
    const diasDesdeUltima = ultimaDate ? daysBetween(ultimaDate, new Date()) : null;

    const initials = getInitials(patient.nombre);

    return (
      <article ref={ref} className={`${CARD_STYLES} ${className}`} {...rest}>
        <header className="px-5 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <span
                className="inline-flex items-center justify-center w-11 h-11 rounded-full text-sm font-semibold tracking-tight bg-primary-subtle text-primary"
                aria-label={`${patient.nombre} · ${patient.activo ? 'Activo' : 'Inactivo'}`}
              >
                {initials}
              </span>
              <span
                aria-hidden="true"
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-surface ${
                  patient.activo ? 'bg-status-stable-ring' : 'bg-text-subtle'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold tracking-tight text-text-primary leading-tight">
                {patient.nombre}
              </h2>
              <p className="mt-0.5 text-xs text-text-muted tracking-tight">
                <span>{age !== null ? `${age} años` : 'Edad n/d'}</span>
                <span aria-hidden="true" className="mx-1.5 text-text-subtle">·</span>
                <span>{patient.genero}</span>
                <span aria-hidden="true" className="mx-1.5 text-text-subtle">·</span>
                <span className={patient.activo ? 'text-status-stable font-medium' : 'text-text-muted font-medium'}>
                  {patient.activo ? 'Activo' : 'Inactivo'}
                </span>
              </p>
              <p className="mt-1 font-mono text-[11px] text-text-subtle tracking-tight truncate">
                #{patient.expedienteExternoId}
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="patient-registro">
          <div className="flex items-center gap-2 px-5 pt-4 pb-2">
            <IdCard size={12} strokeWidth={2} aria-hidden="true" className="text-text-subtle" />
            <h3 id="patient-registro" className={SECTION_TITLE_STYLES}>
              Registro
            </h3>
          </div>
          <dl className="divide-y divide-border-subtle px-1 pb-1">
            <div className={ROW_STYLES}>
              <dt className="text-text-muted tracking-tight">Expediente externo</dt>
              <dd className="font-mono font-medium text-text-primary tracking-tight truncate">
                {patient.expedienteExternoId}
              </dd>
            </div>
            {expediente && (
              <div className={ROW_STYLES}>
                <dt className="text-text-muted tracking-tight">Expediente hospital</dt>
                <dd className="font-mono font-medium text-text-primary tracking-tight truncate">
                  {expediente.id}
                </dd>
              </div>
            )}
            <div className={ROW_STYLES}>
              <dt className="text-text-muted tracking-tight">Nacimiento</dt>
              <dd className="font-medium text-text-primary tracking-tight">
                {formatDate(patient.fechaNacimiento)}
              </dd>
            </div>
            <div className={ROW_STYLES}>
              <dt className="text-text-muted tracking-tight">Alta</dt>
              <dd className="font-medium text-text-primary tracking-tight">
                {formatDate(patient.createdAt)}
              </dd>
            </div>
            <div className={ROW_STYLES}>
              <dt className="text-text-muted tracking-tight">Actualizado</dt>
              <dd className="font-medium text-text-primary tracking-tight">
                {formatDateShort(patient.updatedAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="patient-resumen"
          className="mt-1 border-t border-border-subtle bg-surface-subtle"
        >
          <div className="flex items-center gap-2 px-5 pt-4 pb-3">
            <UserRound size={12} strokeWidth={2} aria-hidden="true" className="text-text-subtle" />
            <h3 id="patient-resumen" className={SECTION_TITLE_STYLES}>
              Resumen clínico
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border-subtle border-y border-border-subtle">
            <div className="bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-1.5 text-text-subtle">
                <Files size={11} strokeWidth={2} aria-hidden="true" />
                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold">Consultas</p>
              </div>
              <p className="mt-1 text-xl font-semibold tracking-tight text-text-primary tabular-nums">
                {consultas.length}
              </p>
              <p className="mt-0.5 text-[11px] text-text-subtle tracking-tight">
                {sortedConsultas.length > 0
                  ? `Desde ${formatDateShort(sortedConsultas[sortedConsultas.length - 1]?.fecha)}`
                  : 'Sin historial'}
              </p>
            </div>
            <div className="bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-1.5 text-text-subtle">
                <CalendarClock size={11} strokeWidth={2} aria-hidden="true" />
                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold">Última</p>
              </div>
              <p className="mt-1 text-xl font-semibold tracking-tight text-text-primary tabular-nums">
                {ultima ? formatDateShort(ultima.fecha) : '—'}
              </p>
              <p className="mt-0.5 text-[11px] text-text-subtle tracking-tight">
                {diasDesdeUltima !== null ? formatRelative(diasDesdeUltima) : 'Sin consultas'}
              </p>
            </div>
          </div>
        </section>


        <footer className="px-5 py-3 flex items-start gap-2 border-t border-border-subtle bg-surface-subtle">
          <span
            aria-hidden="true"
            className="mt-1 w-1 h-1 rounded-full bg-status-stable-ring shrink-0 medsync-pulse-dot"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-subtle">
              Actividad
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted leading-snug">
              {lastActivityAuthor ? (
                <>
                  Última edición por <span className="text-text-primary font-medium">{lastActivityAuthor}</span>
                </>
              ) : (
                <>Última actualización del expediente</>
              )}
              {(lastActivityAt || patient.updatedAt) && (
                <>
                  <span className="text-text-subtle"> · </span>
                  <time
                    dateTime={lastActivityAt ?? patient.updatedAt}
                    className="tabular-nums"
                  >
                    {formatRelativeFromNow(lastActivityAt ?? patient.updatedAt)}
                  </time>
                </>
              )}
            </p>
          </div>
        </footer>
      </article>
    );
  }
);
