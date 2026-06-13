import {
  BulkAddPacienteContextoInputSchema,
  CONTEXTO_TIPOS,
  ContextoTipoSchema,
  CreatePacienteContextoInputSchema,
  CreatePatientInputSchema,
  ExpedienteSchema,
  PacienteContextoSchema,
  PatientConsultaLiteSchema,
  PatientDetailSchema,
  PatientSchema,
} from './schemas';

const VALID_PATIENT = {
  id: 'p1',
  expedienteExternoId: 'HG-2024-001',
  nombre: 'María López',
  fechaNacimiento: '1990-05-10',
  genero: 'Femenino',
  medicoId: 'd1',
  activo: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const VALID_EXPEDIENTE = {
  id: 'e1',
  pacienteExternoId: 'HG-2024-001',
  doctorResponsableId: 'd1',
  createdAt: '2024-01-01T00:00:00Z',
};

const VALID_CONTEXTO = {
  id: 'c1',
  pacienteId: 'p1',
  tipo: 'enfermedad',
  valor: 'Hipertensión',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('PatientSchema', () => {
  it('parses a valid patient', () => {
    expect(PatientSchema.parse(VALID_PATIENT)).toEqual(VALID_PATIENT);
  });

  it('transforms a null genero into an empty string', () => {
    const parsed = PatientSchema.parse({ ...VALID_PATIENT, genero: null });

    expect(parsed.genero).toBe('');
  });

  it('transforms a missing genero into an empty string', () => {
    const withoutGenero = { ...VALID_PATIENT, genero: undefined };

    const parsed = PatientSchema.parse(withoutGenero);

    expect(parsed.genero).toBe('');
  });

  it('rejects a patient missing required fields', () => {
    const withoutNombre: Record<string, unknown> = { ...VALID_PATIENT };
    delete withoutNombre.nombre;

    expect(PatientSchema.safeParse(withoutNombre).success).toBe(false);
  });

  it('rejects a non-boolean activo', () => {
    expect(PatientSchema.safeParse({ ...VALID_PATIENT, activo: 'yes' }).success).toBe(false);
  });
});

describe('ExpedienteSchema', () => {
  it('parses a valid expediente', () => {
    expect(ExpedienteSchema.parse(VALID_EXPEDIENTE)).toEqual(VALID_EXPEDIENTE);
  });

  it('rejects an expediente missing the doctor', () => {
    const rest: Record<string, unknown> = { ...VALID_EXPEDIENTE };
    delete rest.doctorResponsableId;

    expect(ExpedienteSchema.safeParse(rest).success).toBe(false);
  });
});

describe('PatientConsultaLiteSchema', () => {
  it('parses a fully populated consulta', () => {
    const parsed = PatientConsultaLiteSchema.parse({
      id: 'co1',
      fecha: '2024-02-01',
      diagnostico: 'Gripe',
      prescripcion: 'Paracetamol',
    });

    expect(parsed).toEqual({
      id: 'co1',
      fecha: '2024-02-01',
      diagnostico: 'Gripe',
      prescripcion: 'Paracetamol',
    });
  });

  it('defaults null diagnostico and prescripcion to empty strings', () => {
    const parsed = PatientConsultaLiteSchema.parse({
      id: 'co1',
      fecha: '2024-02-01',
      diagnostico: null,
      prescripcion: null,
    });

    expect(parsed.diagnostico).toBe('');
    expect(parsed.prescripcion).toBe('');
  });

  it('defaults missing diagnostico and prescripcion to empty strings', () => {
    const parsed = PatientConsultaLiteSchema.parse({ id: 'co1', fecha: '2024-02-01' });

    expect(parsed.diagnostico).toBe('');
    expect(parsed.prescripcion).toBe('');
  });
});

describe('PatientDetailSchema', () => {
  it('parses a detail with expediente and consultas', () => {
    const parsed = PatientDetailSchema.parse({
      patient: VALID_PATIENT,
      expediente: VALID_EXPEDIENTE,
      consultas: [{ id: 'co1', fecha: '2024-02-01' }],
    });

    expect(parsed.expediente).toEqual(VALID_EXPEDIENTE);
    expect(parsed.consultas).toHaveLength(1);
  });

  it('accepts a detail without expediente', () => {
    const parsed = PatientDetailSchema.parse({
      patient: VALID_PATIENT,
      consultas: [],
    });

    expect(parsed.expediente).toBeUndefined();
  });

  it('rejects a detail missing consultas', () => {
    expect(PatientDetailSchema.safeParse({ patient: VALID_PATIENT }).success).toBe(false);
  });
});

describe('CreatePatientInputSchema', () => {
  const VALID_INPUT = {
    expedienteExternoId: 'HG-2024-001',
    nombre: 'María López',
    fechaNacimiento: '1990-05-10',
    genero: 'Femenino',
  };

  it('parses a valid input', () => {
    expect(CreatePatientInputSchema.parse(VALID_INPUT)).toEqual(VALID_INPUT);
  });

  it('trims string fields', () => {
    const parsed = CreatePatientInputSchema.parse({
      ...VALID_INPUT,
      nombre: '  María López  ',
      expedienteExternoId: ' HG-1 ',
    });

    expect(parsed.nombre).toBe('María López');
    expect(parsed.expedienteExternoId).toBe('HG-1');
  });

  it('rejects an empty nombre with "Requerido"', () => {
    const result = CreatePatientInputSchema.safeParse({ ...VALID_INPUT, nombre: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Requerido');
    }
  });

  it('rejects a nombre longer than 200 characters', () => {
    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      nombre: 'a'.repeat(201),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Máximo 200 caracteres');
    }
  });

  it('rejects an expedienteExternoId longer than 100 characters', () => {
    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      expedienteExternoId: 'x'.repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a non-ISO fechaNacimiento with the format message', () => {
    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      fechaNacimiento: '10/05/1990',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Usa formato AAAA-MM-DD');
    }
  });

  it('rejects an ISO-looking but invalid calendar date', () => {
    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      fechaNacimiento: '1990-99-99',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'La fecha debe ser pasada y la edad menor a 150 años',
      );
    }
  });

  it('rejects a future fechaNacimiento', () => {
    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      fechaNacimiento: '2999-01-01',
    });

    expect(result.success).toBe(false);
  });

  it("rejects today's date as fechaNacimiento", () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;

    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      fechaNacimiento: today,
    });

    expect(result.success).toBe(false);
  });

  it('rejects an age above 150 years', () => {
    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      fechaNacimiento: '1800-01-01',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty genero with the select message', () => {
    const result = CreatePatientInputSchema.safeParse({ ...VALID_INPUT, genero: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Debes seleccionar un género');
    }
  });

  it('rejects a genero longer than 20 characters', () => {
    const result = CreatePatientInputSchema.safeParse({
      ...VALID_INPUT,
      genero: 'g'.repeat(21),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Máximo 20 caracteres');
    }
  });
});

