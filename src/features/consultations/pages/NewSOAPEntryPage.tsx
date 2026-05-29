import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@ui/buttons/Button';
import { Input } from '@ui/inputs/Input';
import { Textarea } from '@ui/inputs/Textarea';
import { SOAPSection } from '@ui/cards/SOAPSection';
import { Alert } from '@ui/feedback/Alert';
import { ApiError } from '@lib/http/errors';
import { usePatient } from '@features/patients/queries';
import { useCreateConsulta } from '@features/consultations/queries';
import {
  CreateConsultaInputSchema,
  type CreateConsultaInput,
  type SOAPDictationResult,
} from '@features/consultations/schemas';
import { DictationButton } from '@features/consultations/components/DictationButton';

type FormState = {
  fecha: string;
  motivoConsulta: string;
  subjetivo: string;
  objetivo: string;
  evaluacion: string;
  diagnostico: string;
  plan: string;
  prescripcion: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function nowDatetimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toBackendFecha(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

const EMPTY_FORM: FormState = {
  fecha: nowDatetimeLocal(),
  motivoConsulta: '',
  subjetivo: '',
  objetivo: '',
  evaluacion: '',
  diagnostico: '',
  plan: '',
  prescripcion: '',
};

export const NewSOAPEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  const patientQuery = usePatient(patientId);
  const createMutation = useCreateConsulta(patientId ?? '');

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goToHistory = useMemo(
    () => () => {
      if (patientId) {
        navigate(`/patients/${patientId}/history`);
      } else {
        navigate('/doctor/patients');
      }
    },
    [navigate, patientId],
  );

  if (!patientId) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 text-center">
          <h1 className="text-lg font-semibold text-text-primary">Paciente no especificado</h1>
          <p className="mt-1 text-sm text-text-muted">
            La URL no contiene un identificador de paciente válido.
          </p>
          <button
            type="button"
            onClick={() => navigate('/doctor/patients')}
            className="mt-4 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Ir a pacientes
          </button>
        </div>
      </main>
    );
  }

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const candidate = {
      fecha: toBackendFecha(form.fecha),
      motivoConsulta: form.motivoConsulta,
      subjetivo: form.subjetivo,
      objetivo: form.objetivo,
      evaluacion: form.evaluacion,
      diagnostico: form.diagnostico,
      plan: form.plan,
      prescripcion: form.prescripcion,
    };

    const parsed = CreateConsultaInputSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const payload: CreateConsultaInput = parsed.data;

    createMutation.mutate(payload, {
      onSuccess: () => {
        goToHistory();
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.isValidation && err.fieldErrors.length > 0) {
            const fieldErrors: FieldErrors = {};
            for (const fe of err.fieldErrors) {
              const key = fe.field as keyof FormState;
              if (!fieldErrors[key]) fieldErrors[key] = fe.message;
            }
            setErrors(fieldErrors);
            setSubmitError('Revisa los campos marcados.');
            return;
          }
          setSubmitError(err.message);
          return;
        }
        setSubmitError('No pudimos guardar la consulta. Intenta de nuevo.');
      },
    });
  };

  const patientName = patientQuery.data?.nombre ?? (patientQuery.isLoading ? 'Cargando…' : 'Paciente');
  const expedienteId = patientQuery.data?.expedienteExternoId ?? '—';
  const isSaving = createMutation.isPending;

  return (
    <>
      {submitError && (
        <Alert
          type="error"
          message={submitError}
          onClose={() => setSubmitError(null)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24"
        noValidate
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nueva Entrada Clínica (SOAP)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Paciente:{' '}
              <span className="text-gray-900 dark:text-gray-200 font-bold">{patientName}</span> •
              Expediente: {expedienteId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToHistory}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              Historial
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-surface p-5">
          <Input
            label="Fecha y hora de la consulta"
            type="datetime-local"
            value={form.fecha}
            onChange={(e) => update('fecha', e.target.value)}
            error={errors.fecha}
            id="fecha"
            required
          />
        </div>

        <div className="space-y-6">
          <DictationButton
            onResult={(fields: SOAPDictationResult) => {
              const fieldMap: Array<[keyof SOAPDictationResult, keyof FormState]> = [
                ['motivoConsulta', 'motivoConsulta'],
                ['subjetivo', 'subjetivo'],
                ['objetivo', 'objetivo'],
                ['evaluacion', 'evaluacion'],
                ['diagnostico', 'diagnostico'],
                ['plan', 'plan'],
                ['prescripcion', 'prescripcion'],
              ];
              fieldMap.forEach(([src, dest]) => {
                const value = fields[src];
                if (value) update(dest, value);
              });
            }}
          />

          <SOAPSection letter="S" title="Subjetivo" subtitle="Motivo y sintomatología">
            <div className="space-y-4">
              <Input
                label="Motivo de consulta"
                placeholder="Ej. Dolor abdominal de 3 días de evolución"
                value={form.motivoConsulta}
                onChange={(e) => update('motivoConsulta', e.target.value)}
                error={errors.motivoConsulta}
                id="motivoConsulta"
              />
              <Textarea
                label="Síntomas, antecedentes y preocupaciones del paciente"
                placeholder="Describa el motivo de consulta, síntomas actuales, antecedentes y preocupaciones del paciente..."
                rows={5}
                value={form.subjetivo}
                onChange={(e) => update('subjetivo', e.target.value)}
                error={errors.subjetivo}
                id="subjetivo"
              />
            </div>
          </SOAPSection>

          <SOAPSection letter="O" title="Objetivo" subtitle="Hallazgos del examen físico">
            <Textarea
              placeholder="Detalle los hallazgos observados durante la exploración..."
              rows={5}
              value={form.objetivo}
              onChange={(e) => update('objetivo', e.target.value)}
              error={errors.objetivo}
              id="objetivo"
            />
          </SOAPSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SOAPSection letter="A" title="Análisis" subtitle="Evaluación y diagnóstico">
              <div className="space-y-4">
                <Textarea
                  label="Evaluación clínica"
                  placeholder="Razonamiento clínico, interpretación de hallazgos..."
                  rows={4}
                  value={form.evaluacion}
                  onChange={(e) => update('evaluacion', e.target.value)}
                  error={errors.evaluacion}
                  id="evaluacion"
                />
                <Textarea
                  label="Diagnóstico"
                  placeholder="Diagnóstico presuntivo o definitivo..."
                  rows={3}
                  value={form.diagnostico}
                  onChange={(e) => update('diagnostico', e.target.value)}
                  error={errors.diagnostico}
                  id="diagnostico"
                />
              </div>
            </SOAPSection>

            <SOAPSection letter="P" title="Plan" subtitle="Tratamiento y seguimiento">
              <div className="space-y-4">
                <Textarea
                  label="Plan terapéutico"
                  placeholder="Estudios complementarios, interconsultas, seguimiento..."
                  rows={4}
                  value={form.plan}
                  onChange={(e) => update('plan', e.target.value)}
                  error={errors.plan}
                  id="plan"
                />
                <Textarea
                  label="Prescripción"
                  placeholder="Medicamentos, dosis, vía y duración..."
                  rows={3}
                  value={form.prescripcion}
                  onChange={(e) => update('prescripcion', e.target.value)}
                  error={errors.prescripcion}
                  id="prescripcion"
                />
              </div>
            </SOAPSection>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="danger"
            onClick={goToHistory}
            disabled={isSaving}
            icon={<span className="material-symbols-outlined">delete</span>}
          >
            Cancelar y descartar
          </Button>

          <Button
            type="submit"
            className="px-8"
            isLoading={isSaving}
            icon={<span className="material-symbols-outlined">save</span>}
          >
            {isSaving ? 'Guardando…' : 'Guardar Entrada'}
          </Button>
        </div>
      </form>
    </>
  );
};