describe('ContextoTipoSchema', () => {
  it.each(CONTEXTO_TIPOS)('accepts "%s"', (tipo) => {
    expect(ContextoTipoSchema.parse(tipo)).toBe(tipo);
  });

  it('rejects an unknown tipo', () => {
    expect(ContextoTipoSchema.safeParse('alergia').success).toBe(false);
  });
});

describe('PacienteContextoSchema', () => {
  it('parses a valid contexto', () => {
    expect(PacienteContextoSchema.parse(VALID_CONTEXTO)).toEqual(VALID_CONTEXTO);
  });

  it('rejects a contexto with an invalid tipo', () => {
    expect(
      PacienteContextoSchema.safeParse({ ...VALID_CONTEXTO, tipo: 'otro' }).success,
    ).toBe(false);
  });
});

describe('CreatePacienteContextoInputSchema', () => {
  it('parses and trims a valid input', () => {
    const parsed = CreatePacienteContextoInputSchema.parse({
      tipo: 'sintoma',
      valor: '  Dolor de cabeza  ',
    });

    expect(parsed).toEqual({ tipo: 'sintoma', valor: 'Dolor de cabeza' });
  });

  it('rejects an empty valor with "Requerido"', () => {
    const result = CreatePacienteContextoInputSchema.safeParse({
      tipo: 'sintoma',
      valor: '   ',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Requerido');
    }
  });

  it('rejects a valor longer than 500 characters', () => {
    const result = CreatePacienteContextoInputSchema.safeParse({
      tipo: 'sintoma',
      valor: 'x'.repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Máximo 500 caracteres');
    }
  });
});

describe('BulkAddPacienteContextoInputSchema', () => {
  const entry = { tipo: 'enfermedad', valor: 'Diabetes' };

  it('parses a valid batch', () => {
    const parsed = BulkAddPacienteContextoInputSchema.parse({ entries: [entry] });

    expect(parsed.entries).toHaveLength(1);
  });

  it('rejects an empty batch', () => {
    const result = BulkAddPacienteContextoInputSchema.safeParse({ entries: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Debes seleccionar al menos una entrada');
    }
  });

  it('rejects more than 50 entries', () => {
    const result = BulkAddPacienteContextoInputSchema.safeParse({
      entries: Array.from({ length: 51 }, () => entry),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Máximo 50 entradas por llamada');
    }
  });

  it('rejects a batch containing an invalid entry', () => {
    const result = BulkAddPacienteContextoInputSchema.safeParse({
      entries: [entry, { tipo: 'enfermedad', valor: '' }],
    });

    expect(result.success).toBe(false);
  });
});
